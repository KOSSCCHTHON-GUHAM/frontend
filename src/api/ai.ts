import { apiFetch, toQuery } from "./client";
import { appendImages } from "./boards";
import type { Board, UploadImage, UserProfile } from "./types";

export type AiDraft = {
  title: string;
  category: string;
  recruitCount: number;
  content: string;
  giveTags: string[];
  needTags: string[];
  activityRegion: string;
  activityMethod: string;
  activityHours: string;
  relatedLinks: string[];
  warnings?: string[];
};

export const aiApi = {
  createDraft(images: UploadImage[], links: string[]) {
    const form = new FormData();
    appendImages(form, images);
    form.append("links", JSON.stringify(links));
    return apiFetch<AiDraft>("/api/ai/draft", {
      method: "POST",
      auth: true,
      body: form,
    });
  },
  recommendBoards(params: {
    category?: string;
    keyword?: string;
    page?: number;
    limit?: number;
  } = {}) {
    return apiFetch<{
      boards: Array<Board & { matchScore: number; recommendationReasons: string[] }>;
      total: number;
      page: number;
      hasNext: boolean;
    }>(`/api/ai/recommend/boards${toQuery(params)}`, { auth: true });
  },
  recommendUsers(boardId: string, limit = 10) {
    return apiFetch<{
      recommendations: Array<{
        user: UserProfile;
        rank: number;
        matchScore: number;
        matchedTags: string[];
        recommendationReasons: string[];
      }>;
    }>(`/api/ai/recommend/users${toQuery({ boardId, limit })}`, { auth: true });
  },
};
