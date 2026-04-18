'use client'

import React, { useState } from 'react'
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles, Loader2, Heart, BookOpen } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Componentes Visuais de Apoio (Sincronizados com a Home) ──

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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    setLoading(true); setError(null); setMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
        setLoading(false)
      } else if (data.user) {
        router.refresh()
        router.push('/')
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.')
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Preencha os campos para cadastrar.')
      return
    }
    setLoading(true); setError(null); setMsg(null)
    try {
      const { error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) {
        setError(error.message)
      } else {
        setMsg('Verifique seu e-mail para confirmar a conta!')
      }
    } catch (err) {
      setError('Erro inesperado no cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream selection:bg-terra/20 overflow-hidden relative">
      <Noise />
      <NotebookPattern />

      {/* Orbes Decorativos */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-terra/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-[420px] space-y-10 animate-fade-up relative z-10">
        
        {/* Brand */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex flex-col items-center group">
            <img src="/logo.png" alt="Aula360" className="h-32 w-auto mb-4 group-hover:scale-105 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-terra opacity-80">
              Envie o escopo. Receba o plano pronto.
            </p>
          </Link>
        </div>

        {/* Card de Login */}
        <div className="bg-white p-10 md:p-12 rounded-[40px] border border-stone/50 shadow-2xl shadow-stone/20 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-terra/10" />
          <div className="absolute top-0 left-0 w-0 h-1.5 bg-terra group-hover:w-full transition-all duration-700" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-lg font-black text-graphite tracking-tight">Bem-vindo de volta, professor.</h2>
              <p className="text-[11px] text-muted font-medium uppercase tracking-widest mt-1">Acesse seu planejamento</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase text-center rounded-2xl border border-red-100 leading-tight animate-shake">
                {error}
              </div>
            )}
            {msg && (
              <div className="p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center rounded-2xl border border-emerald-100 leading-tight">
                {msg}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-light uppercase tracking-[0.2em] ml-1">E-mail de Acesso</label>
              <div className="relative group/input">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone group-focus-within/input:text-terra transition-colors" size={16} />
                <input 
                  type="email" 
                  autoComplete="username"
                  required 
                  disabled={loading} 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone/30 bg-cream focus:border-terra focus:bg-white outline-none text-sm transition-all font-bold text-graphite disabled:opacity-50 shadow-inner" 
                  placeholder="ex: maria@escola.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <label className="text-[10px] font-black text-muted-light uppercase tracking-[0.2em]">Senha Secreta</label>
                <button type="button" className="text-[9px] font-black text-terra/60 hover:text-terra uppercase tracking-widest">Esqueci</button>
              </div>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone group-focus-within/input:text-terra transition-colors" size={16} />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  disabled={loading} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-stone/30 bg-cream focus:border-terra focus:bg-white outline-none text-sm transition-all font-bold text-graphite disabled:opacity-50 shadow-inner" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-graphite text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-terra active:scale-95 transition-all disabled:bg-stone/50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>Entrar no Sistema <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone/40"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase text-muted-light bg-white px-4 tracking-[0.3em]">Ou novo por aqui?</div>
          </div>

          <button onClick={handleSignUp} disabled={loading} className="w-full py-5 bg-terra/10 border-2 border-terra/20 rounded-2xl text-terra font-black text-[11px] uppercase tracking-[0.2em] hover:bg-terra hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-terra/5">
            <Sparkles size={16} /> Criar minha conta grátis
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/50 border border-stone/40 rounded-full text-[9px] font-black uppercase text-muted tracking-widest">
              <Heart size={10} className="fill-terra text-terra" /> Apoio ao Professor
           </div>
           <p className="text-[10px] text-muted-light font-black uppercase tracking-[0.3em]">
             © 2026 Aula360
           </p>
        </div>
      </div>
    </div>
  )
}
