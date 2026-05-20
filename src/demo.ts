import type { Invitation, Template } from "./types";

export const mockInvitation: Invitation = {
  id: "inv-001",
  entryCode: "WEDDING2025",
  couple: {
    groomName: "이준호",
    brideName: "박서연",
    groomFamily: "이상훈 · 최미영의 장남",
    brideFamily: "박철수 · 김혜진의 장녀",
    weddingDate: "2025년 10월 18일",
    weddingTime: "토요일 오후 2시",
    venue: "더 플라자 호텔 서울",
    venueAddress: "서울특별시 중구 태평로1가 23",
    venueDetail: "그랜드볼룸 2층",
    message: "서로가 서로에게 세상 전부가 되어\n새로운 시작의 문을 열려 합니다.\n저희의 시작을 따뜻하게 축복해 주세요.",
  },
  cover: {
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=90",
    motion: "zoom-in",
    letteringText: "이준호 ♥ 박서연",
    showGradient: true,
  },
  colorTheme: {
    bg: "#faf8f5",
    text: "#3a3535",
    accent: "#b89a6a",
    button: "#3a3535",
    buttonText: "#ffffff",
    preset: "classic",
  },
  gallery: [
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
    "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=800&q=80",
  ],
  rsvpList: [
    { id: "r1", name: "김민수", attendance: "yes", guestCount: 2, mealPreference: "한식", message: "꼭 갈게요!", createdAt: "2025-09-25" },
    { id: "r2", name: "이지원", attendance: "yes", guestCount: 1, mealPreference: "양식", message: "축하드려요~", createdAt: "2025-09-26" },
    { id: "r3", name: "박나연", attendance: "no", guestCount: 0, mealPreference: "없음", message: "못 가서 아쉬워요 ㅠㅠ", createdAt: "2025-09-27" },
    { id: "r4", name: "최서준", attendance: "yes", guestCount: 2, mealPreference: "한식", message: "두 분 정말 잘 어울려요!", createdAt: "2025-09-28" },
    { id: "r5", name: "정하은", attendance: "undecided", guestCount: 1, mealPreference: "없음", message: "일정 확인 후 연락드릴게요", createdAt: "2025-09-28" },
    { id: "r6", name: "윤서현", attendance: "yes", guestCount: 2, mealPreference: "한식", message: "진심으로 축하드립니다!", createdAt: "2025-09-29" },
    { id: "r7", name: "강태양", attendance: "yes", guestCount: 1, mealPreference: "양식", message: "행복하게 사세요 💕", createdAt: "2025-09-30" },
  ],
  messages: [
    { id: "m1", authorName: "서다영", authorAvatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=서다영", content: "웨딩사진 너무 잘 어울리고 예쁘다 💕 결혼 너무너무 축하해!", createdAt: "2025-10-01" },
    { id: "m2", authorName: "이지원", authorAvatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=이지원", content: "언니 결혼 정말정말 축하해 🥳❤️ 앞으로도 행복한 일만 가득하길 바래", createdAt: "2025-10-02" },
    { id: "m3", authorName: "김태현", authorAvatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=김태현", content: "두 분이 정말 잘 어울려요! 평생 행복하게 사세요 🎊", createdAt: "2025-10-03" },
    { id: "m4", authorName: "박소연", authorAvatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=박소연", content: "결혼 진심으로 축하드려요! 오래오래 행복하세요 ✨", createdAt: "2025-10-04" },
    { id: "m5", authorName: "최민호", authorAvatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=최민호", content: "두 사람이 함께하는 모든 날이 특별하길 바랍니다 🌸", createdAt: "2025-10-05" },
  ],
  noticeTitle: "안내사항",
  msgTitle: "신랑 신부에게\n축하인사를 남겨주세요",
  noticeItems: [
    { id: "n1", title: "식권", content: "식사권은 축의금 데스크에서 필요한 수량만큼 받으실 수 있습니다 :)" },
    { id: "n2", title: "주차", content: "건물 지하 주차장을 이용해 주세요. 3시간 무료 주차 가능합니다." },
    { id: "n3", title: "기타", content: "문의 사항은 신랑 010-1234-5678 또는 신부 010-9876-5432로 연락 주세요." },
  ],
  viewCount: 234,
  createdAt: "2025-09-20",
  location: {
    subwayInfo: "1·2호선 시청역 2번 출구 도보 5분\n5호선 광화문역 7번 출구 도보 8분",
    busInfo: "간선버스 103, 401 / 시청앞 하차\n지선버스 7021 / 프레스센터 하차",
    carInfo: "네비게이션 '더 플라자 호텔 서울' 검색\n호텔 지하 주차장 이용 가능 (3시간 무료)",
    walkInfo: "",
    markerTitle: "이준호 ❤ 박서연",
    markerIconIdx: 5,
  },
};

<<<<<<< HEAD
export const mockTemplates: Template[] = [
  { id: "t1", name: "클래식 아이보리", tags: ["클래식", "우아한", "포멀"], previewUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80", colorPreset: "classic", motionType: "zoom-in" },
  { id: "t2", name: "가든 그린", tags: ["자연", "청량한", "로맨틱"], previewUrl: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80", colorPreset: "garden", motionType: "slide-up" },
  { id: "t3", name: "오션 블루", tags: ["시원한", "세련된", "모던"], previewUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80", colorPreset: "ocean", motionType: "slide-right" },
  { id: "t4", name: "포레스트 브라운", tags: ["따뜻한", "빈티지", "자연스러운"], previewUrl: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80", colorPreset: "forest", motionType: "zoom-out" },
  { id: "t5", name: "로즈 클래식", tags: ["로맨틱", "따뜻한", "클래식"], previewUrl: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80", colorPreset: "classic", motionType: "zoom-in" },
  { id: "t6", name: "미니멀 화이트", tags: ["미니멀", "현대적", "심플"], previewUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&q=80", colorPreset: "classic", motionType: "slide-left" },
];

export const DEMO_COVER_IMAGES = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=90",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=90",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=90",
  "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=90",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=90",
  "https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?w=1200&q=90",
=======
export const demoPhotos: Photo[] = [
  {
    id: 'demo-1',
    image_url:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
    like_count: 9,
    user: { display_name: '현재원' },
  },
  {
    id: 'demo-2',
    image_url:
      'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80',
    like_count: 6,
    user: { display_name: '최유리' },
  },
  {
    id: 'demo-3',
    image_url:
      'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80',
    like_count: 4,
    user: { display_name: '박지훈' },
  },
  {
    id: 'demo-4',
    image_url:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
    like_count: 3,
    user: { display_name: '이현수' },
  },
];

export const demoGuestbooks: Guestbook[] = [
  {
    id: 'guest-1',
    message: '두 분의 오늘이 오래오래 반짝이길 바라요.',
    user: { display_name: '민서' },
  },
  {
    id: 'guest-2',
    message: '결혼 진심으로 축하합니다!',
    user: { display_name: '지우' },
  },
>>>>>>> bc5569aacd5d294a207982e708aace1129f92cb3
];
