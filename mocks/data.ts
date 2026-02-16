import { IUserProfile } from "@/types/user";
import { IQuiz, QUIZ_TYPE } from "@/types/quiz";
import { IBikeLog } from "@/types/bikeLog";
import dayjs from "dayjs";

// ==================== User ====================

export const mockProfile: IUserProfile = {
  id: 1,
  username: "데모유저",
  email: "demo@likebike.kr",
  profile_image_url: null,
  experience_points: 150,
  points: 150,
  level: 2,
  level_name: "초보자",
  benefits: "",
  description: "",
  created_at: "2025-06-01T00:00:00Z",
};

// ==================== Rewards ====================

export interface IMockReward {
  id: number;
  user_id: number;
  experience_points: number;
  reward_reason: string;
  source_type: string;
  created_at: string;
}

export const mockRewards: IMockReward[] = [
  {
    id: 1,
    user_id: 1,
    experience_points: 10,
    reward_reason: "퀴즈 정답",
    source_type: "quiz",
    created_at: dayjs().subtract(5, "day").toISOString(),
  },
  {
    id: 2,
    user_id: 1,
    experience_points: 10,
    reward_reason: "해설 확인",
    source_type: "quiz",
    created_at: dayjs().subtract(4, "day").toISOString(),
  },
  {
    id: 3,
    user_id: 1,
    experience_points: 30,
    reward_reason: "자전거 인증 완료",
    source_type: "bike_log",
    created_at: dayjs().subtract(3, "day").toISOString(),
  },
  {
    id: 4,
    user_id: 1,
    experience_points: 50,
    reward_reason: "코스 추천 승인",
    source_type: "course",
    created_at: dayjs().subtract(2, "day").toISOString(),
  },
  {
    id: 5,
    user_id: 1,
    experience_points: 10,
    reward_reason: "퀴즈 정답",
    source_type: "quiz",
    created_at: dayjs().subtract(1, "day").toISOString(),
  },
  {
    id: 6,
    user_id: 1,
    experience_points: 30,
    reward_reason: "자전거 인증 완료",
    source_type: "bike_log",
    created_at: dayjs().toISOString(),
  },
];

// ==================== Quizzes ====================

export const mockQuizzes: IQuiz[] = [
  {
    id: 1,
    question: "자전거 도로에서의 최고 속도 제한은?",
    answers: ["시속 20km", "시속 30km", "시속 40km", "제한 없음"],
    correct_answer: "시속 20km",
    explanation:
      "도로교통법에 따르면 자전거도로에서의 최고 속도는 시속 20km입니다.",
    hint_link: "https://www.law.go.kr",
    hint_description: "도로교통법 제19조를 확인해보세요.",
    display_date: dayjs().format("YYYY-MM-DD"),
    quiz_type: QUIZ_TYPE.SELECT,
  },
  {
    id: 2,
    question: "자전거 운전 시 안전모 착용은 의무이다.",
    answers: ["O", "X"],
    correct_answer: "O",
    explanation:
      "도로교통법 제50조에 따라 자전거 운전 시 인명보호장구(안전모)를 착용해야 합니다.",
    hint_link: "",
    hint_description: "도로교통법 제50조를 확인해보세요.",
    display_date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    quiz_type: QUIZ_TYPE.OX,
  },
  {
    id: 3,
    question: "야간에 자전거를 운행할 때 반드시 켜야 하는 것은?",
    answers: ["전조등", "경적", "방향지시등", "비상등"],
    correct_answer: "전조등",
    explanation:
      "야간에 자전거를 운행할 때는 전조등과 미등을 반드시 켜야 합니다.",
    hint_link: "",
    hint_description: "야간 자전거 운행 규칙을 확인해보세요.",
    display_date: dayjs().subtract(2, "day").format("YYYY-MM-DD"),
    quiz_type: QUIZ_TYPE.SELECT,
  },
  {
    id: 4,
    question: "자전거 횡단도의 신호는 (  ) 신호를 따른다.",
    answers: [],
    correct_answer: "자전거",
    explanation:
      "자전거 횡단도에서는 자전거 신호등이 있는 경우 해당 신호를 따릅니다.",
    hint_link: "",
    hint_description: "횡단보도와 자전거 횡단도의 차이를 알아보세요.",
    display_date: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
    quiz_type: QUIZ_TYPE.INPUT,
  },
  {
    id: 5,
    question: "자전거 음주운전 적발 시 범칙금은?",
    answers: ["1만원", "3만원", "5만원", "10만원"],
    correct_answer: "3만원",
    explanation: "자전거 음주운전 적발 시 범칙금 3만원이 부과됩니다.",
    hint_link: "",
    hint_description: "자전거 음주운전 처벌 규정을 확인해보세요.",
    display_date: dayjs().subtract(4, "day").format("YYYY-MM-DD"),
    quiz_type: QUIZ_TYPE.SELECT,
  },
];

// ==================== Bike Logs ====================

export const mockBikeLogs: IBikeLog[] = [
  {
    id: 1,
    description: "자전거 타기 인증",
    bike_photo_url: "/images/mock/bike_sample.svg",
    safety_gear_photo_url: "/images/mock/safety_sample.svg",
    started_at: dayjs().subtract(3, "day").toISOString(),
    created_at: dayjs().subtract(3, "day").toISOString(),
    verification_status: "verified",
    verified_at: dayjs().subtract(2, "day").toISOString(),
    points_awarded: 30,
    admin_notes: null,
  },
  {
    id: 2,
    description: "자전거 타기 인증",
    bike_photo_url: "/images/mock/bike_sample.svg",
    safety_gear_photo_url: "/images/mock/safety_sample.svg",
    started_at: dayjs().subtract(1, "day").toISOString(),
    created_at: dayjs().subtract(1, "day").toISOString(),
    verification_status: "pending",
    verified_at: null,
    points_awarded: 0,
    admin_notes: null,
  },
];

// ==================== Courses ====================

export interface IMockCourseResponse {
  admin_notes: string | null;
  course_description: string;
  course_name: string;
  created_at: string;
  description: string;
  id: number;
  photo_url: string;
  places: IMockPlaceResponse[];
  points_awarded: number;
  review: string;
  reviewed_at: string | null;
  reviewed_by_admin_id: number | null;
  status: string;
  title: string;
  user_id: number;
}

export interface IMockPlaceResponse {
  address_name: string;
  description: string;
  latitude: number;
  longitude: number;
  name: string;
  photo_url: string;
  place_id: number;
  sequence_order: number;
  x: string;
  y: string;
}

export const mockCourses: IMockCourseResponse[] = [
  {
    id: 1,
    user_id: 1,
    title: "한강 자전거길 코스",
    course_name: "여의도-반포 한강 코스",
    course_description: "여의도에서 반포까지 한강을 따라 달리는 멋진 코스입니다.",
    description: "여의도에서 반포까지 한강을 따라 달리는 멋진 코스입니다.",
    photo_url: "/images/mock/course_sample.svg",
    places: [
      {
        place_id: 1,
        name: "여의도한강공원",
        address_name: "서울 영등포구 여의동로 330",
        description: "출발지점 - 여의도한강공원 자전거 대여소",
        photo_url: "/images/mock/place_sample.svg",
        latitude: 37.5284,
        longitude: 126.9326,
        x: "126.9326",
        y: "37.5284",
        sequence_order: 0,
      },
      {
        place_id: 2,
        name: "반포한강공원",
        address_name: "서울 서초구 신반포로11길 40",
        description: "도착지점 - 반포한강공원 달빛무지개분수 근처",
        photo_url: "/images/mock/place_sample.svg",
        latitude: 37.5097,
        longitude: 126.9951,
        x: "126.9951",
        y: "37.5097",
        sequence_order: 1,
      },
    ],
    status: "pending",
    review: "",
    reviewed_at: null,
    reviewed_by_admin_id: null,
    admin_notes: null,
    points_awarded: 0,
    created_at: dayjs().subtract(2, "day").toISOString(),
  },
];

// ==================== News ====================

export interface IMockNewsItem {
  title: string;
  url: string;
  thumbnail: string | null;
  createdTime: string | null;
  id: string;
}

export const mockNews: IMockNewsItem[] = [
  {
    title: "서울시 자전거 도로 확충 계획 발표",
    url: "#",
    thumbnail: null,
    createdTime: dayjs().subtract(1, "day").toISOString(),
    id: "news-1",
  },
  {
    title: "한강 자전거길 야간 조명 개선 완료",
    url: "#",
    thumbnail: null,
    createdTime: dayjs().subtract(3, "day").toISOString(),
    id: "news-2",
  },
  {
    title: "봄철 자전거 안전 수칙 안내",
    url: "#",
    thumbnail: null,
    createdTime: dayjs().subtract(5, "day").toISOString(),
    id: "news-3",
  },
];

// ==================== Quiz Status ====================

export const mockQuizStatus = {
  attempted: false,
  is_correct: false,
};

// ==================== Mock State (mutable for mutations) ====================

let _bikeLogIdCounter = mockBikeLogs.length;
let _courseIdCounter = mockCourses.length;
let _rewardIdCounter = mockRewards.length;
let _todayBikeCount = 0;
let _weekCourseCount = 0;
let _quizAttempted = false;
let _quizCorrect = false;

export const mockState = {
  get todayBikeCount() {
    return _todayBikeCount;
  },
  get weekCourseCount() {
    return _weekCourseCount;
  },
  get quizAttempted() {
    return _quizAttempted;
  },
  get quizCorrect() {
    return _quizCorrect;
  },

  addBikeLog(): IBikeLog {
    _bikeLogIdCounter++;
    _todayBikeCount++;
    const newLog: IBikeLog = {
      id: _bikeLogIdCounter,
      description: "자전거 타기 인증",
      bike_photo_url: "/images/mock/bike_sample.svg",
      safety_gear_photo_url: "/images/mock/safety_sample.svg",
      started_at: dayjs().toISOString(),
      created_at: dayjs().toISOString(),
      verification_status: "pending",
      verified_at: null,
      points_awarded: 0,
      admin_notes: null,
    };
    mockBikeLogs.unshift(newLog);
    return newLog;
  },

  addCourse(places: IMockPlaceResponse[]): IMockCourseResponse {
    _courseIdCounter++;
    _weekCourseCount++;
    const newCourse: IMockCourseResponse = {
      id: _courseIdCounter,
      user_id: 1,
      title: "",
      course_name: places[0]?.name || "새 코스",
      course_description: places[0]?.description || "",
      description: places[0]?.description || "",
      photo_url: "/images/mock/course_sample.svg",
      places,
      status: "pending",
      review: "",
      reviewed_at: null,
      reviewed_by_admin_id: null,
      admin_notes: null,
      points_awarded: 0,
      created_at: dayjs().toISOString(),
    };
    mockCourses.unshift(newCourse);
    return newCourse;
  },

  attemptQuiz(quizId: number, answer: string) {
    const quiz = mockQuizzes.find((q) => q.id === quizId);
    const isCorrect =
      quiz?.correct_answer.trim().toLowerCase() ===
      answer.trim().toLowerCase();
    _quizAttempted = true;
    _quizCorrect = isCorrect ?? false;

    if (isCorrect) {
      _rewardIdCounter++;
      mockRewards.push({
        id: _rewardIdCounter,
        user_id: 1,
        experience_points: 10,
        reward_reason: "퀴즈 정답",
        source_type: "quiz",
        created_at: dayjs().toISOString(),
      });
      mockProfile.experience_points += 10;
      mockProfile.points += 10;
    }

    return {
      is_correct: isCorrect,
      points_earned: isCorrect ? 10 : 0,
      experience_earned: isCorrect ? 10 : 0,
      reward_given: isCorrect ?? false,
    };
  },

  updateScore(points: number, reason: string) {
    mockProfile.experience_points += points;
    mockProfile.points += points;
    _rewardIdCounter++;
    mockRewards.push({
      id: _rewardIdCounter,
      user_id: 1,
      experience_points: points,
      reward_reason: reason,
      source_type: "manual",
      created_at: dayjs().toISOString(),
    });

    // Update level
    if (mockProfile.experience_points >= 500) {
      mockProfile.level = 6;
      mockProfile.level_name = "전문가";
    } else if (mockProfile.experience_points >= 400) {
      mockProfile.level = 5;
      mockProfile.level_name = "숙련자";
    } else if (mockProfile.experience_points >= 300) {
      mockProfile.level = 4;
      mockProfile.level_name = "중급자";
    } else if (mockProfile.experience_points >= 200) {
      mockProfile.level = 3;
      mockProfile.level_name = "초보자";
    } else if (mockProfile.experience_points >= 100) {
      mockProfile.level = 2;
      mockProfile.level_name = "입문자";
    } else {
      mockProfile.level = 1;
      mockProfile.level_name = "관심인";
    }
  },

  resetDaily() {
    _todayBikeCount = 0;
    _quizAttempted = false;
    _quizCorrect = false;
  },
};
