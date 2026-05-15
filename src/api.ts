import type { Guestbook, Photo, Wedding } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? `${API_URL}/live`;
export const DEMO_USER_ID =
  import.meta.env.VITE_DEMO_USER_ID ?? '00000000-0000-0000-0000-000000000001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || response.statusText);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getWeddingById(id: string) {
    return request<Wedding>(`/weddings/${id}`);
  },
  getWeddingByCode(code: string) {
    return request<Wedding>(`/weddings/code/${code}`);
  },
  getGuestbooks(weddingId: string) {
    return request<Guestbook[]>(`/guestbooks/${weddingId}`);
  },
  getPhotos(weddingId: string) {
    return request<Photo[]>(`/photos/${weddingId}`);
  },
  createGuestbook(weddingId: string, message: string, userId = DEMO_USER_ID) {
    return request<Guestbook>('/guestbooks', {
      method: 'POST',
      body: JSON.stringify({ weddingId, userId, message }),
    });
  },
  uploadPhoto(weddingId: string, file: File, userId = DEMO_USER_ID) {
    const body = new FormData();
    body.append('weddingId', weddingId);
    body.append('userId', userId);
    body.append('file', file);

    return request<Photo>('/photos', {
      method: 'POST',
      body,
    });
  },
  likePhoto(photoId: string) {
    return request<Photo>(`/events/like/${photoId}`, { method: 'POST' });
  },
  getTopRankedPhoto(weddingId: string) {
    return request<string | null>(`/events/ranking/${weddingId}`);
  },
};
