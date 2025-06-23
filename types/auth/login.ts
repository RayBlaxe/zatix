export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: User;
};
