use std::sync::Arc;

use axum::extract::{Path, Request, State};
use axum::routing::{get, post};
use axum::{Json, Router};
use chrono::{Local, Utc};

use crate::db;
use crate::error::AppError;
use crate::middleware::extract_user_id;
use crate::models::{
    ApiResponse, Quiz, QuizAttemptRequest, QuizAttemptResponse, QuizStatusResponse,
};
use crate::AppState;

/// GET /quizzes - Get all quizzes
async fn get_quizzes(
    State(state): State<Arc<AppState>>,
) -> Result<Json<ApiResponse<Quiz>>, AppError> {
    let db = state.db.lock().await;

    let mut stmt = db.prepare(
        "SELECT id, question, answers, correct_answer, explanation, hint_link, hint_description, display_date, quiz_type FROM quizzes ORDER BY display_date DESC",
    )?;

    let quizzes: Vec<Quiz> = stmt
        .query_map([], |row| {
            let answers_str: String = row.get::<_, String>(2)?;
            let answers: Vec<String> =
                serde_json::from_str(&answers_str).unwrap_or_default();

            Ok(Quiz {
                id: row.get::<_, i64>(0)?,
                question: row.get::<_, String>(1)?,
                answers,
                correct_answer: row.get::<_, String>(3)?,
                explanation: row.get::<_, String>(4)?,
                hint_link: row.get::<_, String>(5)?,
                hint_description: row.get::<_, String>(6)?,
                display_date: row.get::<_, String>(7)?,
                quiz_type: row.get::<_, String>(8)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(Json(ApiResponse::ok(quizzes)))
}

/// POST /quizzes/:quiz_id/attempt - Attempt a quiz
async fn attempt_quiz(
    State(state): State<Arc<AppState>>,
    Path(quiz_id): Path<i64>,
    req: Request,
) -> Result<Json<ApiResponse<QuizAttemptResponse>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;

    let bytes = axum::body::to_bytes(req.into_body(), 1024 * 16)
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to read body: {}", e)))?;
    let body: QuizAttemptRequest =
        serde_json::from_slice(&bytes).map_err(|e| AppError::BadRequest(e.to_string()))?;

    let db = state.db.lock().await;

    // Get the correct answer
    let correct_answer: String = db
        .query_row(
            "SELECT correct_answer FROM quizzes WHERE id = ?1",
            [quiz_id],
            |row| row.get(0),
        )
        .map_err(|_| AppError::NotFound("Quiz not found".to_string()))?;

    let is_correct = body.answer.trim().eq_ignore_ascii_case(correct_answer.trim());
    let points_earned = if is_correct { 10 } else { 0 };
    let experience_earned = if is_correct { 10 } else { 0 };

    // Record attempt
    let now = Utc::now().to_rfc3339();
    db.execute(
        "INSERT INTO quiz_attempts (user_id, quiz_id, answer, is_correct, points_earned, experience_earned, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            user_id,
            quiz_id,
            body.answer.trim(),
            is_correct as i32,
            points_earned,
            experience_earned,
            now,
        ],
    )?;

    // Award points if correct
    if is_correct {
        db.execute(
            "UPDATE users SET experience_points = experience_points + ?1, points = points + ?1 WHERE id = ?2",
            rusqlite::params![points_earned, user_id],
        )?;

        // Update level
        let xp: i64 = db.query_row(
            "SELECT experience_points FROM users WHERE id = ?1",
            [user_id],
            |row| row.get(0),
        )?;
        let (level, level_name) = db::compute_level(xp);
        db.execute(
            "UPDATE users SET level = ?1, level_name = ?2 WHERE id = ?3",
            rusqlite::params![level, level_name, user_id],
        )?;

        // Record reward
        db.execute(
            "INSERT INTO rewards (user_id, experience_points, reward_reason, source_type, created_at) VALUES (?1, ?2, '퀴즈 정답', 'quiz', ?3)",
            rusqlite::params![user_id, points_earned, now],
        )?;
    }

    Ok(Json(ApiResponse::ok(vec![QuizAttemptResponse {
        is_correct,
        points_earned,
        experience_earned,
        reward_given: is_correct,
    }])))
}

/// GET /quizzes/today/status - Check if user attempted today's quiz
async fn get_quiz_status(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<QuizStatusResponse>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let db = state.db.lock().await;

    // Find today's quiz
    let quiz_id: Result<i64, _> = db.query_row(
        "SELECT id FROM quizzes WHERE display_date = ?1",
        [&today],
        |row| row.get(0),
    );

    let (attempted, is_correct) = match quiz_id {
        Ok(qid) => {
            match db.query_row(
                "SELECT is_correct FROM quiz_attempts WHERE user_id = ?1 AND quiz_id = ?2 ORDER BY created_at DESC LIMIT 1",
                rusqlite::params![user_id, qid],
                |row| row.get::<_, i32>(0),
            ) {
                Ok(correct) => (true, correct == 1),
                Err(_) => (false, false),
            }
        }
        Err(_) => (false, false),
    };

    Ok(Json(ApiResponse::ok(vec![QuizStatusResponse {
        attempted,
        is_correct,
    }])))
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/quizzes", get(get_quizzes))
        .route("/quizzes/{quiz_id}/attempt", post(attempt_quiz))
        .route("/quizzes/today/status", get(get_quiz_status))
}
