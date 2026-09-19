import { sessionStore } from "@/auth/session";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
  retryAuth?: boolean;
};

type ErrorPayload = { error?: string; message?: string };

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    const errorPayload = payload as ErrorPayload | undefined;
    super(errorPayload?.error ?? errorPayload?.message ?? `요청 실패 (${status})`);
    this.name = "ApiError";
  }
}

const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? response.json()
    : response.text();
};

const refreshSession = async (): Promise<boolean> => {
  const refreshToken = await sessionStore.getRefreshToken();
  if (!refreshToken) return false;

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    await sessionStore.clear();
    return false;
  }

  const tokens = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  await sessionStore.save(tokens.accessToken, tokens.refreshToken);
  return true;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = false, retryAuth = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const accessToken = await sessionStore.getAccessToken();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  if (response.status === 401 && auth && retryAuth && (await refreshSession())) {
    return apiFetch<T>(path, { ...options, retryAuth: false });
  }

  const payload = await parseResponse(response);
  if (!response.ok) throw new ApiError(response.status, payload);
  return payload as T;
}

export const toQuery = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const value = query.toString();
  return value ? `?${value}` : "";
};
