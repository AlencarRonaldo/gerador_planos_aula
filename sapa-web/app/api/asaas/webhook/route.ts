import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Mesma tabela do cobranca/route.ts
const CREDITOS_PLANO: Record<string, number> = {
  mensal:    20,
  semestral: 120,
  anual:     999,
}

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey)
}

// Resolve quantos créditos conceder a partir do externalReference
// Formatos: "AVULSO_N_userId" | "ASSINATURA_plano_userId"
function resolverCreditos(externalReference: string | undefined, paymentValue: number): number {
  if (!externalReference) {
    // Fallback antigo (não deve chegar aqui para novas cobranças)
    return Math.floor(paymentValue / 2)
  }

  if (externalReference.startsWith('AVULSO_')) {
    const parts = externalReference.split('_')  // ['AVULSO', 'N', 'userId']
    const qtd = parseInt(parts[1])
    return isNaN(qtd) ? 0 : qtd
  }

  if (externalReference.startsWith('ASSINATURA_')) {
    const parts = externalReference.split('_')  // ['ASSINATURA', 'plano', 'userId']
    const plano = parts[1]
    return CREDITOS_PLANO[plano] ?? 0
  }

  return 0
}

export async function POST(request: NextRequest) {
  try {
    // Valida token de autenticação configurado no painel Asaas
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN
    if (webhookToken) {
      const receivedToken = request.headers.get('asaas-access-token')
      if (receivedToken !== webhookToken) {
        console.warn('[ASAAS WEBHOOK] Token inválido — requisição rejeitada')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { event, payment, subscription } = body

    console.log(`[ASAAS WEBHOOK] Evento: ${event}`)

    // ── Pagamento confirmado ─────────────────────────────────────────────────
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const supabase = getServiceClient()
      const customerId = payment?.customer

      if (!customerId) {
        console.warn('[ASAAS WEBHOOK] Pagamento sem customer ID')
        return NextResponse.json({ success: true })
      }

      const { data: profile } = await supabase
        .from('perfis')
        .select('id, nome_completo, creditos')
        .eq('asaas_customer_id', customerId)
        .maybeSingle()

      if (!profile) {
        console.warn(`[ASAAS WEBHOOK] Perfil não encontrado para customer: ${customerId}`)
        return NextResponse.json({ success: true })
      }

      const creditos = resolverCreditos(payment?.externalReference, payment?.value ?? 0)
      console.log(`[ASAAS WEBHOOK] +${creditos} créditos para ${profile.nome_completo} (ref: ${payment?.externalReference})`)

      const updates: Record<string, any> = {
        creditos: (profile.creditos ?? 0) + creditos,
      }

      // Se for assinatura, ativa também
      if (payment?.externalReference?.startsWith('ASSINATURA_')) {
        updates.assinatura_ativa = true
      }

      await supabase.from('perfis').update(updates).eq('id', profile.id)
    }

    // ── Assinatura cancelada / inativa ───────────────────────────────────────
    if (event === 'SUBSCRIPTION_INACTIVE' || event === 'SUBSCRIPTION_CANCELLED') {
      const supabase = getServiceClient()
      const subscriptionId = subscription?.id

      if (subscriptionId) {
        console.log(`[ASAAS WEBHOOK] Cancelando assinatura: ${subscriptionId}`)
        await supabase
          .from('perfis')
          .update({ assinatura_ativa: false })
          .eq('asaas_subscription_id', subscriptionId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[ASAAS WEBHOOK] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
