'use client'

import React, { useState } from 'react'
import { Check, Sparkles, Zap, Star, ArrowLeft, Coins, CreditCard, ShieldCheck, Heart, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── Componentes Visuais de Apoio ──

function Noise() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}

function NotebookPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
         style={{ backgroundImage: 'radial-gradient(#0F172A 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
  )
}

export default function PlanosPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (plano: string) => {
    setLoading(plano)
    try {
      const res = await fetch('/api/asaas/cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano, billingType: 'PIX' })
      })
      const data = await res.json()
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        alert('Erro ao gerar cobrança. Tente novamente.')
      }
    } catch (e) {
      alert('Erro de conexão.')
    } finally {
      setLoading(null)
    }
  }

  const handleAvulso = async (creditos: number) => {
    setLoading(`avulso-${creditos}`)
    try {
      const res = await fetch('/api/asaas/cobranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: 'AVULSO', creditos, billingType: 'PIX' })
      })
      const data = await res.json()
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      } else {
        alert('Erro ao gerar cobrança.')
      }
    } catch (e) {
      alert('Erro de conexão.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-terra/20 pb-20 relative overflow-x-hidden">
      <Noise />
      
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 text-graphite group">
            <img src="/logo.png" alt="Aula360" className="h-12 w-auto" />
            <span className="text-terra text-[10px] font-black uppercase tracking-[0.2em]">Créditos e Assinaturas</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-terra font-black text-[10px] uppercase tracking-widest transition-colors">
            <ArrowLeft size={16} strokeWidth={3} /> Voltar ao Painel
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 relative z-10">
        
        {/* Header */}
        <header className="text-center mb-20 animate-fade-up">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-stone text-terra rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
              <Heart size={12} className="fill-terra" /> Invista na sua qualidade de vida
           </div>
           <h2 className="text-4xl md:text-6xl font-display font-black text-graphite tracking-tight mb-6">
             Escolha o seu ritmo.
           </h2>
           <p className="text-lg text-muted font-medium max-w-2xl mx-auto leading-relaxed">
             Planos flexíveis para quem precisa de apenas alguns planos por mês ou para quem quer automatizar toda a rotina docente.
           </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24 animate-fade-up delay-1">
          {/* Plano Básico */}
          <div className="bg-white p-10 rounded-[40px] border border-stone/60 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 bg-cream-dark rounded-2xl flex items-center justify-center text-muted mb-6 group-hover:rotate-6 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-black text-graphite uppercase tracking-tight">Básico</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-bold text-muted">R$</span>
                <span className="text-5xl font-display font-black text-graphite">29</span>
                <span className="text-lg font-bold text-muted">,90</span>
                <span className="text-xs font-black text-muted-light uppercase tracking-widest ml-2">/mês</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {['15 Planos de Aula/mês', 'Alinhamento BNCC', 'Acesso ao Histórico', 'Exportação Word Ilimitada'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium text-muted">
                  <div className="w-5 h-5 rounded-full bg-sage/10 flex items-center justify-center text-sage shrink-0"><Check size={12} strokeWidth={3} /></div>
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleCheckout('BASICO')}
              disabled={!!loading}
              className="w-full py-4 rounded-2xl border-2 border-stone text-graphite font-black text-[11px] uppercase tracking-[0.2em] hover:bg-graphite hover:text-white transition-all disabled:opacity-50"
            >
              {loading === 'BASICO' ? 'Processando...' : 'Selecionar Plano'}
            </button>
          </div>

          {/* Plano Pro (Destaque) */}
          <div className="bg-bark p-10 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(61,43,31,0.3)] relative overflow-hidden flex flex-col scale-105 border-2 border-terra shadow-terra/10 transform">
            <NotebookPattern />
            <div className="absolute top-0 right-0 px-6 py-2 bg-terra text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-bl-2xl">Recomendado</div>
            <div className="mb-8 relative z-10">
              <div className="w-12 h-12 bg-terra/20 rounded-2xl flex items-center justify-center text-terra-light mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Profissional</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-bold text-white/40">R$</span>
                <span className="text-5xl font-display font-black text-white">49</span>
                <span className="text-lg font-bold text-white/40">,90</span>
                <span className="text-xs font-black text-white/40 uppercase tracking-widest ml-2">/mês</span>
              </div>
            </div>
            <ul className="space-y-4 mb-10 flex-1 relative z-10">
              {['Planos Ilimitados', 'IA de Alta Precisão', 'Suporte Prioritário', 'AEE e Exercícios Avançados', 'Templates Premium'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium text-white/80">
                  <div className="w-5 h-5 rounded-full bg-terra/30 flex items-center justify-center text-terra-light shrink-0"><Check size={12} strokeWidth={3} /></div>
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleCheckout('PRO')}
              disabled={!!loading}
              className="w-full py-5 bg-terra text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-terra/20 hover:bg-terra-dark hover:scale-[1.02] active:scale-95 transition-all relative z-10"
            >
              {loading === 'PRO' ? 'Processando...' : 'Começar Agora'}
            </button>
          </div>

          {/* Plano Premium */}
          <div className="bg-white p-10 rounded-[40px] border border-stone/60 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
            <div className="mb-8">
              <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:rotate-6 transition-transform">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-black text-graphite uppercase tracking-tight">Anual</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-sm font-bold text-muted">R$</span>
                <span className="text-5xl font-display font-black text-graphite">399</span>
                <span className="text-lg font-bold text-muted">,00</span>
                <span className="text-xs font-black text-muted-light uppercase tracking-widest ml-2">/ano</span>
              </div>
              <p className="text-[10px] font-black text-sage uppercase mt-2">Economize R$ 199/ano</p>
            </div>
            <ul className="space-y-4 mb-10 flex-1">
              {['Tudo do Plano Pro', 'Acesso Vitalício ao Histórico', 'Novos Recursos Antecipados', 'Selo Professor Inovador'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium text-muted">
                  <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0"><Check size={12} strokeWidth={3} /></div>
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleCheckout('PREMIUM')}
              disabled={!!loading}
              className="w-full py-4 rounded-2xl border-2 border-stone text-graphite font-black text-[11px] uppercase tracking-[0.2em] hover:bg-graphite hover:text-white transition-all disabled:opacity-50"
            >
              {loading === 'PREMIUM' ? 'Processando...' : 'Selecionar Anual'}
            </button>
          </div>
        </div>

        {/* Créditos Avulsos */}
        <section className="animate-fade-up delay-2">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-display font-black text-graphite tracking-tight mb-2">Precisa de apenas alguns planos?</h3>
            <p className="text-sm text-muted font-medium">Compre créditos avulsos que nunca expiram.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { qtd: 5, valor: 10, id: '5' },
              { qtd: 15, valor: 25, id: '15', promo: 'Popular' },
              { qtd: 50, valor: 70, id: '50', promo: 'Melhor Preço' }
            ].map(pack => (
              <div key={pack.id} className="bg-white p-6 rounded-3xl border border-stone shadow-sm hover:border-terra/40 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-terra/10 rounded-xl flex items-center justify-center text-terra">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-graphite leading-none">{pack.qtd} Planos</p>
                    <p className="text-xs text-muted font-bold mt-1">R$ {pack.valor.toFixed(2).replace('.',',')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {pack.promo && <span className="text-[8px] font-black uppercase text-terra bg-terra/10 px-2 py-0.5 rounded-full">{pack.promo}</span>}
                   <button 
                     onClick={() => handleAvulso(pack.qtd)}
                     disabled={!!loading}
                     className="px-4 py-2 bg-cream-dark text-graphite rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-terra hover:text-white transition-all shadow-sm"
                   >
                     Comprar
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="mt-32 pt-20 border-t border-stone/40 grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-up delay-3">
           <div className="space-y-3">
              <div className="flex justify-center text-muted"><ShieldCheck size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-graphite">Pagamento Seguro</p>
           </div>
           <div className="space-y-3">
              <div className="flex justify-center text-muted"><CreditCard size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-graphite">PIX e Cartão</p>
           </div>
           <div className="space-y-3">
              <div className="flex justify-center text-muted"><Zap size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-graphite">Acesso Instantâneo</p>
           </div>
           <div className="space-y-3">
              <div className="flex justify-center text-muted"><BookOpen size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-graphite">100% BNCC</p>
           </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}
