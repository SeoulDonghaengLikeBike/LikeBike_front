1. QueryClient가 컴포넌트 내부에서 생성됨 - 캐싱 완전히 무효화 (매우 중요)
2. 중복된 프로필 API 호출 - 4곳에서 같은 데이터 요청
3. useEffect 의존성 문제 - KakaoMapView, CourseSearch에서 ESLint 무시
4. 메모이제이션되지 않은 함수 - 핸들러들이 매번 새로 생성
5. React.memo 누락 - 자주 렌더링되는 컴포넌트들
6. 쿼리 무효화 누락 - mutation 후 관련 쿼리 갱신 안 함
7. 불필요한 courseList fetch - 데이터를 사용하지 않음
