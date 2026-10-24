import type { Profile } from "../types/community";
import { apiRequest } from "./apiClient";

export const getProfile = () => apiRequest<Profile | null>("/api/profile", {}, true);

export const updateProfile = (displayName: string, bio: string) => apiRequest<Profile>(
  "/api/profile",
  { method: "PATCH", body: JSON.stringify({ display_name: displayName, bio }) },
  true,
);

export const uploadAvatar = (file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return apiRequest<Profile>("/api/profile/avatar", { method: "POST", body: form }, true);
};

export const deleteAvatar = () => apiRequest<Profile>("/api/profile/avatar", { method: "DELETE" }, true);
