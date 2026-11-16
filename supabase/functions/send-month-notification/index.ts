// Supabase Edge Function: send-month-notification
// Envia e-mail ao conselho informando que o lançamento de um mês/ano foi finalizado.
//
// Variáveis de ambiente (secrets) necessárias:
//   SUPABASE_URL                -> fornecida automaticamente pelo Supabase
//   SUPABASE_ANON_KEY           -> fornecida automaticamente pelo Supabase
//   SUPABASE_SERVICE_ROLE_KEY   -> fornecida automaticamente pelo Supabase
//   RESEND_API_KEY              -> criar secret (chave da Resend)
//   NOTIFICATION_FROM_EMAIL     -> criar secret (remetente verificado na Resend)
//   NOTIFICATION_FROM_NAME      -> opcional (ex: "Lumina"); padrão "Lumina"

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function buildEmailHtml({ month, year, platformUrl }: { month: string; year: string; platformUrl: string }) {
  const logoUrl = platformUrl ? `${platformUrl}/logo-ipim-verde.png` : ''
  const currentYear = new Date().getFullYear()

  const logoBlock = logoUrl
    ? `<img src="${logoUrl}" alt="Lumina" width="40" height="40" style="display:block;border-radius:10px;" />`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lançamento finalizado</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0e0e0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e0e0e;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="height:4px;background-color:#16a34a;line-height:4px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:12px;">${logoBlock}</td>
                    <td style="font-size:18px;font-weight:600;color:#ededed;letter-spacing:0.02em;">Lumina</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0 32px;">
                <h1 style="margin:16px 0 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-weight:600;">
                  Lançamento de ${month} de ${year} finalizado
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 0 32px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#b5b5b5;">
                  Prezado(a) conselheiro(a), informamos que o lançamento das entradas e saídas
                  referente a <strong style="color:#ededed;font-weight:600;">${month} de ${year}</strong>
                  foi finalizado.
                </p>
                <p style="margin:16px 0 0 0;font-size:15px;line-height:1.6;color:#b5b5b5;">
                  A prestação de contas já pode ser consultada na plataforma Lumina.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <a href="${platformUrl}" target="_blank" style="display:inline-block;background-color:#16a34a;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 24px;border-radius:10px;">
                  Acessar a plataforma
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#7a7a7a;">
                  Se o botão não abrir, copie e cole o link no navegador:<br />
                  <a href="${platformUrl}" target="_blank" style="color:#4ade80;text-decoration:none;word-break:break-all;">${platformUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #2a2a2a;">
                <p style="margin:0;font-size:12px;color:#7a7a7a;text-align:center;">
                  &copy; ${currentYear} Lumina &middot; IPIM
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

type NotifyPayload = {
  month?: string
  year?: string | number
  platformUrl?: string
  cashFlowName?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL')
    const fromName = Deno.env.get('NOTIFICATION_FROM_NAME') ?? 'Lumina'

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Configuração do Supabase ausente.' }, 500)
    }
    if (!resendApiKey || !fromEmail) {
      return json({ error: 'Provedor de e-mail não configurado (RESEND_API_KEY / NOTIFICATION_FROM_EMAIL).' }, 500)
    }

    // Identifica o usuário que está chamando a função
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await userClient.auth.getUser()
    if (userError || !userData?.user?.email) {
      return json({ error: 'Não autenticado.' }, 401)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Somente administradores podem disparar a notificação
    const { data: requester } = await adminClient
      .from('users')
      .select('rules_admin')
      .eq('email', userData.user.email)
      .maybeSingle()

    if (requester?.rules_admin !== true) {
      return json({ error: 'Apenas administradores podem enviar esta notificação.' }, 403)
    }

    const body = (await req.json().catch(() => ({}))) as NotifyPayload
    const month = String(body.month ?? '').trim()
    const year = String(body.year ?? '').trim()
    const platformUrl = String(body.platformUrl ?? '').trim().replace(/\/+$/, '')

    if (!month || !year) {
      return json({ error: 'Informe o mês e o ano da movimentação.' }, 400)
    }
    if (!platformUrl) {
      return json({ error: 'Link da plataforma não informado.' }, 400)
    }

    // Lê os e-mails de todos os usuários cadastrados
    const { data: users, error: usersError } = await adminClient.from('users').select('email')
    if (usersError) {
      return json({ error: usersError.message }, 500)
    }

    const recipients = Array.from(
      new Set(
        (users ?? [])
          .map((row) => String(row.email ?? '').trim())
          .filter((email) => email.length > 0),
      ),
    )

    if (recipients.length === 0) {
      return json({ error: 'Nenhum destinatário cadastrado na tabela users.' }, 400)
    }

    const subject = `Lançamento de ${month} de ${year} finalizado — Lumina`
    const html = buildEmailHtml({ month, year, platformUrl })

    let sent = 0
    const failures: string[] = []

    // Envia individualmente para preservar a privacidade dos destinatários
    for (const to of recipients) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject,
          html,
        }),
      })

      if (response.ok) {
        sent += 1
      } else {
        const detail = await response.text().catch(() => '')
        console.error(`Falha ao enviar para ${to}:`, response.status, detail)
        failures.push(to)
      }
    }

    return json({
      sent,
      failed: failures.length,
      recipients: recipients.length,
    })
  } catch (error) {
    console.error('Erro inesperado ao notificar conselho:', error)
    return json({ error: 'Erro inesperado ao enviar a notificação.' }, 500)
  }
})
