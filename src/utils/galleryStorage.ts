export interface Photo {
  id: string;
  name: string;
  src: string;
  likes: number;
  likedBy: string[];
  timestamp: number;
}

const STORAGE_KEY = "momentin_gallery";

export function loadPhotos(): Photo[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  return raw ? JSON.parse(raw) : [];
}

export function savePhotos(photos: Photo[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(photos)
  );

  window.dispatchEvent(
    new Event("gallery_updated")
  );
}