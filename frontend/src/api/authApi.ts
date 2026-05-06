import axios from "./axiosInstance";
import { LoginRequest, LoginResponse } from "../types/auth";

export const loginApi = async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post("/auth/login", payload)
    return response.data
}

export const refreshApi = async (rememberMe = false): Promise<Pick<LoginResponse, "accessToken">> => {
    const response = await axios.post("/auth/refresh", { rememberMe })
    return response.data
}
