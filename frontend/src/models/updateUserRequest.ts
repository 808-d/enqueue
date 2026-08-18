export type UpdateUserRequest = {
  id: string;
  username: string;
  name: string;
  email: string;
  bio: string | null;
  avatar: string | null;
};
