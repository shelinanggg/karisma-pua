import axios from "./axiosInstance";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileResponse,
} from "../types/auth";

export const getProfileApi = async (): Promise<ProfileResponse> => {
  const response = await axios.get("/auth/me");
  return response.data;
};

export const changePasswordApi = async (
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await axios.patch("/auth/me/password", payload);
  return response.data;
};

export const logoutApi = async (): Promise<ChangePasswordResponse> => {
  const response = await axios.post("/auth/logout");
  return response.data;
};
