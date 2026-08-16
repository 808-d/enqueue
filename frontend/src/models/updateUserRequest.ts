export type UpdateUserRequest = {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
};
