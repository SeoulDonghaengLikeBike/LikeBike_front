import ReactModal from "react-modal";
import KakaoMapView from "./KakaoMapView";
import { ICourseResponse, IPlaceResponse } from "@/apis/course/getCourse";
import CourseCard from "./CourseCard";
import { ICourseCard, IKakaoMapPoint } from "@/types/course";
import CloseIcon from "@mui/icons-material/Close";
import { IStatus, LOG_STATUS } from "@/types/bikeLog";
import dayjs from "dayjs";

export default function CourseViewer({
  isOpen,
  onClose,
  courses,
}: {
  isOpen: boolean;
  onClose: () => void;
  courses: ICourseResponse | undefined;
}) {
  if (!courses) return null;

  const processedPlaces: IKakaoMapPoint[] = courses.places.map(
    (place, idx) => ({
      id: String(idx),
      place_name: place.name,
      address_name: place.address_name,
      x: place.x,
      y: place.y,
    })
  );

  return (
    <ReactModal
      isOpen={isOpen}
      ariaHideApp={false}
      className="max-w-[460px] mx-auto p-6 bg-white rounded-lg shadow-lg outline-none h-full overflow-y-auto"
      style={{
        overlay: { zIndex: 2000 },
        content: { zIndex: 2100 },
      }}
    >
      <div className="flex flex-row justify-end items-center pb-3">
        <button type="button" className="cursor-pointer" onClick={onClose}>
          <CloseIcon fontSize="large" />
        </button>
      </div>

      <div className="border border-gray-300 p-3 rounded-lg mb-4">
        [{LOG_STATUS[courses.status as IStatus].text}]{" "}
        {dayjs(courses.created_at?.replace("GMT", "")).format(
          "YYYY-MM-DD, A hh시 mm분"
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div
          className={`bg-gray-light rounded-2xl h-[160px] w-full flex items-center justify-center`}
        >
          <KakaoMapView places={processedPlaces} />
        </div>
        {courses.places.map((v, idx) => {
          return (
            <CourseCard
              info={{
                image: null,
                place: {
                  ...v,
                  id: idx.toString(),
                  place_name: v.name,
                  address_name: v.address_name,
                  x: v.x,
                  y: v.y,
                },
                text: v.description || "",
                preview: v.photo_url,
              }}
              idx={idx + 1}
              key={idx}
              readOnly
            />
          );
        })}
      </div>
    </ReactModal>
  );
}
