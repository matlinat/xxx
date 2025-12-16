// components/nav-user/NavUserServer.tsx
import { createClient } from "@/lib/supabase/server";
import { getCachedUserProfile } from "@/lib/supabase/user-cache";
import { NavUser } from "./nav-user";

export default async function NavUserServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Nicht eingeloggt → minimaler Placeholder
    return (
      <NavUser user={{ name: "Guest", email: "—", avatar: "" }} />
    );
  }

  // Username & Avatar aus eigener Tabelle laden (gecacht innerhalb des Request-Zyklus)
  const profile = await getCachedUserProfile(user.id);

  return (
    <NavUser
      user={{
        name: profile?.username || user.user_metadata?.name || user.email || "User",
        email: user.email ?? "",
        avatar: profile?.avatar_url || user.user_metadata?.avatar_url || "",
      }}
    />
  );
}
