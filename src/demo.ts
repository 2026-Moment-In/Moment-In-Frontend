import type { Guestbook, Photo, Wedding } from './types';

export const defaultWedding: Wedding = {
  id: '4JIQ56L',
  theme_code: 'classic',
  wedding_date: '2026-06-20T12:00:00.000Z',
  location_name: 'Moment Hall',
  location_address: '서울특별시 강남구 테헤란로 123',
  status: 'active',
  admin: {
    display_name: '김다영',
  },
};

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
];
