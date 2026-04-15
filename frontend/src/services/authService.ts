import { loginApi } from "../api/authApi";
import { LoginRequest } from "../types/auth";

export const loginService = async (payload: LoginRequest) => {
    const data = await loginApi(payload)

    sessionStorage.setItem("accessToken", data.accessToken)

    return data
}