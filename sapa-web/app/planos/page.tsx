'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Sparkles,
  Check,
  ArrowLeft,
  Loader2,
  Coins,
  Crown,
  Zap,
  Shield,
  X,
  Copy,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Espelha cobranca/route.ts
const PLANOS = [
  {
    id: 'mensal',
    nome: 'Mensal',
    preco: 19.90,
    creditos: 20,
    periodo: '/mês',
    icone: <Coins size={24} />,
    cores: 'from-muted to-stone'
  },
  {
    id: 'semestral',
    nome: 'Semestral',
    preco: 99.90,
    creditos: 120,
    periodo: '/6 meses',
    popular: true,
    icone: <Zap size={24} />,
    cores: 'from-terra to-terra-dark'
  },
  {
    id: 'anual',
    nome: 'Anual Ilimitado',
    preco: 179.90,
    creditos: 999,
    periodo: '/ano',
    icone: <Crown size={24} />,
    cores: 'from-gold to-orange-600'
  }
]

const CREDITOS_AVULSOS = [
  { qty: 5,  preco: 12.90 },
  { qty: 10, preco: 22.90 },
  { qty: 20, preco: 39.90 },
  { qty: 50, preco: 89.90 },
]

export default function PlanosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [creditos, setCreditos] = useState(0)
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false)
  const [showPixModal, setShowPixModal] = useState(false)
  const [pixData, setPixData] = useState<any>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [compraCreditos, setCompraCreditos] = useState(10)
  const [tipoSelecionado, setTipoSelecionado] = useState<'avulso' | 'assinatura'>('avulso')
  const [planoSelecionado, setPlanoSelecionado] = useState('semestral')
  const [copiado, setCopiado] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

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
      showToast('Pagamento confirmado! Seus créditos serão adicionados em breve.')
      router.replace('/planos')
    }
  }, [searchParams, router])

  const handleComprar = async () => {
    setLoadingPayment(true)
    try {
      const body = tipoSelecionado === 'avulso'
        ? { tipo: 'avulso', creditos: compraCreditos }
        : { tipo: 'assinatura', plano: planoSelecionado }

      const res = await fetch('/api/asaas/cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if (data.error) {
        if (data.redirect) {
          router.push(data.redirect)
        } else {
          showToast(`Erro: ${data.error}`)
        }
        return
      }

      if (data.qrCode) {
        setPixData(data)
        setShowPixModal(true)
      }
    } catch (e) {
      console.error(e)
      showToast('Erro ao processar pagamento')
    } finally {
      setLoadingPayment(false)
    }
  }

  const copiarCodigo = () => {
    const payload = pixData?.qrCode?.payload
    if (!payload) return
    navigator.clipboard.writeText(payload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const precoSelecionado = tipoSelecionado === 'avulso'
    ? CREDITOS_AVULSOS.find(c => c.qty === compraCreditos)?.preco
    : PLANOS.find(p => p.id === planoSelecionado)?.preco

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
            <h1 className="text-sm font-black leading-none uppercase tracking-tighter">PlanoAi <span className="text-terra text-[9px] block">Inteligência Artificial</span></h1>
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

        {/* Toggle */}
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

        {/* Créditos avulsos */}
        {tipoSelecionado === 'avulso' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CREDITOS_AVULSOS.map((op) => (
              <div
                key={op.qty}
                onClick={() => setCompraCreditos(op.qty)}
                className={`sapa-card p-6 text-center cursor-pointer transition-all hover:scale-[1.02] ${compraCreditos === op.qty ? 'border-terra bg-terra/5 ring-4 ring-terra/5' : 'bg-white'}`}
              >
                <div className={`text-3xl font-black mb-1 transition-colors ${compraCreditos === op.qty ? 'text-terra' : 'text-graphite'}`}>{op.qty}</div>
                <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">créditos</p>
                <div className="text-xl font-black text-graphite">R$ {op.preco.toFixed(2)}</div>
                <p className="text-[10px] text-muted/60 font-bold mt-1">R$ {(op.preco / op.qty).toFixed(2)}/un</p>
              </div>
            ))}
          </div>
        ) : (
          /* Planos de assinatura */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANOS.map((plano) => (
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
                  <span className="text-3xl font-black text-graphite tracking-tighter">R$ {plano.preco.toFixed(2)}</span>
                  <span className="text-muted text-xs font-bold">{plano.periodo}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} />
                    {plano.creditos === 999 ? 'Créditos ilimitados' : `${plano.creditos} créditos`}
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} /> Geração com IA
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-muted uppercase tracking-tight">
                    <Check size={14} className="text-terra" strokeWidth={4} /> Pagamento via PIX
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
            onClick={handleComprar}
            disabled={loadingPayment}
            className="btn-primary w-full max-w-sm py-5 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-terra/30 flex items-center justify-center gap-3"
          >
            {loadingPayment
              ? <Loader2 className="animate-spin" size={20} />
              : tipoSelecionado === 'avulso' ? <CreditCard size={20} /> : <Crown size={20} />
            }
            {loadingPayment
              ? 'Processando...'
              : tipoSelecionado === 'avulso'
                ? `Comprar ${compraCreditos} Créditos — R$ ${precoSelecionado?.toFixed(2)}`
                : `Assinar ${PLANOS.find(p => p.id === planoSelecionado)?.nome} — R$ ${precoSelecionado?.toFixed(2)}`
            }
          </button>
        </div>
      </main>

      {/* Modal PIX */}
      {showPixModal && pixData && (
        <div className="fixed inset-0 bg-bark/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-graphite uppercase tracking-tight">Pagamento PIX</h3>
              <button onClick={() => setShowPixModal(false)} className="p-2 bg-stone/10 rounded-full text-muted hover:text-terra transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* QR Code base64 */}
            {pixData.qrCode?.encodedImage && (
              <div className="bg-white p-4 rounded-[24px] border-2 border-stone/20 mb-6 flex justify-center shadow-inner">
                <img
                  src={`data:image/png;base64,${pixData.qrCode.encodedImage}`}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>
            )}

            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1">Valor a Pagar</p>
                <p className="text-2xl font-black text-terra tracking-tight">
                  R$ {precoSelecionado?.toFixed(2)}
                </p>
              </div>

              {/* Código copia-e-cola */}
              {pixData.qrCode?.payload && (
                <div>
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">Código Copia e Cola</p>
                  <div className="bg-cream p-3 rounded-xl text-[9px] font-mono text-graphite break-all border-2 border-stone/20 font-bold max-h-20 overflow-hidden select-all">
                    {pixData.qrCode.payload}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={copiarCodigo}
              className="w-full mt-6 py-3 bg-bark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-graphite transition-all flex items-center justify-center gap-2"
            >
              {copiado ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copiado ? 'Copiado!' : 'Copiar Código PIX'}
            </button>

            <p className="text-center text-muted text-[10px] mt-5 font-medium leading-relaxed uppercase tracking-tight opacity-60">
              Os créditos são liberados após confirmação do pagamento pelo banco.
            </p>

            {/* Asaas branding */}
            <div className="mt-6 pt-5 border-t border-stone/20 flex flex-col items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted/50">Pagamento processado com segurança por</p>
              <img src="/asaas-logo.svg" alt="Asaas" className="h-6 opacity-70" />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-graphite text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-2xl z-[200] animate-in fade-in slide-in-from-bottom-4">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
