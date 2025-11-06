// axiosInstance.ts

import { IResponse } from "@/types/base";

import { axiosInstance } from "../axiosInstance";
import { IPlace, ICourseCard } from "@/types/course";

const PATH = "/users/course-recommendations";

interface ICourseCreateBody {
  places: IPlace[];
}

const makeBody = (courseData: ICourseCard[]): ICourseCreateBody => {
  // IPlace의 photo는 파일 이름
  const places: IPlace[] = courseData.map((course, idx) => ({
    name: course.place?.place_name || "",
    address_name: course.place?.address_name || "",
    description: course.text,
    photo: course.image ? "place_photo" + idx : "",
    x: course.place?.x || "",
    y: course.place?.y || "",
    _file: course.image || null,
  }));

  return { places };
};

export const createCourse = async (courseData: ICourseCard[]) => {
  const { places } = makeBody(courseData);
  console.log("places", places);
  const formData = new FormData();
  formData.append("places", JSON.stringify(places));
  places.forEach((place, idx) => {
    if (place._file) {
      if (idx == 0) formData.append("photo", place._file);
      formData.append(place.photo, place._file);
    }
  });

  const response = await axiosInstance.post<IResponse<any>>(
    `${PATH}`,
    formData
  );
  return response.data;
};
