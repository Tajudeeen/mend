import type { User } from "@supabase/supabase-js";

// Display data only. Ownership always comes from the verified user ID.
export function organizerProfile(user: User) {
  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";
  return {
    displayName:
      text(user.user_metadata?.display_name, 80) ||
      text(user.user_metadata?.full_name, 80) ||
      text(user.user_metadata?.name, 80),
    organization: text(user.user_metadata?.organization, 100),
    email: text(user.email, 254),
    editable: true,
  };
}
