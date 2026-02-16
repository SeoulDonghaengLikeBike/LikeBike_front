use serde::{Deserialize, Serialize};

// ==================== API Response Wrapper ====================

#[derive(Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub code: u16,
    pub data: Vec<T>,
    pub message: String,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: Vec<T>) -> Self {
        Self {
            code: 200,
            data,
            message: "success".to_string(),
        }
    }

    pub fn created(data: Vec<T>) -> Self {
        Self {
            code: 201,
            data,
            message: "success".to_string(),
        }
    }
}

// ==================== User ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProfile {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub profile_image_url: Option<String>,
    pub experience_points: i64,
    pub points: i64,
    pub level: i64,
    pub level_name: String,
    pub benefits: String,
    pub description: String,
    pub created_at: String,
}

// ==================== Auth ====================

#[derive(Deserialize)]
pub struct OAuthRequest {
    pub code: String,
}

#[derive(Serialize)]
pub struct OAuthResponse {
    pub access_token: String,
}

#[derive(Serialize)]
pub struct RefreshResponse {
    #[serde(rename = "accessToken")]
    pub access_token: String,
}

#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
    pub sub: i64, // user_id
    pub exp: usize,
    pub iat: usize,
    pub token_type: String, // "access" or "refresh"
}

// ==================== Quiz ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Quiz {
    pub id: i64,
    pub question: String,
    pub answers: Vec<String>,
    pub correct_answer: String,
    pub explanation: String,
    pub hint_link: String,
    pub hint_description: String,
    pub display_date: String,
    pub quiz_type: String,
}

#[derive(Deserialize)]
pub struct QuizAttemptRequest {
    pub answer: String,
}

#[derive(Serialize)]
pub struct QuizAttemptResponse {
    pub is_correct: bool,
    pub points_earned: i64,
    pub experience_earned: i64,
    pub reward_given: bool,
}

#[derive(Serialize)]
pub struct QuizStatusResponse {
    pub attempted: bool,
    pub is_correct: bool,
}

// ==================== Bike Log ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BikeLog {
    pub id: i64,
    pub description: String,
    pub bike_photo_url: String,
    pub safety_gear_photo_url: String,
    pub started_at: String,
    pub created_at: String,
    pub verification_status: String,
    pub verified_at: Option<String>,
    pub points_awarded: i64,
    pub admin_notes: Option<String>,
}

#[derive(Serialize)]
pub struct BikeCountResponse {
    pub count: i64,
}

// ==================== Course ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CourseResponse {
    pub id: i64,
    pub user_id: i64,
    pub title: String,
    pub course_name: String,
    pub course_description: String,
    pub description: String,
    pub photo_url: String,
    pub places: Vec<PlaceResponse>,
    pub status: String,
    pub review: String,
    pub reviewed_at: Option<String>,
    pub reviewed_by_admin_id: Option<i64>,
    pub admin_notes: Option<String>,
    pub points_awarded: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaceResponse {
    pub place_id: i64,
    pub name: String,
    pub address_name: String,
    pub description: String,
    pub photo_url: String,
    pub latitude: f64,
    pub longitude: f64,
    pub x: String,
    pub y: String,
    pub sequence_order: i64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PlaceInput {
    pub name: String,
    pub address_name: String,
    pub description: String,
    pub photo: String,
    pub x: String,
    pub y: String,
    #[serde(default)]
    pub _file: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct CourseCountResponse {
    pub count: i64,
}

// ==================== Reward ====================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Reward {
    pub id: i64,
    pub user_id: i64,
    pub experience_points: i64,
    pub reward_reason: String,
    pub source_type: String,
    pub created_at: String,
}

// ==================== Score Update ====================

#[derive(Deserialize)]
pub struct ScoreUpdateRequest {
    pub experience_points: i64,
    pub reward_reason: String,
}

// ==================== Level ====================

#[derive(Serialize)]
pub struct LevelResponse {
    pub level: i64,
    pub level_name: String,
    pub experience_points: i64,
}
