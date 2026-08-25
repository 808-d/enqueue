import axios from "axios";
import { endpoints } from "../utils/endpoints";
import type { UpdateUserRequest } from "../models/updateUserRequest";
import type { UpdateUserResponse } from "../models/updateUserResponse";

export function useUsers() {
  async function updateUser(req: UpdateUserRequest) {
    return await axios.patch<UpdateUserResponse>(endpoints.users, req, {
      withCredentials: true,
    });
  }

  async function getUserById(id: string) {
    return await axios.get(`${endpoints.users}/${id}`, {
      withCredentials: true,
    });
  }
  return { updateUser, getUserById };
}
