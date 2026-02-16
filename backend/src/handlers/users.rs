use std::sync::Arc;

use axum::extract::{Path, Request, State};
use axum::routing::{get, put};
use axum::{Json, Router};

use crate::db;
use crate::error::AppError;
use crate::middleware::extract_user_id;
use crate::models::{
    ApiResponse, LevelResponse, Reward, ScoreUpdateRequest, UserProfile,
};
use crate::AppState;

/// GET /users/profile
async fn get_profile(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<UserProfile>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let db = state.db.lock().await;

    let profile = db.query_row(
        "SELECT id, username, email, profile_image_url, experience_points, points, level, level_name, benefits, description, created_at FROM users WHERE id = ?1",
        [user_id],
        |row| {
            Ok(UserProfile {
                id: row.get::<_, i64>(0)?,
                username: row.get::<_, String>(1)?,
                email: row.get::<_, String>(2)?,
                profile_image_url: row.get::<_, Option<String>>(3)?,
                experience_points: row.get::<_, i64>(4)?,
                points: row.get::<_, i64>(5)?,
                level: row.get::<_, i64>(6)?,
                level_name: row.get::<_, String>(7)?,
                benefits: row.get::<_, String>(8)?,
                description: row.get::<_, String>(9)?,
                created_at: row.get::<_, String>(10)?,
            })
        },
    ).map_err(|_| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(ApiResponse::ok(vec![profile])))
}

/// GET /users/rewards
async fn get_rewards(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<Reward>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let db = state.db.lock().await;

    let mut stmt = db.prepare(
        "SELECT id, user_id, experience_points, reward_reason, source_type, created_at FROM rewards WHERE user_id = ?1 ORDER BY created_at DESC",
    )?;

    let rewards: Vec<Reward> = stmt
        .query_map([user_id], |row| {
            Ok(Reward {
                id: row.get::<_, i64>(0)?,
                user_id: row.get::<_, i64>(1)?,
                experience_points: row.get::<_, i64>(2)?,
                reward_reason: row.get::<_, String>(3)?,
                source_type: row.get::<_, String>(4)?,
                created_at: row.get::<_, String>(5)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(Json(ApiResponse::ok(rewards)))
}

/// PUT /users/score
async fn update_score(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;

    // Parse body from request
    let bytes = axum::body::to_bytes(req.into_body(), 1024 * 16)
        .await
        .map_err(|e| AppError::BadRequest(format!("Failed to read body: {}", e)))?;
    let body: ScoreUpdateRequest =
        serde_json::from_slice(&bytes).map_err(|e| AppError::BadRequest(e.to_string()))?;

    let db = state.db.lock().await;

    // Update user experience points
    db.execute(
        "UPDATE users SET experience_points = experience_points + ?1, points = points + ?1 WHERE id = ?2",
        rusqlite::params![body.experience_points, user_id],
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
    let now = chrono::Utc::now().to_rfc3339();
    db.execute(
        "INSERT INTO rewards (user_id, experience_points, reward_reason, source_type, created_at) VALUES (?1, ?2, ?3, 'manual', ?4)",
        rusqlite::params![user_id, body.experience_points, body.reward_reason, now],
    )?;

    Ok(Json(ApiResponse::ok(vec![
        serde_json::json!({"success": true}),
    ])))
}

/// GET /users/:id/level
async fn get_level(
    State(state): State<Arc<AppState>>,
    Path(user_id): Path<i64>,
) -> Result<Json<ApiResponse<LevelResponse>>, AppError> {
    let db = state.db.lock().await;

    let result = db.query_row(
        "SELECT level, level_name, experience_points FROM users WHERE id = ?1",
        [user_id],
        |row| {
            Ok(LevelResponse {
                level: row.get::<_, i64>(0)?,
                level_name: row.get::<_, String>(1)?,
                experience_points: row.get::<_, i64>(2)?,
            })
        },
    ).map_err(|_| AppError::NotFound("User not found".to_string()))?;

    Ok(Json(ApiResponse::ok(vec![result])))
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users/profile", get(get_profile))
        .route("/users/rewards", get(get_rewards))
        .route("/users/score", put(update_score))
        .route("/users/{user_id}/level", get(get_level))
}
