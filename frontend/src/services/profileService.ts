import {
  changePasswordApi,
  getProfileApi,
  logoutApi,
} from "../api/profileApi";
import { ChangePasswordRequest } from "../types/auth";

export const getProfileService = async () => {
  const response = await getProfileApi();
  return response.data;
};

export const changePasswordService = async (payload: ChangePasswordRequest) => {
  return changePasswordApi(payload);
};

export const logoutService = async () => {
  return logoutApi();
};
