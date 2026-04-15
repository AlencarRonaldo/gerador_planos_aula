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
      cores: 'from-slate-600 to-slate-700'
    },
    { 
      id: 'pro', 
      nome: 'Pro', 
      preco: 49.90, 
      creditos: 50, 
      popular: true,
      icone: <Zap size={24} />,
      cores: 'from-indigo-600 to-violet-600'
    },
    { 
      id: 'premium', 
      nome: 'Premium', 
      preco: 89.90, 
      creditos: 120, 
      icone: <Crown size={24} />,
      cores: 'from-amber-500 to-orange-600'
    }
  ]

  const creditosAvulsos = [
    { qty: 5, preco: 14.90, unitario: 2.98 },
    { qty: 10, preco: 27.90, unitario: 2.79 },
    { qty: 20, preco: 49.90, unitario: 2.50 },
    { qty: 50, preco: 119.90, unitario: 2.40 }
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  return (
    <div className="min-h-screen pb-12">
      <nav className="nav-blur px-6 py-3 mb-8 flex justify-between items-center shadow-sm bg-white/80 fixed top-0 w-full z-50">
        <Link href="/" className="flex items-center gap-2 text-slate-900">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Sparkles size={18} /></div>
          <h1 className="text-base font-bold leading-none">SAPA <span className="text-indigo-600 text-[9px] block font-black uppercase tracking-tighter">SaaS</span></h1>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">
          <ArrowLeft size={14} /> Voltar
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-28 space-y-10">
        <header className="text-center">
          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2 py-0.5 rounded inline-block mb-3">Créditos</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Adquira Créditos</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">Cada plano de aula gerado consome 1 crédito. Escolha a melhor opção para você.</p>
        </header>

        {assinaturaAtiva && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><Shield size={24} /></div>
              <div>
                <p className="font-black text-lg">Assinatura Ativa</p>
                <p className="text-emerald-100 text-sm">{creditos} créditos disponíveis</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{creditos}</p>
              <p className="text-emerald-100 text-xs uppercase tracking-widest">créditos</p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setTipoSelecionado('avulso')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tipoSelecionado === 'avulso' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <CreditCard size={14} className="inline mr-2" /> Comprar Avulso
          </button>
          <button
            onClick={() => setTipoSelecionado('assinatura')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${tipoSelecionado === 'assinatura' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
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
                className={`premium-card p-5 text-center cursor-pointer transition-all hover:shadow-lg hover:border-indigo-200 ${compraCreditos === op.qty ? 'border-indigo-600 bg-indigo-50' : 'bg-white'}`}
              >
                <div className="text-3xl font-black text-indigo-600 mb-1">{op.qty}</div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">créditos</p>
                <div className="text-xl font-black text-slate-900">R$ {op.preco.toFixed(2)}</div>
                <p className="text-[10px] text-slate-400">R$ {op.unitario.toFixed(2)}/un</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planos.map((plano) => (
              <div 
                key={plano.id}
                onClick={() => setPlanoSelecionado(plano.id)}
                className={`relative premium-card p-6 cursor-pointer transition-all hover:shadow-xl hover:border-indigo-200 ${planoSelecionado === plano.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'bg-white'}`}
              >
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest shadow-lg">
                    Mais Popular
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${plano.cores} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {plano.icone}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{plano.nome}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-slate-900">R$ {plano.preco}</span>
                  <span className="text-slate-400 text-xs">/mês</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500" /> {plano.creditos} créditos/mês
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500" /> Geração ilimitada
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500" /> Suporte prioritário
                  </li>
                </ul>
                <div className={`text-center font-black text-sm uppercase tracking-widest py-3 rounded-xl ${planoSelecionado === plano.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {planoSelecionado === plano.id ? 'Selecionado' : 'Selecionar'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center pt-4">
          <button
            onClick={tipoSelecionado === 'avulso' ? handleComprarCreditos : handleAssinarPlano}
            disabled={loadingPayment}
            className="btn-gradient px-10 py-4 text-sm font-black uppercase tracking-widest flex items-center gap-3"
          >
            {loadingPayment ? <Loader2 className="animate-spin" size={18} /> : tipoSelecionado === 'avulso' ? <CreditCard size={18} /> : <Crown size={18} />}
            {tipoSelecionado === 'avulso' 
              ? `Comprar ${compraCreditos} Créditos` 
              : `Assinar Plano ${planos.find(p => p.id === planoSelecionado)?.nome}`
            }
          </button>
        </div>
      </main>

      {showPixModal && pixData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900">Pagamento PIX</h3>
              <button onClick={() => setShowPixModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            {pixData.qrCode?.imageUrl && (
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 flex justify-center">
                <img src={pixData.qrCode.imageUrl} alt="QR Code PIX" className="w-48 h-48" />
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor</p>
                <p className="text-xl font-black text-slate-900">
                  R$ {tipoSelecionado === 'avulso' 
                    ? creditosAvulsos.find(c => c.qty === compraCreditos)?.preco.toFixed(2)
                    : planos.find(p => p.id === planoSelecionado)?.preco.toFixed(2)
                  }
                </p>
              </div>
              
              {pixData.pixCode && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Copie o código PIX</p>
                  <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-600 break-all border-2 border-slate-100">
                    {pixData.pixCode}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-center text-slate-400 text-xs mt-4">
              Escaneie o QR Code ou copie o código PIX para pagar. Os créditos serão adicionados automaticamente após a confirmação.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
