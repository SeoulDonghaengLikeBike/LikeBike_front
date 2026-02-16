use std::sync::Arc;

use axum::extract::{Request, State};
use axum::http::StatusCode;
use axum::routing::post;
use axum::{Json, Router};
use chrono::Utc;
use serde::Deserialize;

use crate::error::AppError;
use crate::middleware::{create_access_token, create_refresh_token, extract_user_id};
use crate::models::{ApiResponse, OAuthRequest, OAuthResponse, RefreshResponse};
use crate::AppState;

/// POST /users - Kakao OAuth login / register
async fn oauth_login(
    State(state): State<Arc<AppState>>,
    Json(body): Json<OAuthRequest>,
) -> Result<(StatusCode, Json<ApiResponse<OAuthResponse>>), AppError> {
    // Exchange code for Kakao access token
    let kakao_user = fetch_kakao_user(&state, &body.code).await?;

    let db = state.db.lock().await;

    // Find or create user
    let user_id: i64 = match db.query_row(
        "SELECT id FROM users WHERE kakao_id = ?1",
        [&kakao_user.kakao_id],
        |row| row.get(0),
    ) {
        Ok(id) => id,
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            let now = Utc::now().to_rfc3339();
            db.execute(
                "INSERT INTO users (kakao_id, username, email, profile_image_url, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![
                    kakao_user.kakao_id,
                    kakao_user.nickname,
                    kakao_user.email,
                    kakao_user.profile_image,
                    now,
                ],
            )?;
            db.last_insert_rowid()
        }
        Err(e) => return Err(e.into()),
    };

    // Create tokens
    let access_token = create_access_token(user_id, &state.jwt_secret)?;
    let refresh_token = create_refresh_token(user_id, &state.jwt_secret)?;

    // Store refresh token
    let expires_at = (Utc::now() + chrono::Duration::days(7)).to_rfc3339();
    db.execute(
        "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?1, ?2, ?3)",
        rusqlite::params![user_id, refresh_token, expires_at],
    )?;

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::created(vec![OAuthResponse { access_token }])),
    ))
}

/// POST /users/refresh - Refresh access token
async fn refresh_token(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<RefreshResponse>>, AppError> {
    // Try to get user from current access token (even if expired, we can still try)
    // The frontend sends the current token, we extract user_id and issue a new one
    let user_id = extract_user_id(&req, &state.jwt_secret).map_err(|_| {
        AppError::Unauthorized("Cannot refresh - invalid token".to_string())
    })?;

    let new_access_token = create_access_token(user_id, &state.jwt_secret)?;

    Ok(Json(ApiResponse::ok(vec![RefreshResponse {
        access_token: new_access_token,
    }])))
}

/// POST /users/logout
async fn logout(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<serde_json::Value>>, AppError> {
    if let Ok(user_id) = extract_user_id(&req, &state.jwt_secret) {
        let db = state.db.lock().await;
        let _ = db.execute(
            "DELETE FROM refresh_tokens WHERE user_id = ?1",
            [user_id],
        );
    }

    Ok(Json(ApiResponse::ok(vec![serde_json::json!({"success": true})])))
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/users", post(oauth_login))
        .route("/users/refresh", post(refresh_token))
        .route("/users/logout", post(logout))
}

// ==================== Kakao OAuth Helpers ====================

struct KakaoUser {
    kakao_id: String,
    nickname: String,
    email: String,
    profile_image: Option<String>,
}

#[derive(Deserialize)]
struct KakaoTokenResponse {
    access_token: String,
}

#[derive(Deserialize)]
struct KakaoUserResponse {
    id: i64,
    kakao_account: Option<KakaoAccount>,
    properties: Option<KakaoProperties>,
}

#[derive(Deserialize)]
struct KakaoAccount {
    email: Option<String>,
}

#[derive(Deserialize)]
struct KakaoProperties {
    nickname: Option<String>,
    profile_image: Option<String>,
}

async fn fetch_kakao_user(state: &AppState, code: &str) -> Result<KakaoUser, AppError> {
    // If Kakao credentials not configured, create a demo user
    if state.kakao_client_id.is_empty() {
        return Ok(KakaoUser {
            kakao_id: format!("demo_{}", uuid::Uuid::new_v4()),
            nickname: "데모유저".to_string(),
            email: "demo@likebike.kr".to_string(),
            profile_image: None,
        });
    }

    let client = reqwest::Client::new();

    // Exchange code for token
    let token_res = client
        .post("https://kauth.kakao.com/oauth/token")
        .form(&[
            ("grant_type", "authorization_code"),
            ("client_id", &state.kakao_client_id),
            ("client_secret", &state.kakao_client_secret),
            ("code", code),
        ])
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Kakao token request failed: {}", e)))?;

    let token_data: KakaoTokenResponse = token_res
        .json()
        .await
        .map_err(|e| AppError::Internal(format!("Kakao token parse failed: {}", e)))?;

    // Fetch user info
    let user_res = client
        .get("https://kapi.kakao.com/v2/user/me")
        .header("Authorization", format!("Bearer {}", token_data.access_token))
        .send()
        .await
        .map_err(|e| AppError::Internal(format!("Kakao user request failed: {}", e)))?;

    let user_data: KakaoUserResponse = user_res
        .json()
        .await
        .map_err(|e| AppError::Internal(format!("Kakao user parse failed: {}", e)))?;

    Ok(KakaoUser {
        kakao_id: user_data.id.to_string(),
        nickname: user_data
            .properties
            .as_ref()
            .and_then(|p| p.nickname.clone())
            .unwrap_or_else(|| "유저".to_string()),
        email: user_data
            .kakao_account
            .as_ref()
            .and_then(|a| a.email.clone())
            .unwrap_or_default(),
        profile_image: user_data
            .properties
            .as_ref()
            .and_then(|p| p.profile_image.clone()),
    })
}
