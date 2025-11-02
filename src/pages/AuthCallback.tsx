import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Velocity Auth Callback | Login";

    // Give Supabase a brief moment to process the URL hash and persist the session,
    // then navigate users to the app. This works for both implicit and PKCE flows.
    const process = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // If needed, we could attempt a code exchange here for PKCE, but the browser
        // client normally handles it automatically on page load.
        // Just proceed to the app regardless; AuthProvider will finalize state.
      } catch (_) {
        // no-op
      } finally {
        navigate("/", { replace: true });
      }
    };

    const t = setTimeout(process, 60);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-hover border-2">
          <CardHeader>
            <CardTitle>Signing you in…</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please wait while we complete the sign-in process.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;
