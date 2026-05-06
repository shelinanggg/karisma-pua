const ACCESS_TOKEN_KEY = "accessToken";
const REMEMBER_AUTH_KEY = "rememberAuth";

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function shouldRememberAuth() {
  return localStorage.getItem(REMEMBER_AUTH_KEY) === "true";
}

export function setAccessToken(token: string, rememberMe = false) {
  if (rememberMe) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(REMEMBER_AUTH_KEY, "true");
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_AUTH_KEY);
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_AUTH_KEY);
}
