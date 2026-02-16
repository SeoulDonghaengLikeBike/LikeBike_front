mod db;
mod error;
mod handlers;
mod middleware;
mod models;
mod seed;

use axum::Router;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

pub struct AppState {
    pub db: Mutex<rusqlite::Connection>,
    pub jwt_secret: String,
    pub kakao_client_id: String,
    pub kakao_client_secret: String,
    pub upload_dir: String,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "likebike.db".to_string());
    let jwt_secret =
        std::env::var("JWT_SECRET").unwrap_or_else(|_| "likebike-dev-secret-key-2025".to_string());
    let kakao_client_id = std::env::var("KAKAO_CLIENT_ID").unwrap_or_default();
    let kakao_client_secret = std::env::var("KAKAO_CLIENT_SECRET").unwrap_or_default();
    let upload_dir = std::env::var("UPLOAD_DIR").unwrap_or_else(|_| "./uploads".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    // Ensure upload directory exists
    std::fs::create_dir_all(&upload_dir).expect("Failed to create upload directory");

    let conn = rusqlite::Connection::open(&database_url).expect("Failed to open database");
    db::initialize(&conn);
    seed::seed_quizzes(&conn);

    let state = Arc::new(AppState {
        db: Mutex::new(conn),
        jwt_secret,
        kakao_client_id,
        kakao_client_secret,
        upload_dir: upload_dir.clone(),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .merge(handlers::auth::routes())
        .merge(handlers::users::routes())
        .merge(handlers::quizzes::routes())
        .merge(handlers::bikelogs::routes())
        .merge(handlers::courses::routes())
        .nest_service("/uploads", ServeDir::new(&upload_dir))
        .layer(cors)
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
    println!("LikeBike backend listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind");
    axum::serve(listener, app).await.expect("Server error");
}
