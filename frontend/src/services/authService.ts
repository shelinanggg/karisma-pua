import { loginApi } from "../api/AuthApi";
import { LoginRequest } from "../types/auth";

export const loginService = async (payload: LoginRequest) => {
    const data = await loginApi(payload)

    localStorage.setItem("token", data.token)

    return data
}