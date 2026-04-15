'use client'

import React, { useState, useEffect } from 'react'
import { GraduationCap, User, School, BookOpen, Save, LogOut, ArrowLeft, Loader2, CheckCircle, CreditCard, Sparkles, Coins } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('')
  const [materiaPadrao, setMateriaPadrao] = useState('')
  const [creditos, setCreditos] = useState(0)
  const [assinaturaAtiva, setAssinaturaAtiva] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setEmail(user.email || '')
      const { data } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle()
      if (data) {
        setNome(data.nome_completo || '')
        setEscola(data.escola_padrao || '')
        setMateriaPadrao(data.materia_padrao || '')
        setCreditos(data.creditos || 0)
        setAssinaturaAtiva(data.assinatura_ativa || false)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!userId) return
    setSaving(true); setSaved(false)
    const { error } = await supabase.from('perfis').upsert({
      id: userId,
      nome_completo: nome,
      escola_padrao: escola,
      materia_padrao: materiaPadrao,
      atualizado_em: new Date().toISOString(),
    })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || email[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <nav className="nav-blur px-6 py-3 mb-8 flex justify-between items-center shadow-sm bg-white">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Meu Perfil</h1>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={14} /> Sair
        </button>
      </nav>

      <main className="max-w-lg mx-auto px-4 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[28px] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-200 rotate-3">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-black text-slate-900 text-lg leading-tight">{nome || 'Professor'}</p>
            <p className="text-slate-400 text-xs font-medium">{email}</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="premium-card p-6 space-y-5 bg-white">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border-2 border-indigo-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white">
                <Coins size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Saldo de Créditos</p>
                <p className="text-xl font-black text-slate-900">{creditos}</p>
              </div>
            </div>
            <Link href="/planos" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
              <CreditCard size={14} /> Comprar
            </Link>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><User size={10} /> Nome Completo</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:border-indigo-500 focus:bg-white outline-none text-sm font-medium transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><School size={10} /> Escola Padrão</label>
            <input
              value={escola}
              onChange={e => setEscola(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:border-indigo-500 focus:bg-white outline-none text-sm font-medium transition-all"
              placeholder="Nome da instituição"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><BookOpen size={10} /> Matéria Favorita</label>
            <input
              value={materiaPadrao}
              onChange={e => setMateriaPadrao(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:border-indigo-500 focus:bg-white outline-none text-sm font-medium transition-all"
              placeholder="Ex: Análise de Dados"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 btn-gradient flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 border-2 border-red-100 rounded-xl text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={14} /> Sair da Conta
        </button>
      </main>
    </div>
  )
}
