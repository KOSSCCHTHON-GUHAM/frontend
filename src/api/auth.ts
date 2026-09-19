import { sessionStore } from "@/auth/session";
import { apiFetch, toQuery } from "./client";

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string;
    onboardingCompleted: boolean;
  };
};

export const authApi = {
  async login(email: string, password: string) {
    const response = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await sessionStore.save(response.accessToken, response.refreshToken);
    return response;
  },
  register(email: string, password: string, nickname: string) {
    return apiFetch<{
      user: { id: string; email: string; nickname: string };
      nextAction: "LOGIN";
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nickname }),
    });
  },
  checkNickname(nickname: string) {
    return apiFetch<{ isAvailable: boolean; message: string }>(
      `/api/auth/check-nickname${toQuery({ nickname })}`,
    );
  },
  async logout() {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST", auth: true });
    } finally {
      await sessionStore.clear();
    }
  },
};
