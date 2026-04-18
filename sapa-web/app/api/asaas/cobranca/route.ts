import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// Mapa de planos: id → { valor, creditos, nome }
const PLANOS: Record<string, { valor: number; creditos: number; nome: string }> = {
  mensal:    { valor: 19.90,  creditos: 20,  nome: 'Mensal' },
  semestral: { valor: 99.90,  creditos: 120, nome: 'Semestral' },
  anual:     { valor: 179.90, creditos: 999, nome: 'Anual Ilimitado' },
}

const CREDITOS_AVULSOS: Record<number, number> = {
  5:  12.90,
  10: 22.90,
  20: 39.90,
  50: 89.90,
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipo, creditos, plano, metodoPagamento = 'PIX' } = body
    const billingType = metodoPagamento === 'CARTAO' ? 'CREDIT_CARD' : 'PIX'

    const asaasApiKey = process.env.ASAAS_API_KEY
    if (!asaasApiKey) {
      return NextResponse.json({ error: 'ASAAS_API_KEY não configurada' }, { status: 500 })
    }

    const asaasEnv = process.env.ASAAS_ENVIRONMENT || 'sandbox'
    const baseUrl = asaasEnv === 'sandbox'
      ? 'https://sandbox.asaas.com/api/v3'
      : 'https://www.asaas.com/api/v3'

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    }

    const { data: profile } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if (!profile.cpf) {
      return NextResponse.json({
        error: 'CPF não cadastrado. Acesse seu perfil e preencha o CPF antes de realizar um pagamento.',
        redirect: '/perfil'
      }, { status: 422 })
    }

    // ── Criar ou atualizar customer no Asaas ─────────────────────────────────
    let asaasCustomerId = profile.asaas_customer_id

    const customerPayload = {
      name: profile.nome_completo || user.email?.split('@')[0],
      email: user.email,
      cpfCnpj: profile.cpf,
      mobilePhone: profile.telefone || undefined,
      postalCode: profile.cep || undefined,
      address: profile.endereco || undefined,
      addressNumber: profile.numero_endereco || undefined,
      complement: profile.complemento || undefined,
      province: profile.bairro || undefined,
      city: profile.cidade || undefined,
      state: profile.estado || undefined,
      externalReference: user.id,
    }

    if (!asaasCustomerId) {
      const customerRes = await fetch(`${baseUrl}/customers`, {
        method: 'POST', headers, body: JSON.stringify(customerPayload)
      })
      const customerData = await customerRes.json()

      if (customerData.errors) {
        return NextResponse.json({ error: customerData.errors[0].description }, { status: 400 })
      }

      asaasCustomerId = customerData.id
      await supabase.from('perfis').update({ asaas_customer_id: asaasCustomerId }).eq('id', user.id)
    } else {
      // Atualiza o cliente existente com CPF e dados mais recentes
      await fetch(`${baseUrl}/customers/${asaasCustomerId}`, {
        method: 'PUT', headers, body: JSON.stringify(customerPayload)
      })
    }

    const today = new Date().toISOString().split('T')[0]
    let paymentId: string

    // ── Cobrança avulsa ──────────────────────────────────────────────────────
    if (tipo === 'avulso') {
      if (!creditos || !CREDITOS_AVULSOS[creditos]) {
        return NextResponse.json({ error: 'Quantidade de créditos inválida' }, { status: 400 })
      }

      const valor = CREDITOS_AVULSOS[creditos]
      const chargeRes = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer: asaasCustomerId,
          billingType,
          value: valor,
          dueDate: today,
          description: `ProsperAula — ${creditos} créditos avulsos`,
          externalReference: `AVULSO_${creditos}_${user.id}`,
          callback: {
            successUrl: `${request.nextUrl.origin}/planos?sucesso=true`,
            autoRedirect: true
          }
        })
      })

      const chargeData = await chargeRes.json()
      if (chargeData.errors) {
        return NextResponse.json({ error: chargeData.errors[0].description }, { status: 400 })
      }

      paymentId = chargeData.id

    // ── Assinatura mensal/semestral/anual ────────────────────────────────────
    } else if (tipo === 'assinatura') {
      const planoInfo = PLANOS[plano]
      if (!planoInfo) {
        return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
      }

      const cycleMap: Record<string, string> = {
        mensal: 'MONTHLY',
        semestral: 'SEMIANNUALLY',
        anual: 'YEARLY',
      }

      const subRes = await fetch(`${baseUrl}/subscriptions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customer: asaasCustomerId,
          billingType,
          cycle: cycleMap[plano],
          value: planoInfo.valor,
          nextDueDate: today,
          description: `ProsperAula — Plano ${planoInfo.nome}`,
          externalReference: `ASSINATURA_${plano}_${user.id}`,
          callback: {
            successUrl: `${request.nextUrl.origin}/planos?sucesso=true`,
            autoRedirect: true
          }
        })
      })

      const subData = await subRes.json()
      if (subData.errors) {
        return NextResponse.json({ error: subData.errors[0].description }, { status: 400 })
      }

      // Salva o ID da assinatura mas NÃO ativa ainda — aguarda webhook
      await supabase.from('perfis')
        .update({ asaas_subscription_id: subData.id })
        .eq('id', user.id)

      // Pega o pagamento gerado pela assinatura para obter o QR code
      const paymentsRes = await fetch(
        `${baseUrl}/subscriptions/${subData.id}/payments?limit=1`,
        { headers }
      )
      const paymentsData = await paymentsRes.json()
      paymentId = paymentsData.data?.[0]?.id || subData.id

    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // ── Cartão: retorna invoiceUrl para checkout Asaas ───────────────────────
    if (billingType === 'CREDIT_CARD') {
      const payRes = await fetch(`${baseUrl}/payments/${paymentId}`, { headers })
      const payData = await payRes.json()
      return NextResponse.json({
        success: true,
        paymentId,
        invoiceUrl: payData.invoiceUrl,
      })
    }

    // ── PIX: busca QR Code ───────────────────────────────────────────────────
    const qrRes = await fetch(`${baseUrl}/payments/${paymentId}/pixQrCode`, { headers })
    const qrData = await qrRes.json()

    return NextResponse.json({
      success: true,
      paymentId,
      qrCode: {
        encodedImage: qrData.encodedImage,
        payload: qrData.payload,
        expirationDate: qrData.expirationDate
      }
    })

  } catch (error: any) {
    console.error('[ASAAS] Erro ao criar cobrança:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
