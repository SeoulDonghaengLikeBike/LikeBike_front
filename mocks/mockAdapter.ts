import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import {
  mockProfile,
  mockRewards,
  mockQuizzes,
  mockBikeLogs,
  mockCourses,
  mockState,
} from "./data";

function makeResponse(
  data: unknown,
  config: InternalAxiosRequestConfig,
  status = 200,
): AxiosResponse {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config,
  };
}

function wrap<T>(data: T) {
  return {
    code: 200,
    data: Array.isArray(data) ? data : [data],
    message: "success",
  };
}

export function mockAdapter(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const url = config.url || "";
      const method = (config.method || "get").toLowerCase();

      // ---- AUTH ----
      if (url === "/users" && method === "post") {
        return resolve(
          makeResponse(
            wrap({ access_token: "mock-access-token-demo" }),
            config,
            201,
          ),
        );
      }

      if (url === "/users/refresh" && method === "post") {
        return resolve(
          makeResponse(
            wrap({ accessToken: "mock-refreshed-token-demo" }),
            config,
          ),
        );
      }

      if (url === "/users/logout" && method === "post") {
        return resolve(makeResponse(wrap({ success: true }), config));
      }

      // ---- USER PROFILE ----
      if (url === "/users/profile" && method === "get") {
        return resolve(makeResponse(wrap(mockProfile), config));
      }

      // ---- USER LEVEL ----
      if (url.match(/^\/users\/\d+\/level$/) && method === "get") {
        return resolve(
          makeResponse(
            wrap({
              level: mockProfile.level,
              level_name: mockProfile.level_name,
              experience_points: mockProfile.experience_points,
            }),
            config,
          ),
        );
      }

      // ---- REWARDS ----
      if (url === "/users/rewards" && method === "get") {
        return resolve(makeResponse(wrap(mockRewards).code === 200 ? { code: 200, data: mockRewards, message: "success" } : wrap(mockRewards), config));
      }

      // ---- SCORE UPDATE ----
      if (url === "/users/score" && method === "put") {
        const body =
          typeof config.data === "string"
            ? JSON.parse(config.data)
            : config.data;
        mockState.updateScore(
          body.experience_points || 0,
          body.reward_reason || "",
        );
        return resolve(makeResponse(wrap({ success: true }), config));
      }

      // ---- QUIZZES ----
      if (url === "/quizzes" && method === "get") {
        return resolve(
          makeResponse(
            { code: 200, data: mockQuizzes, message: "success" },
            config,
          ),
        );
      }

      if (url === "/quizzes/today/status" && method === "get") {
        return resolve(
          makeResponse(
            wrap({
              attempted: mockState.quizAttempted,
              is_correct: mockState.quizCorrect,
            }),
            config,
          ),
        );
      }

      // Quiz attempt: POST /quizzes/:id/attempt
      const quizAttemptMatch = url.match(/^\/quizzes\/(\d+)\/attempt$/);
      if (quizAttemptMatch && method === "post") {
        const quizId = parseInt(quizAttemptMatch[1]);
        const body =
          typeof config.data === "string"
            ? JSON.parse(config.data)
            : config.data;
        const result = mockState.attemptQuiz(quizId, body.answer || "");
        return resolve(makeResponse(wrap(result), config));
      }

      // ---- BIKE LOGS ----
      if (url === "/users/bike-logs" && method === "get") {
        return resolve(
          makeResponse(
            { code: 200, data: mockBikeLogs, message: "success" },
            config,
          ),
        );
      }

      if (url === "/users/bike-logs" && method === "post") {
        const newLog = mockState.addBikeLog();
        return resolve(makeResponse(wrap(newLog), config, 201));
      }

      if (url === "/users/bike-logs/today/count" && method === "get") {
        return resolve(
          makeResponse(
            wrap({ count: mockState.todayBikeCount }),
            config,
          ),
        );
      }

      // ---- COURSES ----
      if (url === "/users/course-recommendations" && method === "get") {
        return resolve(
          makeResponse(
            { code: 200, data: mockCourses, message: "success" },
            config,
          ),
        );
      }

      if (url === "/users/course-recommendations" && method === "post") {
        const newCourse = mockState.addCourse([]);
        return resolve(makeResponse(wrap(newCourse), config, 201));
      }

      if (
        url === "/users/course-recommendations/week/count" &&
        method === "get"
      ) {
        return resolve(
          makeResponse(
            wrap({ count: mockState.weekCourseCount }),
            config,
          ),
        );
      }

      // ---- FALLBACK ----
      console.warn(`[MockAdapter] Unhandled request: ${method.toUpperCase()} ${url}`);
      resolve(makeResponse({ code: 404, data: [], message: "Not found" }, config, 404));
    }, 150);
  });
}
