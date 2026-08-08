import { supabase } from "@/integrations/supabase/client";

/**
 * Consume an OAuth return trip.
 *
 * The Lovable OAuth broker uses two flows:
 *  - popup / `web_message` (inside the editor preview): the helper sets the
 *    session itself, nothing to do here.
 *  - full-page redirect (published site / new tab): the browser comes back to
 *    the `redirect_uri` carrying tokens in the URL hash or query string. Nobody
 *    consumes them automatically, so the session is never persisted and the
 *    auth guard bounces the user back to the login page.
 *
 * This helper handles the redirect case for both token and PKCE (`code`)
 * responses, then strips the credentials out of the URL.
 */
export async function consumeOAuthReturn(): Promise<{
  handled: boolean;
  error: Error | null;
}> {
  if (typeof window === "undefined") return { handled: false, error: null };

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const pick = (key: string) => hash.get(key) ?? query.get(key);

  const errorDescription = pick("error_description") ?? pick("error");
  const accessToken = pick("access_token");
  const refreshToken = pick("refresh_token");
  const code = pick("code");

  if (!errorDescription && !accessToken && !code) {
    return { handled: false, error: null };
  }

  const clean = () => {
    const url = new URL(window.location.href);
    for (const key of [
      "access_token",
      "refresh_token",
      "expires_in",
      "expires_at",
      "token_type",
      "provider_token",
      "provider_refresh_token",
      "code",
      "state",
      "error",
      "error_code",
      "error_description",
    ]) {
      url.searchParams.delete(key);
    }
    url.hash = "";
    window.history.replaceState({}, "", url.pathname + url.search);
  };

  try {
    if (errorDescription) {
      clean();
      return { handled: true, error: new Error(errorDescription) };
    }

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      clean();
      return { handled: true, error: error ? new Error(error.message) : null };
    }

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      clean();
      return { handled: true, error: error ? new Error(error.message) : null };
    }

    clean();
    return { handled: true, error: new Error("Sign-in response was incomplete") };
  } catch (err) {
    clean();
    return {
      handled: true,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
