use axum::extract::Request;
use axum::http::header::AUTHORIZATION;
use axum::http::HeaderMap;
use jsonwebtoken::{decode, DecodingKey, Validation};

use crate::error::AppError;
use crate::models::JwtClaims;

/// Extract user_id from Bearer token in the Authorization header
pub fn extract_user_id(req: &Request, jwt_secret: &str) -> Result<i64, AppError> {
    extract_user_id_from_headers(req.headers(), jwt_secret)
}

/// Extract user_id from HeaderMap (useful when Request is not available)
pub fn extract_user_id_from_headers(
    headers: &HeaderMap,
    jwt_secret: &str,
) -> Result<i64, AppError> {
    let header = headers
        .get(AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?;

    let token = header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::Unauthorized("Invalid authorization format".to_string()))?;

    let data = decode::<JwtClaims>(
        token,
        &DecodingKey::from_secret(jwt_secret.as_bytes()),
        &Validation::default(),
    )?;

    if data.claims.token_type != "access" {
        return Err(AppError::Unauthorized("Invalid token type".to_string()));
    }

    Ok(data.claims.sub)
}

/// Create an access token (15 min expiry)
pub fn create_access_token(user_id: i64, secret: &str) -> Result<String, AppError> {
    let now = chrono::Utc::now().timestamp() as usize;
    let claims = JwtClaims {
        sub: user_id,
        iat: now,
        exp: now + 15 * 60, // 15 minutes
        token_type: "access".to_string(),
    };
    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}

/// Create a refresh token (7 day expiry)
pub fn create_refresh_token(user_id: i64, secret: &str) -> Result<String, AppError> {
    let now = chrono::Utc::now().timestamp() as usize;
    let claims = JwtClaims {
        sub: user_id,
        iat: now,
        exp: now + 7 * 24 * 60 * 60, // 7 days
        token_type: "refresh".to_string(),
    };
    let token = jsonwebtoken::encode(
        &jsonwebtoken::Header::default(),
        &claims,
        &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}
