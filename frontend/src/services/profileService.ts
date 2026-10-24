import type { Profile } from "../types/community";
import { apiRequest } from "./apiClient";

export function getProfile() {
  return apiRequest<Profile | null>("/api/profile", {}, true);
}

export function updateProfile(displayName: string, bio: string) {
  return apiRequest<Profile>(
    "/api/profile",
    {
      method: "PATCH",
      body: JSON.stringify({ display_name: displayName, bio }),
    },
    true,
  );
}

export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  return apiRequest<Profile>(
    "/api/profile/avatar",
    { method: "POST", body: form },
    true,
  );
}

export function deleteAvatar() {
  return apiRequest<Profile>(
    "/api/profile/avatar",
    { method: "DELETE" },
    true,
  );
}
