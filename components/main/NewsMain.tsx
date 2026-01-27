import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Slider from "react-slick";

import { NewsItem } from "@/app/api/news/route";

const NewsMain = () => {
  const router = useRouter();

  const getNewsFromNotion = async () => {
    // Fetch news data from Notion API
    const response = await fetch("/api/news");
    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }
    const data = await response.json();

    return data.reverse() as NewsItem[];
  };

  // 성능 최적화: React Query로 뉴스 데이터 가져오기
  // BaseLayout의 defaultOptions으로 staleTime, refetchOnWindowFocus 등 설정됨
  const { data: news, isLoading } = useQuery<NewsItem[] | undefined>({
    queryKey: ["news"],
    queryFn: getNewsFromNotion,
  });

  // 성능 최적화: console.log 제거
  // 이유: 콘솔 출력은 개발 시에만 사용하고, 프로덕션에서는 성능 저하 원인이 됨

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  if (isLoading) {
    return (
      <div className="h-[190px] rounded-[30px] w-full bg-white flex items-center justify-center ">
        <CircularProgress />
      </div>
    );
  }
  return (
    <div className="cursor-pointer h-full min-h-[100px] slider-container">
      <Slider {...settings}>
        {news?.map((item) => (
          <a key={item.id} href={`${item.url}`} rel="noopener noreferrer">
            <div
              key={item.id}
              className="flex flex-col justify-center items-center h-full w-full bg-[#f0f0f0] h-[170px] rounded-[30px] relative"
            >
              <img
                alt="banner"
                className="rounded-[30px] w-full h-full"
                src={item?.thumbnail ?? "/icons/logo.png"}
              />
            </div>
          </a>
        ))}
      </Slider>
    </div>
  );
};

export default NewsMain;
