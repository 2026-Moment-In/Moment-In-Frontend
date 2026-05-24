export function getAccessToken() {
  return localStorage.getItem("momentin_access_token");
}

export function getDisplayNameFromToken(token = getAccessToken()) {
  if (!token) return null;

  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    const payload = JSON.parse(json);
    return (payload.displayName as string | undefined) ?? null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("momentin_access_token");
  localStorage.removeItem("momentin_user");
}
