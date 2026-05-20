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
