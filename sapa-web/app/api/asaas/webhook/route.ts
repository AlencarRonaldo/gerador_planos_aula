import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { event, payment, subscription } = body

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      console.log(`[ASAAS WEBHOOK] Pagamento confirmado para customer: ${payment?.customer || subscription?.customer}`)
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      const customerId = payment?.customer || subscription?.customer

      if (customerId) {
        const { data: profile } = await supabase
          .from('perfis')
          .select('*')
          .eq('asaas_customer_id', customerId)
          .maybeSingle()

        if (profile) {
          console.log(`[ASAAS WEBHOOK] Perfil encontrado: ${profile.nome_completo} (ID: ${profile.id})`)
          
          if (payment?.value) {
            const creditosComprados = Math.floor(payment.value / 2.00)
            console.log(`[ASAAS WEBHOOK] Adicionando ${creditosComprados} créditos (Valor: R$ ${payment.value})`)
            
            await supabase
              .from('perfis')
              .update({ 
                creditos: profile.creditos + creditosComprados
              })
              .eq('id', profile.id)
          }

          if (subscription) {
            await supabase
              .from('perfis')
              .update({ 
                assinatura_ativa: true,
                creditos: profile.creditos + (subscription.creditsIncluded || 0)
              })
              .eq('id', profile.id)
          }
        }
      }
    }

    if (event === 'SUBSCRIPTION_INACTIVE' || event === 'SUBSCRIPTION_CANCELLED') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)

      const subscriptionId = subscription?.id

      if (subscriptionId) {
        await supabase
          .from('perfis')
          .update({ assinatura_ativa: false })
          .eq('asaas_subscription_id', subscriptionId)
      }
    }

    return NextResponse.json({ success: true })
  } 
  catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
