'use client'

import React, { useState } from 'react'
import { Card } from '../../components/ui'
import { GraduationCap, Mail, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream">
      <div className="w-full max-w-[360px] space-y-8 animate-fade-up">
        <div className="text-center">
          <div className="inline-flex w-16 h-16 bg-terra rounded-[24px] items-center justify-center text-white shadow-2xl shadow-terra/30 mb-6 rotate-3">
            <GraduationCap size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-graphite tracking-tight leading-none uppercase">PlanoAi <span className="text-terra text-[10px] block font-black uppercase tracking-[0.3em] mt-2">Inteligência Artificial</span></h1>
        </div>

        <div className="sapa-card p-8 bg-white shadow-2xl shadow-stone/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-terra" />
          
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-4 bg-red-50 text-red-600 text-[11px] font-black uppercase text-center rounded-xl border border-red-100 leading-tight">{error}</div>}
            {msg && <div className="p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center rounded-xl border border-emerald-100 leading-tight">{msg}</div>}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">E-mail de Acesso</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone group-focus-within:text-terra transition-colors" size={16} />
                <input 
                  type="email" 
                  autoComplete="username"
                  required 
                  disabled={loading} 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-stone/30 bg-cream-dark focus:border-terra focus:bg-white outline-none text-sm transition-all font-bold text-graphite disabled:opacity-50" 
                  placeholder="seu@email.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Senha Secreta</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone group-focus-within:text-terra transition-colors" size={16} />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  disabled={loading} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-stone/30 bg-cream-dark focus:border-terra focus:bg-white outline-none text-sm transition-all font-bold text-graphite disabled:opacity-50" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 justify-center text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-terra/20 disabled:bg-stone">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar no Sistema"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-stone/20"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase text-stone bg-white px-4 tracking-widest">Ou comece agora</div>
          </div>

          <button onClick={handleSignUp} disabled={loading} className="w-full py-4 border-2 border-terra/20 rounded-2xl text-terra font-black text-[10px] uppercase tracking-[0.2em] hover:bg-terra/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <Sparkles size={16} className="text-gold" /> Criar minha conta grátis
          </button>
        </div>

        <p className="text-center text-[10px] text-muted font-black uppercase tracking-widest opacity-40">
          Planejamento que Inspira © 2026
        </p>
      </div>
    </div>
  )
}
