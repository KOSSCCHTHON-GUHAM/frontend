import { Platform } from "react-native";
import { apiFetch, toQuery } from "./client";
import type { Board, BoardInput, UploadImage } from "./types";

const appendImages = (form: FormData, images: UploadImage[]) => {
  images.forEach((image) => {
    if (Platform.OS === "web" && image.file) {
      form.append("images", image.file, image.name);
      return;
    }
    form.append("images", image as unknown as Blob);
  });
};

export const boardsApi = {
  list(params: {
    category?: string;
    keyword?: string;
    sort?: "LATEST" | "RECOMMENDED";
    page?: number;
    limit?: number;
  } = {}) {
    return apiFetch<{ boards: Board[]; total: number; page: number; hasNext: boolean }>(
      `/api/boards${toQuery(params)}`,
    );
  },
  detail(id: string) {
    return apiFetch<{
      board: Board;
      author: UserProfileSummary | null;
      permissions: { isOwner: boolean };
      imageUrls: string[];
      relatedLinks: string[];
    }>(`/api/boards/${id}`, { auth: true });
  },
  create(payload: BoardInput, images: UploadImage[] = []) {
    const form = new FormData();
    appendImages(form, images);
    form.append("payload", JSON.stringify(payload));
    return apiFetch<{ board: Board }>("/api/boards", {
      method: "POST",
      auth: true,
      body: form,
    });
  },
  update(id: string, payload: Partial<BoardInput>) {
    return apiFetch<{ board: Board }>(`/api/boards/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(payload),
    });
  },
  remove(id: string) {
    return apiFetch<void>(`/api/boards/${id}`, { method: "DELETE", auth: true });
  },
};

type UserProfileSummary = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  giveFields?: string[];
};

export { appendImages };
