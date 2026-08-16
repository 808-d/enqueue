import axios from "axios";
import { endpoints } from "../utils/endpoints";
import type { UpdateUserRequest } from "../models/updateUserRequest";

export function useUsers() {
  const updateUser = async (req: UpdateUserRequest) => {
    try {
      const response = await axios.patch(endpoints.users, req, {
        withCredentials: true,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };
  return { updateUser };
}
