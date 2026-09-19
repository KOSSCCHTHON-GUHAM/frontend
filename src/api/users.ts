import { apiFetch, toQuery } from "./client";
import type { Board, RecruitmentStatus, UserProfile } from "./types";

export type OnboardingInput = {
  giveFields: string[];
  interests: string[];
  regions: string[];
  customGiveText?: string;
  customInterestText?: string;
};

export const usersApi = {
  getOptions() {
    return apiFetch<{ giveFields: string[]; interests: string[]; regions: string[] }>(
      "/api/meta/options",
    );
  },
  saveOnboarding(input: OnboardingInput) {
    return apiFetch<{ user: UserProfile; onboardingCompleted: true }>(
      "/api/users/me/onboarding",
      { method: "PUT", auth: true, body: JSON.stringify(input) },
    );
  },
  getMe() {
    return apiFetch<{
      user: UserProfile;
      boardStats: { total: number; recruiting: number; completed: number };
    }>("/api/users/me", { auth: true });
  },
  getMyBoards(params: { status?: RecruitmentStatus; page?: number; limit?: number } = {}) {
    return apiFetch<{ boards: Board[]; total: number; hasNext: boolean }>(
      `/api/users/me/boards${toQuery(params)}`,
      { auth: true },
    );
  },
};
