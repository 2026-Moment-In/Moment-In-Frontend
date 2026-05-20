import type { Guestbook, Photo, Wedding } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? `${API_URL}/live`;
export const DEMO_USER_ID =
  import.meta.env.VITE_DEMO_USER_ID ?? '00000000-0000-0000-0000-000000000001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('momentin_access_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  devLogin() {
    return request<{ access_token: string; user: { id: string; display_name: string } }>('/auth/dev');
  },
  getMe() {
    return request<{ id: string; display_name: string }>('/auth/me');
  },
  createQr(data: unknown) {
    return request<{ code: string; weddingId: string }>('/qr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getQr(code: string) {
    return request<{ code: string; wedding: Wedding; data: unknown }>(`/qr/${code}`);
  },
  createMyWedding(data: unknown) {
    return request<{ code: string; wedding: Wedding }>('/weddings/my', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getMyWeddings() {
    return request<Wedding[]>('/weddings/my/list');
  },
  getMyWedding(id: string) {
    return request<Wedding>(`/weddings/my/${id}`);
  },
  updateMyWedding(id: string, data: unknown) {
    return request<Wedding>(`/weddings/my/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  deleteMyWedding(id: string) {
    return request<Wedding>(`/weddings/my/${id}`, {
      method: 'DELETE',
    });
  },
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
  getAdminPhotos(weddingId: string) {
    return request<Photo[]>(`/photos/admin/${weddingId}`);
  },
  hidePhoto(photoId: string) {
    return request<Photo>(`/photos/${photoId}/hide`, { method: 'PATCH' });
  },
  showPhoto(photoId: string) {
    return request<Photo>(`/photos/${photoId}/show`, { method: 'PATCH' });
  },
  getAdminGuestbooks(weddingId: string) {
    return request<Guestbook[]>(`/guestbooks/admin/${weddingId}`);
  },
  hideGuestbook(guestbookId: string) {
    return request<Guestbook>(`/guestbooks/${guestbookId}/hide`, { method: 'PATCH' });
  },
  showGuestbook(guestbookId: string) {
    return request<Guestbook>(`/guestbooks/${guestbookId}/show`, { method: 'PATCH' });
  },
  createGuestbook(weddingId: string, message: string, userId = DEMO_USER_ID) {
    return request<Guestbook>('/guestbooks', {
      method: 'POST',
      body: JSON.stringify({ weddingId, userId, message }),
    });
  },
  uploadPhoto(weddingId: string, file: File, userId = DEMO_USER_ID, displayName?: string) {
    const body = new FormData();
    body.append('weddingId', weddingId);
    body.append('userId', userId);
    if (displayName) {
      body.append('displayName', displayName);
    }
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
  getRanking(weddingId: string) {
    return request<Photo[]>(`/events/ranking/${weddingId}/top`);
  },
};
