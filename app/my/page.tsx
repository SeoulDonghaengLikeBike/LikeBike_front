"use client";

import { Avatar, Divider, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import { getProfile } from "@/apis/user/getProfile";
import logout from "@/apis/user/logout";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import Link from "next/link";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";

export default function Home() {
  const router = useRouter();
  const { data: userInfo } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const onClickLogout = async () => {
    try {
      await logout();
      if (confirm("로그아웃 하시겠습니까?")) {
        alert("로그아웃 되었습니다");
        router.push("/siginin");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Container>
      <InfoContainer>
        <Avatar src={userInfo?.profile_image_url ?? ""} />
        <Stack flexDirection="column">
          <Typography variant="body1">{userInfo?.username}</Typography>
          <Typography color="gray" variant="body2">
            {userInfo?.email}
          </Typography>
        </Stack>
      </InfoContainer>
      <Divider />
      <ButtonContainer
        onClick={() => {
          location.href =
            process.env.NEXT_PUBLIC_QNA_URL || window.location.origin;
        }}
      >
        <HelpOutlineIcon />
        <Typography>Q&A</Typography>
      </ButtonContainer>
      {/* <ButtonContainer
        onClick={() => {
          router.push("/my/setting");
        }}
      >
        <img src="/icons/setting.svg" alt="setting" width={24} height={24} />
        <Typography>설정</Typography>
      </ButtonContainer> */}
      <Link href={"https://hangang.seoul.go.kr/www/contents/823.do?mid=595"}>
        <ButtonContainer>
          <CampaignOutlinedIcon />
          <Typography>안전 신문고</Typography>
        </ButtonContainer>
      </Link>
      <Link
        href={
          "https://bony-billboard-d87.notion.site/2a157842371d80988fd3fec6e93214f1"
        }
      >
        <ButtonContainer>
          <PrivacyTipOutlinedIcon />
          <Typography>개인정보 활용 및 처리 방침</Typography>
        </ButtonContainer>
      </Link>
      <ButtonContainer onClick={onClickLogout}>
        <LogoutOutlinedIcon />
        <Typography>로그아웃</Typography>
      </ButtonContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
  padding-top: 16px;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 12px;
  cursor: pointer;
`;
