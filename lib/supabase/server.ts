import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, hasSupabaseConfig } from "@/lib/env";

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Components cannot always write refreshed auth cookies.
            }
          });
        }
      }
    }
  );
}
