'use client'

import React, { useState, useEffect } from 'react'
import { User, School, BookOpen, Save, LogOut, ArrowLeft, Loader2, CheckCircle, Coins, CreditCard, Phone, MapPin, Home } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const inp = "w-full p-4 rounded-2xl border-2 border-[#CBD5E1] bg-[#E2EAFF] focus:border-[#2563EB] focus:bg-white outline-none text-sm font-bold text-[#0F172A] transition-all"
const lbl = "text-[10px] font-black uppercase text-[#64748B] tracking-widest ml-1 flex items-center gap-2"

export default function PerfilPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  // Dados pedagógicos
  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('')
  const [materiaPadrao, setMateriaPadrao] = useState('')

  // Dados de pagamento
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numeroEndereco, setNumeroEndereco] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  const [creditos, setCreditos] = useState(0)
  const [loadingCep, setLoadingCep] = useState(false)

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
        setCpf(fmtCpf(data.cpf || ''))
        setTelefone(fmtTelefone(data.telefone || ''))
        setCep(fmtCep(data.cep || ''))
        setEndereco(data.endereco || '')
        setNumeroEndereco(data.numero_endereco || '')
        setComplemento(data.complemento || '')
        setBairro(data.bairro || '')
        setCidade(data.cidade || '')
        setEstado(data.estado || '')
        setCreditos(data.creditos || 0)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  // ── Máscaras ──────────────────────────────────────────────────────────────
  const fmtCpf = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  const fmtTelefone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }
  const fmtCep = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{5})(\d{1,3})/, '$1-$2')
  }

  // ── Busca CEP ─────────────────────────────────────────────────────────────
  const buscarCep = async (valor: string) => {
    const digits = valor.replace(/\D/g, '')
    if (digits.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setEndereco(data.logradouro || '')
        setBairro(data.bairro || '')
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
      }
    } catch {}
    setLoadingCep(false)
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true); setSaved(false)
    const { error } = await supabase.from('perfis').upsert({
      id: userId,
      nome_completo: nome,
      escola_padrao: escola,
      materia_padrao: materiaPadrao,
      cpf: cpf.replace(/\D/g, '') || null,
      telefone: telefone.replace(/\D/g, '') || null,
      cep: cep.replace(/\D/g, '') || null,
      endereco: endereco || null,
      numero_endereco: numeroEndereco || null,
      complemento: complemento || null,
      bairro: bairro || null,
      cidade: cidade || null,
      estado: estado || null,
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
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#2563EB]" size={40} />
    </div>
  )

  const initials = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || email[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-12">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#CBD5E1]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-[#2563EB] font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} strokeWidth={3} /> Painel
          </Link>
          <h1 className="text-xs font-black text-[#0F172A] uppercase tracking-[0.2em]">Meu Perfil</h1>
          <button onClick={handleLogout} className="text-[10px] font-black uppercase text-[#64748B] hover:text-red-500 transition-colors">Sair</button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-24 h-24 bg-[#2563EB] rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[#2563EB]/20 rotate-3">
            {initials}
          </div>
          <div className="text-center">
            <p className="font-black text-[#0F172A] text-xl tracking-tight leading-tight">{nome || 'Professor'}</p>
            <p className="text-[#64748B] text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{email}</p>
          </div>
        </div>

        {/* Card Créditos */}
        <div className="rounded-[24px] p-6 bg-[#0F172A] relative overflow-hidden shadow-xl shadow-[#0F172A]/20">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#2563EB]/20 rounded-full blur-3xl" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#3B82F6]">
                <Coins size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Créditos Disponíveis</p>
                <p className="text-2xl font-black text-white">{creditos}</p>
              </div>
            </div>
            <Link href="/planos">
              <button className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg border border-[#2563EB]/20 bg-[#2563EB] text-white">
                Recarregar
              </button>
            </Link>
          </div>
        </div>

        {/* ── Dados Pedagógicos ── */}
        <div className="bg-white rounded-[32px] border border-[#CBD5E1] p-6 md:p-8 space-y-6 shadow-sm">
          <p className="text-[10px] font-black uppercase text-[#2563EB] tracking-widest">Dados da Escola</p>

          <div className="space-y-2">
            <label className={lbl}><User size={12} className="text-[#2563EB]" /> Nome Completo</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className={inp} placeholder="Seu nome completo" />
          </div>

          <div className="space-y-2">
            <label className={lbl}><School size={12} className="text-[#2563EB]" /> Escola Padrão</label>
            <input value={escola} onChange={e => setEscola(e.target.value)} className={inp} placeholder="Nome da instituição" />
          </div>

          <div className="space-y-2">
            <label className={lbl}><BookOpen size={12} className="text-[#2563EB]" /> Matéria Favorita</label>
            <input value={materiaPadrao} onChange={e => setMateriaPadrao(e.target.value)} className={inp} placeholder="Ex: Inteligência Artificial" />
          </div>
        </div>

        {/* ── Dados de Pagamento ── */}
        <div className="bg-white rounded-[32px] border border-[#CBD5E1] p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <p className="text-[10px] font-black uppercase text-[#2563EB] tracking-widest">Dados para Pagamento</p>
            <p className="text-[10px] text-[#64748B] font-bold mt-1">Necessários para emitir cobranças PIX via Asaas.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className={lbl}><CreditCard size={12} className="text-[#2563EB]" /> CPF</label>
              <input value={cpf} onChange={e => setCpf(fmtCpf(e.target.value))} className={inp} placeholder="000.000.000-00" maxLength={14} inputMode="numeric" />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className={lbl}><Phone size={12} className="text-[#2563EB]" /> Telefone / WhatsApp</label>
              <input value={telefone} onChange={e => setTelefone(fmtTelefone(e.target.value))} className={inp} placeholder="(00) 00000-0000" maxLength={15} inputMode="numeric" />
            </div>
          </div>

          {/* CEP com auto-preenchimento */}
          <div className="space-y-2">
            <label className={lbl}>
              <MapPin size={12} className="text-[#2563EB]" /> CEP
              {loadingCep && <Loader2 size={10} className="animate-spin text-[#2563EB]" />}
            </label>
            <input
              value={cep}
              onChange={e => { const v = fmtCep(e.target.value); setCep(v); buscarCep(v) }}
              className={inp}
              placeholder="00000-000"
              maxLength={9}
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <label className={lbl}><Home size={12} className="text-[#2563EB]" /> Endereço</label>
              <input value={endereco} onChange={e => setEndereco(e.target.value)} className={inp} placeholder="Rua / Av." />
            </div>
            <div className="space-y-2">
              <label className={lbl}>Número</label>
              <input value={numeroEndereco} onChange={e => setNumeroEndereco(e.target.value)} className={inp} placeholder="Nº" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={lbl}>Complemento</label>
              <input value={complemento} onChange={e => setComplemento(e.target.value)} className={inp} placeholder="Apto, Sala..." />
            </div>
            <div className="space-y-2">
              <label className={lbl}>Bairro</label>
              <input value={bairro} onChange={e => setBairro(e.target.value)} className={inp} placeholder="Bairro" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <label className={lbl}>Cidade</label>
              <input value={cidade} onChange={e => setCidade(e.target.value)} className={inp} placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <label className={lbl}>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} className={inp}>
                <option value="">UF</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#2563EB]/20 hover:bg-[#1D4ED8] transition-all disabled:bg-[#64748B]"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saving ? 'Salvando...' : saved ? 'Perfil Atualizado!' : 'Salvar Perfil'}
        </button>

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
