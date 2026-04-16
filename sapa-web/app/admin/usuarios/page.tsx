'use client'

import React, { useState, useEffect } from 'react'
import { Users, Plus, ShieldCheck, Loader2, Search, Zap, AlertCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function AdminUsuariosPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('perfis').select('is_admin').eq('id', user.id).single()
      
      if (!profile?.is_admin) {
        setLoading(false)
        return
      }

      setIsAdmin(true)
      const { data } = await supabase
        .from('perfis')
        .select('*')
        .order('created_at', { ascending: false })
      
      setUsers(data || [])
      setLoading(false)
    }
    checkAdminAndLoad()
  }, [])

  const handleAddCredits = async (userId: string, current: number) => {
    const amount = prompt("Quantos créditos deseja ADICIONAR para este usuário?", "5")
    if (!amount || isNaN(Number(amount))) return

    setProcessingId(userId)
    try {
      const { error } = await supabase.rpc('admin_add_credits', { 
        target_id: userId, 
        amount: parseInt(amount) 
      })

      if (error) throw error

      // Atualiza lista local
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, creditos: (u.creditos || 0) + parseInt(amount) } : u
      ))
      alert("Créditos adicionados com sucesso!")
    } catch (e: any) {
      alert("Erro ao adicionar créditos: " + e.message)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-900">Acesso Negado</h1>
      <p className="text-slate-500 max-w-sm mt-2">Você não tem permissão para acessar esta área administrativa.</p>
      <Link href="/" className="mt-6 text-indigo-600 font-bold hover:underline">Voltar ao Início</Link>
    </div>
  )

  const filteredUsers = users.filter(u => 
    u.nome_completo?.toLowerCase().includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter text-slate-900">PlanoAi Admin</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Usuários</p>
          </div>
        </div>
        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">Voltar ao Sistema</Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {/* Header de Ações */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-100 outline-none focus:border-indigo-500 bg-white text-sm transition-all"
            />
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
              <Users size={16} className="text-slate-400" />
              <span className="text-xs font-black text-slate-700">{users.length} Professores</span>
            </div>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Professor</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Escola Padrão</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Créditos</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {u.nome_completo?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.nome_completo || 'Sem Nome'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{u.id.substring(0,8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {u.escola_padrao || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className={u.creditos > 0 ? "text-amber-500" : "text-slate-300"} />
                      <span className={`text-sm font-black ${u.creditos > 0 ? "text-slate-900" : "text-red-400"}`}>
                        {u.creditos || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleAddCredits(u.id, u.creditos || 0)}
                      disabled={processingId === u.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
                    >
                      {processingId === u.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                      Add Créditos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">Nenhum usuário encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
