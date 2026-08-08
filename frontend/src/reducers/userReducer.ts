export interface User {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string;
  emailVerified: boolean;
}
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

