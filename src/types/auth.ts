export type User = {
  id: string;
  email: string;
  nickname: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User & {
    onboardingCompleted: boolean;
  };
};

export type RegisterRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type RegisterResponse = {
  user: User;
  nextAction: "LOGIN";
};

export type NicknameCheckResponse = {
  isAvailable: boolean;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
};
