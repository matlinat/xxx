// components/nav-user/NavUserServer.tsx
import { createClient } from "@/lib/supabase/server";
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

  // Username & Avatar aus eigener Tabelle laden (auth_user_id = auth.users.id)
  const { data: profile } = await supabase
    .from("users")
    .select("username, avatar_url")
    .eq("auth_user_id", user.id)
    .maybeSingle();

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
