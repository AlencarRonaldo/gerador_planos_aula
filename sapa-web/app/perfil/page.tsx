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
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#C4622D]" size={40} />
    </div>
  )

  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || email[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#FAF8F3] pb-12">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E0D4]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-[#C4622D] font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} strokeWidth={3} /> Painel
          </Link>
          <h1 className="text-xs font-black text-[#1C1917] uppercase tracking-[0.2em]">Meu Perfil</h1>
          <button onClick={handleLogout} className="text-[10px] font-black uppercase text-[#8C7B70] hover:text-red-500 transition-colors">Sair</button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 bg-[#C4622D] rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[#C4622D]/20 rotate-3">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-black text-[#1C1917] text-xl tracking-tight leading-tight">{nome || 'Professor'}</p>
            <p className="text-[#8C7B70] text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{email}</p>
          </div>
        </div>

        {/* Card de Créditos */}
        <div className="rounded-[24px] p-6 bg-[#3D2B1F] relative overflow-hidden shadow-xl shadow-[#3D2B1F]/20">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#C4622D]/20 rounded-full blur-3xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#E07A4A]">
                <Coins size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Créditos Disponíveis</p>
                <p className="text-2xl font-black text-white">{creditos}</p>
              </div>
            </div>
            <Link href="/planos">
              <button 
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg border border-[#C4622D]/20"
                style={{ backgroundColor: '#C4622D', color: '#ffffff' }}
              >
                Recarregar
              </button>
            </Link>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-[32px] border border-[#E8E0D4] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1 flex items-center gap-2">
              <User size={12} className="text-[#C4622D]" /> Nome Completo
            </label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all"
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1 flex items-center gap-2">
              <School size={12} className="text-[#C4622D]" /> Escola Padrão
            </label>
            <input
              value={escola}
              onChange={e => setEscola(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all"
              placeholder="Nome da instituição"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1 flex items-center gap-2">
              <BookOpen size={12} className="text-[#C4622D]" /> Matéria Favorita
            </label>
            <input
              value={materiaPadrao}
              onChange={e => setMateriaPadrao(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all"
              placeholder="Ex: Inteligência Artificial"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#C4622D] text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#C4622D]/20 hover:bg-[#9C4A1F] transition-all disabled:bg-[#8C7B70]"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : saved ? 'Perfil Atualizado!' : 'Salvar Perfil'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 border-2 border-red-100 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Encerrar Sessão
        </button>
      </main>
    </div>
  )
}
