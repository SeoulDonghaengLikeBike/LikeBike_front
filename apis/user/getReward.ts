import { IResponse } from "@/types/base";
import { axiosInstance } from "../axiosInstance";

interface IReward {
  created_at: string;
  id: number;
  reward_reason: string;
  source_type: string;
  user_id: number;
  experience_points: number; // Assuming this is the field you want to return
}

export const getReward = async () => {
  const response =
    await axiosInstance.get<IResponse<IReward[]>>(`/users/rewards`);

  if (response.status !== 200) {
    throw new Error("Failed to fetch reward data");
  }

  //   return [
  //     {
  //       created_at: "2024-01-01T12:00:00Z",
  //       id: 1,
  //       points: 10,
  //       reward_reason: "퀴즈 정답",
  //       source_type: "quiz",
  //       user_id: 1,
  //     },
  //   ];
  return response?.data?.data;
};
