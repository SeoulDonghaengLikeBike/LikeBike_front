use std::sync::Arc;

use axum::extract::{Multipart, Request, State};
use axum::http::{HeaderMap, StatusCode};
use axum::routing::get;
use axum::{Json, Router};
use chrono::{Datelike, Local, Utc};

use crate::error::AppError;
use crate::middleware::{extract_user_id, extract_user_id_from_headers};
use crate::models::{
    ApiResponse, CourseCountResponse, CourseResponse, PlaceInput, PlaceResponse,
};
use crate::AppState;

/// GET /users/course-recommendations
async fn get_courses(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<CourseResponse>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let db = state.db.lock().await;

    let mut stmt = db.prepare(
        "SELECT id, user_id, title, course_name, course_description, description, photo_url, status, review, reviewed_at, reviewed_by_admin_id, admin_notes, points_awarded, created_at FROM course_recommendations WHERE user_id = ?1 ORDER BY created_at DESC",
    )?;

    let course_rows: Vec<(i64, CourseResponse)> = stmt
        .query_map([user_id], |row| {
            let course_id: i64 = row.get::<_, i64>(0)?;
            Ok((
                course_id,
                CourseResponse {
                    id: course_id,
                    user_id: row.get::<_, i64>(1)?,
                    title: row.get::<_, String>(2)?,
                    course_name: row.get::<_, String>(3)?,
                    course_description: row.get::<_, String>(4)?,
                    description: row.get::<_, String>(5)?,
                    photo_url: row.get::<_, String>(6)?,
                    places: vec![],
                    status: row.get::<_, String>(7)?,
                    review: row.get::<_, String>(8)?,
                    reviewed_at: row.get::<_, Option<String>>(9)?,
                    reviewed_by_admin_id: row.get::<_, Option<i64>>(10)?,
                    admin_notes: row.get::<_, Option<String>>(11)?,
                    points_awarded: row.get::<_, i64>(12)?,
                    created_at: row.get::<_, String>(13)?,
                },
            ))
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut courses = Vec::new();
    for (course_id, mut course) in course_rows {
        let mut places_stmt = db.prepare(
            "SELECT id, name, address_name, description, photo_url, latitude, longitude, x, y, sequence_order FROM course_places WHERE course_id = ?1 ORDER BY sequence_order",
        )?;

        let places: Vec<PlaceResponse> = places_stmt
            .query_map([course_id], |row| {
                Ok(PlaceResponse {
                    place_id: row.get::<_, i64>(0)?,
                    name: row.get::<_, String>(1)?,
                    address_name: row.get::<_, String>(2)?,
                    description: row.get::<_, String>(3)?,
                    photo_url: row.get::<_, String>(4)?,
                    latitude: row.get::<_, f64>(5)?,
                    longitude: row.get::<_, f64>(6)?,
                    x: row.get::<_, String>(7)?,
                    y: row.get::<_, String>(8)?,
                    sequence_order: row.get::<_, i64>(9)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        course.places = places;
        courses.push(course);
    }

    Ok(Json(ApiResponse::ok(courses)))
}

/// POST /users/course-recommendations (multipart)
async fn create_course(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<ApiResponse<CourseResponse>>), AppError> {
    let user_id = extract_user_id_from_headers(&headers, &state.jwt_secret)?;

    let mut places_json = String::new();
    let mut main_photo_path = String::new();
    let mut photo_map: std::collections::HashMap<String, String> =
        std::collections::HashMap::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(format!("Field error: {}", e)))?
    {
        let name = field.name().unwrap_or("").to_string();

        match name.as_str() {
            "places" => {
                places_json = field
                    .text()
                    .await
                    .map_err(|e| AppError::BadRequest(e.to_string()))?;
            }
            "photo" => {
                main_photo_path = save_upload(&state.upload_dir, "course", field).await?;
            }
            _ if name.starts_with("place_photo") => {
                let path = save_upload(&state.upload_dir, "place", field).await?;
                photo_map.insert(name, path);
            }
            _ => {}
        }
    }

    let places: Vec<PlaceInput> = serde_json::from_str(&places_json)
        .map_err(|e| AppError::BadRequest(format!("Invalid places JSON: {}", e)))?;

    if places.is_empty() {
        return Err(AppError::BadRequest(
            "At least one place is required".to_string(),
        ));
    }

    let now = Utc::now().to_rfc3339();
    let course_name = places.first().map(|p| p.name.clone()).unwrap_or_default();
    let course_desc = places
        .first()
        .map(|p| p.description.clone())
        .unwrap_or_default();

    let db = state.db.lock().await;

    db.execute(
        "INSERT INTO course_recommendations (user_id, title, course_name, course_description, description, photo_url, created_at) VALUES (?1, '', ?2, ?3, ?3, ?4, ?5)",
        rusqlite::params![user_id, course_name, course_desc, main_photo_path, now],
    )?;

    let course_id = db.last_insert_rowid();
    let mut place_responses = Vec::new();

    for (idx, place) in places.iter().enumerate() {
        let photo_url = if !place.photo.is_empty() {
            photo_map.get(&place.photo).cloned().unwrap_or_default()
        } else {
            String::new()
        };

        let lat: f64 = place.y.parse().unwrap_or(0.0);
        let lng: f64 = place.x.parse().unwrap_or(0.0);

        db.execute(
            "INSERT INTO course_places (course_id, name, address_name, description, photo_url, latitude, longitude, x, y, sequence_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![course_id, place.name, place.address_name, place.description, photo_url, lat, lng, place.x, place.y, idx as i64],
        )?;

        let place_id = db.last_insert_rowid();
        place_responses.push(PlaceResponse {
            place_id,
            name: place.name.clone(),
            address_name: place.address_name.clone(),
            description: place.description.clone(),
            photo_url,
            latitude: lat,
            longitude: lng,
            x: place.x.clone(),
            y: place.y.clone(),
            sequence_order: idx as i64,
        });
    }

    let response = CourseResponse {
        id: course_id,
        user_id,
        title: String::new(),
        course_name,
        course_description: course_desc.clone(),
        description: course_desc,
        photo_url: main_photo_path,
        places: place_responses,
        status: "pending".to_string(),
        review: String::new(),
        reviewed_at: None,
        reviewed_by_admin_id: None,
        admin_notes: None,
        points_awarded: 0,
        created_at: now,
    };

    Ok((
        StatusCode::CREATED,
        Json(ApiResponse::created(vec![response])),
    ))
}

/// GET /users/course-recommendations/week/count
async fn get_week_count(
    State(state): State<Arc<AppState>>,
    req: Request,
) -> Result<Json<ApiResponse<CourseCountResponse>>, AppError> {
    let user_id = extract_user_id(&req, &state.jwt_secret)?;
    let db = state.db.lock().await;

    let today = Local::now().date_naive();
    let weekday = today.weekday().num_days_from_monday();
    let week_start = today - chrono::Duration::days(weekday as i64);

    let count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM course_recommendations WHERE user_id = ?1 AND DATE(created_at) >= ?2",
            rusqlite::params![user_id, week_start.format("%Y-%m-%d").to_string()],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(Json(ApiResponse::ok(vec![CourseCountResponse { count }])))
}

pub fn routes() -> Router<Arc<AppState>> {
    Router::new()
        .route(
            "/users/course-recommendations",
            get(get_courses).post(create_course),
        )
        .route(
            "/users/course-recommendations/week/count",
            get(get_week_count),
        )
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
