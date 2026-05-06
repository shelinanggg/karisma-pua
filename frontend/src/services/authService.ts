import { loginApi } from "../api/authApi";
import { LoginRequest } from "../types/auth";
import { setAccessToken } from "../utils/authToken";

export const loginService = async (payload: LoginRequest) => {
    const data = await loginApi(payload)

    setAccessToken(data.accessToken, Boolean(payload.rememberMe))

    return data
}
