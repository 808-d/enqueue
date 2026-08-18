import type { User } from "./user";

export type UpdateUserResponse = {
  user: User;
  email_change_pending: boolean;
};
