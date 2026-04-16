export const dynamic = 'force-dynamic'

'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  Coins,
  Crown,
  Zap,
  Shield,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PlanosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [creditos, setCreditos] = useState(0)
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [compraCreditos, setCompraCreditos] = useState(5)
  const [tipoSelecionado, setTipoSelecionado] = useState<'avulso' | 'assinatura'>('avulso')
  const [planoSelecionado, setPlanoSelecionado] = useState('basico')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      
      setUserId(user.id)
      const { data: profile } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle()
      if (profile) {
        setCreditos(profile.creditos || 0)
        setAssinaturaAtiva(profile.assinatura_ativa || false)
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  useEffect(() => {
    if (searchParams.get('sucesso') === 'true') {
      alert('Pagamento confirmado! Seus créditos foram adicionados.')
      router.replace('/planos')
    }
  }, [searchParams, router])

  const handleComprarCreditos = async () => {
    setLoadingPayment(true)
    try {
      const res = await fetch('/api/asaas/cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'avulso',
          creditos: compraCreditos
        })
      })
      const data = await res.json()
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.qrCode) {
        setPixData(data)
        setShowPixModal(true)
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao processar pagamento')
    } finally {
      setLoadingPayment(false)
    }
  }

  const handleAssinarPlano = async () => {
    setLoadingPayment(true)
    try {
      const res = await fetch('/api/asaas/cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'assinatura',
          plano: planoSelecionado
        })
      })
      const data = await res.json()
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.qrCode) {
        setPixData(data)
        setShowPixModal(true)
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao processar pagamento')
    } finally {
      setLoadingPayment(false)
    }
  }

  const planos = [
    { 
      id: 'basico', 
      nome: 'Básico', 
      preco: 29.90, 
      creditos: 20, 
      icone: <Coins size={24} />,
      cores: 'from-muted to-stone'
    },
    { 
      id: 'pro', 
      nome: 'Pro', 
      preco: 49.90, 
      creditos: 50, 
      popular: true,
      icone: <Zap size={24} />,
      cores: 'from-terra to-terra-dark'
    },
    { 
      id: 'premium', 
      nome: 'Premium', 
      preco: 89.90, 
      creditos: 120, 
      icone: <Crown size={24} />,
      cores: 'from-gold to-orange-600'
    }
  ]

  const creditosAvulsos = [
    { qty: 5, preco: 14.90, unitario: 2.98 },
    { qty: 10, preco: 27.90, unitario: 2.79 },
    { qty: 20, preco: 49.90, unitario: 2.50 },
    { qty: 50, preco: 119.90, unitario: 2.40 }
  ]

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <Loader2 className="animate-spin text-terra" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-cream pb-12">
      <nav className="sapa-nav fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-graphite">
            <div className="w-8 h-8 bg-terra rounded-lg flex items-center justify-center text-white"><Sparkles size={18} /></div>
            <h1 className="text-sm font-black leading-none uppercase tracking-tighter">SAPA <span className="text-terra text-[9px] block">SaaS</span></h1>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-terra font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} strokeWidth={3} /> Voltar
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-24 space-y-10">
        <header className="text-center">
          <span className="text-[10px] font-black uppercase text-terra tracking-widest bg-terra/10 px-2 py-0.5 rounded inline-block mb-3">Créditos</span>
          <h2 className="text-3xl md:text-4xl font-black text-graphite tracking-tight">Adquira Créditos</h2>
          <p className="text-muted mt-2 max-w-md mx-auto font-medium">Cada plano de aula gerado consome 1 crédito. Escolha a melhor opção para você.</p>
        </header>

        {assinaturaAtiva && (
          <div className="bg-bark rounded-2xl p-6 text-white flex items-center justify-between shadow-xl shadow-stone/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-terra/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-terra/20 rounded-xl flex items-center justify-center text-terra-light"><Shield size={24} /></div>
              <div>
                <p className="font-black text-lg">Assinatura Ativa</p>
                <p className="text-white/60 text-xs uppercase tracking-widest">{creditos} créditos disponíveis</p>
              </div>
            </div>
            <div className="text-right relative z-10">
              <p className="text-3xl font-black">{creditos}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Saldo total</p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 p-1.5 bg-stone/20 rounded-2xl w-fit mx-auto">
          <button
            onClick={() => setTipoSelecionado('avulso')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipoSelecionado === 'avulso' ? 'bg-terra text-white shadow-lg shadow-terra/20' : 'text-muted hover:text-graphite'}`}
          >
            <CreditCard size={14} className="inline mr-2" /> Comprar Avulso
          </button>
          <button
            onClick={() => setTipoSelecionado('assinatura')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tipoSelecionado === 'assinatura' ? 'bg-terra text-white shadow-lg shadow-terra/20' : 'text-muted hover:text-graphite'}`}
          >
            <Crown size={14} className="inline mr-2" /> Assinar Plano
          </button>
        </div>

        {tipoSelecionado === 'avulso' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditosAvulsos.map((op) => (
              <div 
                key={op.qty}
                onClick={() => setCompraCreditos(op.qty)}
                className={`sapa-card p-6 text-center cursor-pointer transition-all hover:scale-[1.02] ${compraCreditos === op.qty ? 'border-terra bg-terra/5 ring-4 ring-terra/5' : 'bg-white'}`}
              >
                <div className={`text-3xl font-black mb-1 transition-colors ${compraCreditos === op.qty ? 'text-terra' : 'text-graphite'}`}>{op.qty}</div>
                <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">créditos</p>
                <div className="text-xl font-black text-graphite">R$ {op.preco.toFixed(2)}</div>
                <p className="text-[10px] text-muted/60 font-bold mt-1">R$ {op.unitario.toFixed(2)}/un</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <div 
                key={plano.id}
                onClick={() => setPlanoSelecionado(plano.id)}
                className={`relative sapa-card p-8 cursor-pointer transition-all hover:scale-[1.02] ${planoSelecionado === plano.id ? 'border-terra ring-4 ring-terra/5 bg-terra/[0.02]' : 'bg-white'}`}
              >
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terra text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em] shadow-lg shadow-terra/30">
                    Mais Popular
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${plano.cores} flex items-center justify-center text-white mb-6 shadow-lg shadow-stone/20`}>
                  {plano.icone}
                </div>
                <h3 className="text-xl font-black text-graphite mb-1 uppercase tracking-tight">{plano.nome}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black text-graphite tracking-tighter">R$ {plano.preco}</span>
                  <span className="text-muted text-xs font-bold">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} /> {plano.creditos} créditos/mês
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} /> Geração ilimitada
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} /> Suporte prioritário
                  </li>
                </ul>
                <div className={`text-center font-black text-[10px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all ${planoSelecionado === plano.id ? 'bg-terra text-white shadow-lg shadow-terra/20' : 'bg-stone/20 text-muted'}`}>
                  {planoSelecionado === plano.id ? 'Selecionado' : 'Escolher Plano'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-6">
          <button
            onClick={tipoSelecionado === 'avulso' ? handleComprarCreditos : handleAssinarPlano}
            disabled={loadingPayment}
            className="btn-primary w-full max-w-sm py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-terra/30"
          >
            {loadingPayment ? <Loader2 className="animate-spin" size={20} /> : tipoSelecionado === 'avulso' ? <CreditCard size={20} /> : <Crown size={20} />}
            {tipoSelecionado === 'avulso' 
              ? `Comprar ${compraCreditos} Créditos` 
              : `Assinar ${planos.find(p => p.id === planoSelecionado)?.nome}`
            }
          </button>
        </div>
      </main>

      {showPixModal && pixData && (
        <div className="fixed inset-0 bg-bark/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-graphite uppercase tracking-tight">Pagamento PIX</h3>
              <button onClick={() => setShowPixModal(false)} className="p-2 bg-stone/10 rounded-full text-muted hover:text-terra transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {pixData.qrCode?.imageUrl && (
              <div className="bg-white p-5 rounded-[24px] border-2 border-stone/20 mb-6 flex justify-center shadow-inner">
                <img src={pixData.qrCode.imageUrl} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1">Valor a Pagar</p>
                <p className="text-2xl font-black text-terra tracking-tight">
                  R$ {tipoSelecionado === 'avulso' 
                    ? creditosAvulsos.find(c => c.qty === compraCreditos)?.preco.toFixed(2)
                    : planos.find(p => p.id === planoSelecionado)?.preco.toFixed(2)
                  }
                </p>
              </div>
              
              {pixData.pixCode && (
                <div>
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Código Copia e Cola</p>
                  <div className="bg-cream-dark p-4 rounded-xl text-[10px] font-mono text-graphite break-all border-2 border-stone/20 font-bold">
                    {pixData.pixCode}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => { navigator.clipboard.writeText(pixData.pixCode); alert('Código copiado!') }}
              className="w-full mt-6 py-3 bg-bark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-graphite transition-all"
            >
              Copiar Código PIX
            </button>
            
            <p className="text-center text-muted text-[10px] mt-6 font-medium leading-relaxed uppercase tracking-tight opacity-60">
              Os créditos serão liberados imediatamente após a confirmação do pagamento pelo banco.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
