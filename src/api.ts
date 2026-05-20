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

  // 임시!!!!!
  devLogin: () => request<unknown>("/dev/login"),
  getMyWeddings: () => request<Wedding[]>("/my/weddings"),
  getMyWedding: () => request<Wedding>("/my/wedding"),
  deleteMyWedding: (id: string) => request<unknown>(`/my/wedding/${id}`, { method: "DELETE" }),
  updateMyWedding: (body: unknown) => request<Wedding>("/my/wedding", { method: "PATCH", body: JSON.stringify(body) }),
  createMyWedding: (body: unknown) => request<Wedding>("/my/wedding", { method: "POST", body: JSON.stringify(body) }),
  getAdminPhotos: () => request<Photo[]>("/admin/photos"),
  getAdminGuestbooks: () => request<Guestbook[]>("/admin/guestbooks"),
  getQr: (id: string) => request<{ wedding: Wedding; data: unknown }>(`/qr/${id}`),  getPhotos: (id: string) => request<Photo[]>(`/wedding/${id}/photos`),
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
  showPhoto: (id: string) => request<unknown>(`/photo/${id}/show`, { method: "PATCH" }),
  hidePhoto: (id: string) => request<unknown>(`/photo/${id}/hide`, { method: "PATCH" }),
  showGuestbook: (id: string) => request<unknown>(`/guestbook/${id}/show`, { method: "PATCH" }),
  hideGuestbook: (id: string) => request<unknown>(`/guestbook/${id}/hide`, { method: "PATCH" }),
};

let ws: WebSocket | null = null;

export function connectSocket(
  inviteCode: string,
  onMessage: (data: unknown) => void
): () => void {
  const wsUrl = import.meta.env.VITE_WS_URL ?? `ws://${location.host}`;
  ws = new WebSocket(`${wsUrl}/ws/${inviteCode}`);

  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data as string));
    } catch {
      onMessage(e.data);
    }
  };

  return () => {
    ws?.close();
    ws = null;
  };
}

export function sendSocketMessage(payload: unknown): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export const SOCKET_URL = import.meta.env.VITE_WS_URL ?? "";
export const DEMO_USER_ID = "demo";