export interface IQuiz {
  id: number;
  question: string;
  answers: string[];
  correct_answer: string;
  explanation: string;
  hint_link: string;
  hint_description: string;
  display_date: string;
  quiz_type: QUIZ_TYPE;
}

export enum QUIZ_TYPE {
  SELECT = "select",
  INPUT = "input",
  OX = "ox",
}
