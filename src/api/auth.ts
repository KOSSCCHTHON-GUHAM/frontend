import {
    LoginRequest,
    LoginResponse,
    NicknameCheckResponse,
    RegisterRequest,
    RegisterResponse,
} from "../types/auth";
import api from "./client";

export const login = async (data: LoginRequest) => {
  const response = await api.post<LoginResponse>("/api/auth/login", data);

  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post<RegisterResponse>("/api/auth/register", data);

  return response.data;
};

export const checkNickname = async (nickname: string) => {
  const response = await api.get<NicknameCheckResponse>(
    "/api/auth/check-nickname",
    {
      params: { nickname },
    },
  );

  return response.data;
};
