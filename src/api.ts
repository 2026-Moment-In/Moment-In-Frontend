import type { Wedding, Photo, Guestbook, QrResponse, Rsvp } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000/live";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("momentin_access_token");
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  devLogin: () =>
    request<{
      access_token: string;
      user: unknown;
    }>("/auth/dev"),

  getQr: (code: string) => request<QrResponse>(`/qr/${code}`),

  createMyWedding: (data: unknown) =>
    request<{
      code: string;
      wedding: Wedding;
    }>("/weddings/my", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  getMyWeddings: () => request<Wedding[]>("/weddings/my/list"),

  getMyWedding: (id: string) => request<Wedding>(`/weddings/my/${id}`),

  updateMyWedding: (id: string, data: unknown) =>
    request<Wedding>(`/weddings/my/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  deleteMyWedding: (id: string) =>
    request(`/weddings/my/${id}`, {
      method: "DELETE",
    }),

  getPhotos: (weddingId: string) => request<Photo[]>(`/photos/${weddingId}`),

  getAdminPhotos: (weddingId: string) =>
    request<Photo[]>(`/photos/admin/${weddingId}`),

  uploadPhoto: async (
    weddingId: string,
    file: File,
    userId: string,
    displayName?: string,
  ) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("weddingId", weddingId);
    formData.append("userId", userId);

    if (displayName) {
      formData.append("displayName", displayName);
    }

    const res = await fetch(`${BASE_URL}/photos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed ${res.status}`);
    }

    return res.json() as Promise<Photo>;
  },

  likePhoto: (photoId: string) =>
    request<Photo>(`/events/like/${photoId}`, {
      method: "POST",
    }),

  getRanking: (weddingId: string) =>
    request<Photo[]>(`/events/ranking/${weddingId}/top`),

  hidePhoto: (photoId: string) =>
    request<Photo>(`/photos/${photoId}/hide`, {
      method: "PATCH",
    }),

  showPhoto: (photoId: string) =>
    request<Photo>(`/photos/${photoId}/show`, {
      method: "PATCH",
    }),

  getGuestbooks: (weddingId: string) =>
    request<Guestbook[]>(`/guestbooks/${weddingId}`),

  getAdminGuestbooks: (weddingId: string) =>
    request<Guestbook[]>(`/guestbooks/admin/${weddingId}`),

  createGuestbook: (weddingId: string, message: string, userId: string) =>
    request<Guestbook>("/guestbooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weddingId,
        message,
        userId,
      }),
    }),

  hideGuestbook: (guestbookId: string) =>
    request<Guestbook>(`/guestbooks/${guestbookId}/hide`, {
      method: "PATCH",
    }),

  showGuestbook: (guestbookId: string) =>
    request<Guestbook>(`/guestbooks/${guestbookId}/show`, {
      method: "PATCH",
    }),

  createRsvp: (data: {
    weddingId: string;
    name: string;
    attendance: string;
    guestCount?: number;
    mealPreference?: string;
    message?: string;
  }) =>
    request<Rsvp>("/rsvps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weddingId: data.weddingId,
        name: data.name,
        attendance: data.attendance,
        guestCount: data.guestCount,
        mealPreference: data.mealPreference,
        message: data.message,
      }),
    }),

  getAdminRsvps: (weddingId: string) =>
    request<Rsvp[]>(`/rsvps/admin/${weddingId}`),

  deleteRsvp: (rsvpId: string) =>
    request(`/rsvps/${rsvpId}`, { method: "DELETE" }),
};