import type { Photo, Guestbook, Wedding } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  devLogin: () => request<{ access_token: string; user: { id: string; name: string } }>("/dev/login"),
  getMyWeddings: () => request<Wedding[]>("/my/weddings"),
  getMyWedding: (id: string) => request<Wedding>(`/my/wedding/${id}`),
  deleteMyWedding: (id: string) => request<void>(`/my/wedding/${id}`, { method: "DELETE" }),
  updateMyWedding: (id: string, body: unknown) => request<Wedding>(`/my/wedding/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  createMyWedding: (body: unknown) => request<{ wedding: Wedding }>("/my/wedding", { method: "POST", body: JSON.stringify(body) }),
  getAdminPhotos: (weddingId: string) => request<Photo[]>(`/admin/wedding/${weddingId}/photos`),
  getAdminGuestbooks: (weddingId: string) => request<Guestbook[]>(`/admin/wedding/${weddingId}/guestbooks`),
  getQr: (id: string) => request<{ wedding: Wedding; data: unknown }>(`/qr/${id}`),
  getPhotos: (id: string) => request<Photo[]>(`/wedding/${id}/photos`),
  getRanking: (id: string) => request<Photo[]>(`/wedding/${id}/ranking`),
  getGuestbooks: (id: string) => request<Guestbook[]>(`/wedding/${id}/guestbooks`),
  uploadPhoto: (id: string, file: File, userId: string, name: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("name", name);
    return fetch(`${BASE_URL}/wedding/${id}/photos`, { method: "POST", body: formData }).then(r => r.json() as Promise<Photo>);
  },
  likePhoto: (id: string) => request<Photo>(`/photo/${id}/like`, { method: "POST" }),
  createGuestbook: (id: string, message: string, userId: string) =>
    request<Guestbook>(`/wedding/${id}/guestbooks`, { method: "POST", body: JSON.stringify({ message, userId }) }),
  showPhoto: (id: string) => request<Photo>(`/photo/${id}/show`, { method: "PATCH" }),
  hidePhoto: (id: string) => request<Photo>(`/photo/${id}/hide`, { method: "PATCH" }),
  showGuestbook: (id: string) => request<Guestbook>(`/guestbook/${id}/show`, { method: "PATCH" }),
  hideGuestbook: (id: string) => request<Guestbook>(`/guestbook/${id}/hide`, { method: "PATCH" }),
};

export const DEMO_USER_ID = "demo";
export const SOCKET_URL = import.meta.env.VITE_WS_URL ?? "";
