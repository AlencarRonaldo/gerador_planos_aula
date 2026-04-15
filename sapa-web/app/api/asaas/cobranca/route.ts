import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { tipo, creditos, plano } = body

    const asaasApiKey = process.env.ASAAS_API_KEY
    const asaasEnv = process.env.ASAAS_ENVIRONMENT || 'sandbox'
    const baseUrl = asaasEnv === 'sandbox' 
      ? 'https://sandbox.asaas.com/api/v3' 
      : 'https://www.asaas.com/api/v3'

    const { data: profile } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    let asaasCustomerId = profile.asaas_customer_id

    if (!asaasCustomerId) {
      const customerRes = await fetch(`${baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey!
        },
        body: JSON.stringify({
          name: profile.nome_completo || user.email?.split('@')[0],
          email: user.email,
          cpfCnpj: '',
          phone: ''
        })
      })

      const customerData = await customerRes.json()
      
      if (customerData.errors) {
        return NextResponse.json({ error: customerData.errors[0].description }, { status: 400 })
      }

      asaasCustomerId = customerData.id

      await supabase
        .from('perfis')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', user.id)
    }

    let paymentData: any

    if (tipo === 'avulso') {
      const valorUnitario = 2.90
      const valorTotal = creditos * valorUnitario

      const pixCopy = `SAPA - ${creditos} crédito(s)`

      const chargeRes = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey!
        },
        body: JSON.stringify({
          customer: asaasCustomerId,
          billingType: 'PIX',
          value: valorTotal,
          dueDate: new Date().toISOString().split('T')[0],
          description: pixCopy,
          callback: {
            successUrl: `${request.nextUrl.origin}/planos?sucesso=true`,
            autoRedirect: true
          }
        })
      })

      paymentData = await chargeRes.json()

      if (paymentData.errors) {
        return NextResponse.json({ error: paymentData.errors[0].description }, { status: 400 })
      }

    } else if (tipo === 'assinatura') {
      const precos: Record<string, { valor: number; creditos: number; nome: string }> = {
        'basico': { valor: 29.90, creditos: 20, nome: 'Básico' },
        'pro': { valor: 49.90, creditos: 50, nome: 'Pro' },
        'premium': { valor: 89.90, creditos: 120, nome: 'Premium' }
      }

      const planoInfo = precos[plano]
      if (!planoInfo) {
        return NextResponse.json({ erro: 'Plano inválido' }, { status: 400 })
      }

      const subscriptionRes = await fetch(`${baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey!
        },
        body: JSON.stringify({
          customer: asaasCustomerId,
          billingType: 'PIX',
          cycle: 'MONTHLY',
          value: planoInfo.valor,
          description: `SAPA - Plano ${planoInfo.nome}`,
          nextDueDate: new Date().toISOString().split('T')[0],
          callback: {
            successUrl: `${request.nextUrl.origin}/planos?sucesso=true`,
            autoRedirect: true
          }
        })
      })

      paymentData = await subscriptionRes.json()

      if (paymentData.errors) {
        return NextResponse.json({ error: paymentData.errors[0].description }, { status: 400 })
      }

      await supabase
        .from('perfis')
        .update({ 
          asaas_subscription_id: paymentData.id,
          assinatura_ativa: true,
          creditos: profile.creditos + planoInfo.creditos
        })
        .eq('id', user.id)
    }

    return NextResponse.json({ 
      success: true,
      paymentId: paymentData.id,
      paymentUrl: paymentData.invoiceUrl,
      qrCode: paymentData.qrCode,
      pixCode: paymentData.qrCode?.payload,
      tipo
    })

  } catch (error: any) {
    console.error('Erro ao criar cobrança:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
