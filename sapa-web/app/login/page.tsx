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
    console.log("1. Iniciando processo de login para:", email)

    try {
      console.log("2. Chamando Supabase Auth...")
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      })

      if (error) {
        console.error("3. Erro retornado pelo Supabase:", error.message)
        setError(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message)
        setLoading(false)
      } else if (data.user) {
        console.log("3. Sucesso! Usuário autenticado:", data.user.email)
        console.log("4. Atualizando estado e redirecionando...")
        router.refresh()
        router.push('/')
      }
    } catch (err) {
      console.error("ERRO CRÍTICO:", err)
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
    console.log("Tentando cadastrar novo professor...")
    try {
      const { error } = await supabase.auth.signUp({ 
        email: email.trim(), 
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) {
        console.error("Erro no cadastro:", error.message)
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="text-center">
          <div className="inline-flex w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center text-white shadow-xl mb-4 rotate-3">
            <GraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">SAPA <span className="text-indigo-600 text-xs block font-black uppercase tracking-widest mt-1">SaaS</span></h1>
        </div>

        <Card className="p-6 border shadow-xl bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-[11px] font-black uppercase text-center rounded-xl border border-red-100 leading-tight">{error}</div>}
            {msg && <div className="p-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase text-center rounded-xl border border-emerald-100 leading-tight">{msg}</div>}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="email" 
                  autoComplete="username"
                  required 
                  disabled={loading} 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:border-indigo-500 focus:bg-white outline-none text-sm transition-all font-medium disabled:opacity-50" 
                  placeholder="nome@escola.com" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  disabled={loading} 
                  value={password} 
                  onChange={e=>setPassword(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:border-indigo-500 focus:bg-white outline-none text-sm transition-all font-medium disabled:opacity-50" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-400">
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Entrar no Portal"} <ArrowRight size={16} />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[9px] font-black uppercase text-slate-300 bg-white px-2">Acesso Rápido</div>
          </div>

          <button onClick={handleSignUp} disabled={loading} className="w-full py-3 border-2 border-slate-50 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <Sparkles size={14} className="text-amber-400" /> Criar nova conta
          </button>
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
          Sistema de Apoio Pedagógico Inteligente
        </p>
      </div>
    </div>
  )
}
