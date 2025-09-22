import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Webhook received:", body);

    // Handle different webhook events
    switch (body.type) {
      case "user.created":
        // Send welcome email when user signs up
        const user = body.record;
        console.log("New user created:", user.email);
        
        // Call our custom email function
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-custom-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: user.email,
            subject: "Bem-vindo ao Sistema de Arquivos!",
            type: "signup",
            userName: user.user_metadata?.full_name || user.email.split("@")[0],
            confirmUrl: `${body.site_url}/auth/confirm?token_hash=${body.token_hash}&type=signup&redirect_to=${body.site_url}`,
          }),
        });

        console.log("Welcome email sent to:", user.email);
        break;

      case "user.password_reset":
        // Send password reset email
        const resetUser = body.record;
        console.log("Password reset requested for:", resetUser.email);
        
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-custom-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: resetUser.email,
            subject: "Redefinir sua senha",
            type: "password_reset",
            userName: resetUser.user_metadata?.full_name || resetUser.email.split("@")[0],
            resetUrl: `${body.site_url}/auth/reset-password?token_hash=${body.token_hash}&type=recovery&redirect_to=${body.site_url}`,
          }),
        });

        console.log("Password reset email sent to:", resetUser.email);
        break;

      case "user.magic_link":
        // Send magic link email
        const magicUser = body.record;
        console.log("Magic link requested for:", magicUser.email);
        
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-custom-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: magicUser.email,
            subject: "Seu link de acesso",
            type: "magic_link",
            userName: magicUser.user_metadata?.full_name || magicUser.email.split("@")[0],
            magicUrl: `${body.site_url}/auth/confirm?token_hash=${body.token_hash}&type=magiclink&redirect_to=${body.site_url}`,
          }),
        });

        console.log("Magic link email sent to:", magicUser.email);
        break;

      default:
        console.log("Unhandled webhook type:", body.type);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (error) {
    console.error("Error in auth-webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});