import { apiFetch } from "./client";

export type OnboardingRequest = {
  giveFields: string[];
  interests: string[];
  regions: string[];
  customGiveText: string;
  customInterestText: string;
};

export const onboardingApi = {
  save(data: OnboardingRequest) {
    return apiFetch("/api/users/me/onboarding", {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
  },
};
