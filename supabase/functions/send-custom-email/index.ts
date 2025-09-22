import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'signup' | 'password_reset' | 'magic_link';
  userName?: string;
  confirmUrl?: string;
  resetUrl?: string;
  magicUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, userName, confirmUrl, resetUrl, magicUrl }: EmailRequest = await req.json();

    let html = '';
    
    switch (type) {
      case 'signup':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Bem-vindo ao Sistema de Arquivos!</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Olá${userName ? `, ${userName}` : ''}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Obrigado por se inscrever no nosso sistema de gerenciamento de arquivos. 
                Para ativar sua conta, clique no botão abaixo:
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${confirmUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Confirmar Conta
                </a>
              </div>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Após a confirmação, você terá acesso completo a:
              </p>
              <ul style="color: #666; line-height: 1.8;">
                <li>Upload e download de arquivos</li>
                <li>Organização por categorias e grupos</li>
                <li>Compartilhamento seguro de documentos</li>
                <li>Player de áudio integrado</li>
                <li>Relatórios de uso detalhados</li>
              </ul>
              <p style="color: #999; font-size: 14px; margin-top: 40px;">
                Se você não criou esta conta, pode ignorar este email.
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Sistema de Arquivos - Todos os direitos reservados
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'password_reset':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Redefinir Senha</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Olá${userName ? `, ${userName}` : ''}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Recebemos uma solicitação para redefinir a senha da sua conta.
                Clique no botão abaixo para criar uma nova senha:
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Redefinir Senha
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Este link é válido por 24 horas. Se você não solicitou esta alteração, 
                pode ignorar este email com segurança.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 40px;">
                Por segurança, nunca compartilhe este link com outras pessoas.
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Sistema de Arquivos - Todos os direitos reservados
              </p>
            </div>
          </div>
        `;
        break;
        
      case 'magic_link':
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Acesso Rápido</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Olá${userName ? `, ${userName}` : ''}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Clique no link abaixo para entrar na sua conta sem precisar de senha:
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${magicUrl}" style="background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Entrar na Conta
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Este link é válido por 1 hora e pode ser usado apenas uma vez.
              </p>
              <p style="color: #999; font-size: 14px; margin-top: 40px;">
                Se você não solicitou este acesso, pode ignorar este email.
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Sistema de Arquivos - Todos os direitos reservados
              </p>
            </div>
          </div>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "Sistema de Arquivos <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-custom-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);