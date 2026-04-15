'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, Users, Zap, DollarSign, TrendingUp, 
  ChevronRight, ShieldCheck, Loader2, AlertCircle, Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalPlans: 0,
    plansThisWeek: 0,
    estimatedRevenue: 0
  })
  const [recentLogs, setHistoricoLogs] = useState<any[]>([])

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('perfis').select('is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) {
        setLoading(false)
        return
      }

      setIsAdmin(true)

      // 1. Total de Usuários
      const { count: usersCount } = await supabase.from('perfis').select('*', { count: 'exact', head: true })
      
      // 2. Novos Usuários Hoje
      const hoje = new Date()
      hoje.setHours(0,0,0,0)
      const { count: newToday } = await supabase.from('perfis').select('*', { count: 'exact', head: true }).gte('created_at', hoje.toISOString())

      // 3. Total de Planos Gerados
      const { count: plansCount } = await supabase.from('planos_gerados').select('*', { count: 'exact', head: true })

      // 4. Planos esta semana
      const umaSemanaAtras = new Date()
      umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)
      const { count: plansWeek } = await supabase.from('planos_gerados').select('*', { count: 'exact', head: true }).gte('created_at', umaSemanaAtras.toISOString())

      // 5. Histórico de Logs Admin (Ações recentes)
      const { data: logs } = await supabase.from('admin_logs').select('*, perfis(nome_completo)').order('created_at', { ascending: false }).limit(5)

      setStats({
        totalUsers: usersCount || 0,
        newUsersToday: newToday || 0,
        totalPlans: plansCount || 0,
        plansThisWeek: plansWeek || 0,
        estimatedRevenue: (usersCount || 0) * 29.90 // Exemplo: 29.90 por usuário
      })
      setHistoricoLogs(logs || [])
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-slate-900">Área Restrita</h1>
      <Link href="/" className="mt-6 text-indigo-600 font-bold hover:underline">Voltar ao Início</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Nav Admin */}
      <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h1 className="text-sm font-black uppercase tracking-widest">SAPA Intelligence <span className="text-indigo-400">Admin</span></h1>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/admin/usuarios" className="text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">Usuários</Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Sair do Admin</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Visão Geral</h2>
          <p className="text-slate-500 font-medium">Métricas de desempenho e saúde da plataforma.</p>
        </header>

        {/* Grid de Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Usuários" value={stats.totalUsers} icon={<Users size={20}/>} trend={`+${stats.newUsersToday} hoje`} color="indigo" />
          <StatCard title="Planos Gerados" value={stats.totalPlans} icon={<Zap size={20}/>} trend={`+${stats.plansThisWeek} esta semana`} color="amber" />
          <StatCard title="MRR Estimado" value={`R$ ${stats.estimatedRevenue.toFixed(2)}`} icon={<DollarSign size={20}/>} trend="Base: R$ 29.90/prof" color="emerald" />
          <StatCard title="Atividade IA" value="Alta" icon={<TrendingUp size={20}/>} trend="Gemini 2.0 Flash" color="violet" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Ações Rápidas</h3>
            <Link href="/admin/usuarios" className="block p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Gerenciar Professores</p>
                    <p className="text-[10px] text-slate-400 font-medium">Adicionar créditos e editar planos</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
              </div>
            </Link>
          </div>

          {/* Logs de Atividade */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Atividade Recente do Admin</h3>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {recentLogs.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Créditos adicionados ({log.detalhes?.quantidade})
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                            Destino: {log.target_user_id.substring(0,8)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-slate-400 font-medium">Nenhuma ação administrativa registrada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600"
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
      <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2">{value}</h4>
      <p className="text-[10px] font-bold text-slate-500">{trend}</p>
    </div>
  )
}
