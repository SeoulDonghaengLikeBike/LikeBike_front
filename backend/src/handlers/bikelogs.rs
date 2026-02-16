use std::sync::Arc;

use axum::extract::{Multipart, Request, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{Local, Utc};

use crate::error::AppError;
use crate::middleware::{extract_user_id, extract_user_id_from_headers};
use crate::models::{ApiResponse, BikeCountResponse, BikeLog};
use crate::AppState;

/// GET /users/bike-logs
async fn get_bike_logs(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<BikeLog>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let db = state.db.lock().await;

    let mut stmt = db.prepare(
        "SELECT id, description, bike_photo_url, safety_gear_photo_url, started_at, created_at, verification_status, verified_at, points_awarded, admin_notes FROM bike_logs WHERE user_id = ?1 ORDER BY created_at DESC",
    )?;

    let logs: Vec<BikeLog> = stmt
        .query_map([user_id], |row| {
            Ok(BikeLog {
                id: row.get::<_, i64>(0)?,
                description: row.get::<_, String>(1)?,
                bike_photo_url: row.get::<_, String>(2)?,
                safety_gear_photo_url: row.get::<_, String>(3)?,
                started_at: row.get::<_, String>(4)?,
                created_at: row.get::<_, String>(5)?,
                verification_status: row.get::<_, String>(6)?,
                verified_at: row.get::<_, Option<String>>(7)?,
                points_awarded: row.get::<_, i64>(8)?,
                admin_notes: row.get::<_, Option<String>>(9)?,
            })
        })?
        .filter_map(|r| r.ok())
        .collect();

    Ok(Json(ApiResponse::ok(logs)))
}

/// POST /users/bike-logs (multipart)
async fn create_bike_log(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<ApiResponse<BikeLog>>), AppError> {
    let user_id = extract_user_id_from_headers(&headers, &state.jwt_secret)?;

    let mut bike_photo_path = String::new();
    let mut safety_photo_path = String::new();
    let mut description = "자전거 타기 인증".to_string();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Field error: {}", e)))?
    {
        let name = field.name().unwrap_or("").to_string();

        match name.as_str() {
            "bike_photo" => {
                bike_photo_path = save_upload(&state.upload_dir, "bike", field).await?;
            }
            "safety_gear_photo" => {
                safety_photo_path = save_upload(&state.upload_dir, "safety", field).await?;
            }
            "description" => {
                description = field
                    .text()
                    .await
                    .map_err(|e| AppError::BadRequest(e.to_string()))?;
            }
            _ => {}
        }
    }

    if bike_photo_path.is_empty() || safety_photo_path.is_empty() {
        return Err(AppError::BadRequest(
            "Both bike_photo and safety_gear_photo are required".to_string(),
        ));
    }

    let now = Utc::now().to_rfc3339();
    let db = state.db.lock().await;

    db.execute(
        "INSERT INTO bike_logs (user_id, description, bike_photo_url, safety_gear_photo_url, started_at, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
        rusqlite::params![user_id, description, bike_photo_path, safety_photo_path, now],
    )?;

    let id = db.last_insert_rowid();
    let log = BikeLog {
        id,
        description,
        bike_photo_url: bike_photo_path,
        safety_gear_photo_url: safety_photo_path,
        started_at: now.clone(),
        created_at: now,
        verification_status: "pending".to_string(),
        verified_at: None,
        points_awarded: 0,
        admin_notes: None,
    };

    Ok((StatusCode::CREATED, Json(ApiResponse::created(vec![log]))))
}

/// GET /users/bike-logs/today/count
async fn get_today_count(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<BikeCountResponse>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let today = Local::now().format("%Y-%m-%d").to_string();
    let db = state.db.lock().await;

    let count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM bike_logs WHERE user_id = ?1 AND DATE(created_at) = ?2",
            rusqlite::params![user_id, today],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(Json(ApiResponse::ok(vec![BikeCountResponse { count }])))
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users/bike-logs", get(get_bike_logs).post(create_bike_log))
        .route("/users/bike-logs/today/count", get(get_today_count))
}

async fn save_upload(
    upload_dir: &str,
    prefix: &str,
    field: axum::extract::multipart::Field<'_>,
) -> Result<String, AppError> {
    let filename = format!("{}_{}.jpg", prefix, uuid::Uuid::new_v4());
    let filepath = format!("{}/{}", upload_dir, filename);

    let data = field
        .bytes()
        .await
        .map_err(|e| AppError::Internal(format!("Failed to read file: {}", e)))?;

    tokio::fs::write(&filepath, &data)
        .await
        .map_err(|e| AppError::Internal(format!("Failed to save file: {}", e)))?;

    Ok(format!("/uploads/{}", filename))
}
