import { NextResponse } from "next/server";

const ID = "22757842371d801ea0ddc7682fa53297";
const PATH = `https://api.notion.com/v1/databases/${ID}/query`;

export interface NewsItem {
  title: string;
  url: string;
  thumbnail: string | null;
  createdTime: string | null;
  id: string;
}

export async function GET() {
  // Mock 모드이거나 Notion 키가 없으면 목업 데이터 반환
  if (
    process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
    !process.env.NOTION_SECRET_KEY
  ) {
    const mockNews: NewsItem[] = [
      {
        title: "서울시 자전거 도로 확충 계획 발표",
        url: "#",
        thumbnail: null,
        createdTime: new Date(Date.now() - 86400000).toISOString(),
        id: "news-1",
      },
      {
        title: "한강 자전거길 야간 조명 개선 완료",
        url: "#",
        thumbnail: null,
        createdTime: new Date(Date.now() - 86400000 * 3).toISOString(),
        id: "news-2",
      },
      {
        title: "봄철 자전거 안전 수칙 안내",
        url: "#",
        thumbnail: null,
        createdTime: new Date(Date.now() - 86400000 * 5).toISOString(),
        id: "news-3",
      },
    ];
    return NextResponse.json(mockNews, { status: 200 });
  }

  try {
    const response = await fetch(PATH, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    const workspace = "bony-billboard-d87";

    function convertToNotionSiteUrl(url: string) {
      const uuidMatch = url.match(/[0-9a-f]{32}/);
      if (!uuidMatch) return url;

      return `https://${workspace}.notion.site/${uuidMatch[0]}`;
    }

    const news: NewsItem[] = data?.results
      ?.sort((page1: any, page2: any) => {
        const properties1 = page1.properties;
        const properties2 = page2.properties;

        const indexProps1 = properties1.번호;
        const indexProps2 = properties2.번호;

        //번호 순으로 정렬
        const index1 = indexProps1?.number || 0;
        const index2 = indexProps2?.number || 0;

        return index2 - index1;
      })
      .map((page: any) => {
        if (!page) return undefined;

        const properties = page.properties;

        const titleProp = properties.제목;
        if (!titleProp || titleProp.type !== "title")
          return {
            title: "(제목 없음)",
            url: page.url,
            thumbnail: null,
            createdTime: null,
            id: page.id,
          };

        const title = titleProp.title.map((t: any) => t.plain_text).join("");

        const thumbnailProp = properties.썸네일 || properties.thumbnail;
        let thumbnail: string | null = null;
        if (
          thumbnailProp &&
          thumbnailProp.type === "files" &&
          thumbnailProp.files.length > 0
        ) {
          thumbnail = thumbnailProp.files[0].file?.url || null;
        }

        return {
          title,
          url: convertToNotionSiteUrl(page.url),
          thumbnail,
          createdTime: properties.생성일?.created_time || null,
          id: page.id,
        };
      })
      .filter(Boolean);

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error("Error fetching news from Notion:", error);
    return NextResponse.json(
      { error: "Failed to fetch news from Notion" },
      { status: 500 },
    );
  }
}
