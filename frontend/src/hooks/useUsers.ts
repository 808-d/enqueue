import axios from "axios";
import { endpoints } from "../utils/endpoints";
import type { UpdateUserRequest } from "../models/updateUserRequest";
import type { UpdateUserResponse } from "../models/updateUserResponse";

export function useUsers() {
  const updateUser = async (
    req: UpdateUserRequest,
  ): Promise<UpdateUserResponse> => {
    const response = await axios.patch<UpdateUserResponse>(
      endpoints.users,
      req,
      {
        withCredentials: true,
      },
    );
    return response.data;
  };

  return { updateUser };
}
