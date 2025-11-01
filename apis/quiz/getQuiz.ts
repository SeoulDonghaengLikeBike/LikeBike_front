import dayjs from "dayjs";

import { IQuiz } from "@/types/quiz";

import { axiosInstance } from "../axiosInstance";

const PATH = "/quizzes";

export const getQuiz: () => Promise<IQuiz | undefined> = async () => {
  try {
    const res = await axiosInstance.get(PATH);

    const data = res?.data?.data;

    const randomIndex = Math.floor(Math.random() * data.length);
    const quiz = data[randomIndex];
    // const quiz: IQuiz | undefined = data?.find(
    //   (v: IQuiz) => v.display_date === dayjs().format("YYYY-MM-DD")
    // );

    return quiz;
  } catch (e) {
    console.error("e", e);
    throw new Error("Failed to fetch todos");
  }
};
