use chrono::{Local, NaiveDate};
use rusqlite::Connection;

pub fn seed_quizzes(conn: &Connection) {
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM quizzes", [], |row| row.get(0))
        .unwrap_or(0);

    if count > 0 {
        return; // Already seeded
    }

    let today = Local::now().date_naive();

    let quizzes: Vec<(&str, &str, &str, &str, &str, &str, &str)> = vec![
        (
            "자전거 도로에서의 최고 속도 제한은?",
            r#"["시속 20km","시속 30km","시속 40km","제한 없음"]"#,
            "시속 20km",
            "도로교통법에 따르면 자전거도로에서의 최고 속도는 시속 20km입니다.",
            "도로교통법 제19조를 확인해보세요.",
            "select",
            "0",
        ),
        (
            "자전거 운전 시 안전모 착용은 의무이다.",
            r#"["O","X"]"#,
            "O",
            "도로교통법 제50조에 따라 자전거 운전 시 인명보호장구(안전모)를 착용해야 합니다.",
            "도로교통법 제50조를 확인해보세요.",
            "ox",
            "-1",
        ),
        (
            "야간에 자전거를 운행할 때 반드시 켜야 하는 것은?",
            r#"["전조등","경적","방향지시등","비상등"]"#,
            "전조등",
            "야간에 자전거를 운행할 때는 전조등과 미등을 반드시 켜야 합니다.",
            "야간 자전거 운행 규칙을 확인해보세요.",
            "select",
            "-2",
        ),
        (
            "자전거 횡단도의 신호는 (  ) 신호를 따른다.",
            "[]",
            "자전거",
            "자전거 횡단도에서는 자전거 신호등이 있는 경우 해당 신호를 따릅니다.",
            "횡단보도와 자전거 횡단도의 차이를 알아보세요.",
            "input",
            "-3",
        ),
        (
            "자전거 음주운전 적발 시 범칙금은?",
            r#"["1만원","3만원","5만원","10만원"]"#,
            "3만원",
            "자전거 음주운전 적발 시 범칙금 3만원이 부과됩니다.",
            "자전거 음주운전 처벌 규정을 확인해보세요.",
            "select",
            "-4",
        ),
        (
            "자전거도 도로교통법상 '차'에 해당한다.",
            r#"["O","X"]"#,
            "O",
            "도로교통법 제2조에 따르면 자전거는 '차'에 해당합니다.",
            "도로교통법 제2조 정의를 확인해보세요.",
            "ox",
            "-5",
        ),
        (
            "자전거 운전 중 휴대전화 사용 시 범칙금은?",
            r#"["1만원","2만원","3만원","5만원"]"#,
            "2만원",
            "자전거 운전 중 휴대전화를 사용하면 범칙금 2만원이 부과됩니다.",
            "자전거 운전 중 휴대전화 사용 규정을 확인해보세요.",
            "select",
            "-6",
        ),
    ];

    let quiz_count = quizzes.len();
    for (question, answers, correct, explanation, hint, quiz_type, day_offset) in &quizzes {
        let offset: i64 = day_offset.parse().unwrap();
        let display_date: NaiveDate = if offset <= 0 {
            today + chrono::Duration::days(offset)
        } else {
            today + chrono::Duration::days(offset)
        };

        conn.execute(
            "INSERT INTO quizzes (question, answers, correct_answer, explanation, hint_link, hint_description, display_date, quiz_type) VALUES (?1, ?2, ?3, ?4, '', ?5, ?6, ?7)",
            rusqlite::params![
                question,
                answers,
                correct,
                explanation,
                hint,
                display_date.format("%Y-%m-%d").to_string(),
                quiz_type,
            ],
        )
        .expect("Failed to seed quiz");
    }

    println!("Seeded {} quizzes", quiz_count);
}
