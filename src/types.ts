export type View = 'login' | 'create' | 'join' | 'ready' | 'gallery' | 'guest';

export type Wedding = {
  id: string;
  admin_id?: string;
  theme_code?: string;
  wedding_date?: string;
  location_name?: string;
  location_address?: string;
  status?: string;
  created_at?: string;
  admin?: {
    display_name?: string;
  };
};

export type Photo = {
  id: string;
  wedding_id?: string;
  user_id?: string;
  image_url: string;
  like_count: number;
  is_hidden?: boolean;
  created_at?: string;
  user?: {
    display_name?: string;
  };
};

export type Guestbook = {
  id: string;
  wedding_id?: string;
  user_id?: string;
  message: string;
  is_hidden?: boolean;
  created_at?: string;
  user?: {
    display_name?: string;
  };
};
