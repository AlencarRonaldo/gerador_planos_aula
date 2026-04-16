export const dynamic = 'force-dynamic'

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Download, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  School,
  Loader2,
  ChevronLeft,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function HistoricoPage() {
  const [loading, setLoading] = useState(true)
  const [planos, setPlanos] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function fetchHistorico() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('planos_gerados')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })
        
        if (!error) setPlanos(data || [])
      }
      setLoading(false)
    }
    fetchHistorico()
  }, [])

  const filteredPlanos = planos.filter(p => 
    p.componente?.toLowerCase().includes(filter.toLowerCase()) ||
    p.tema?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-cream pb-12">
      <nav className="sapa-nav fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
          <Link href="/gerador" className="flex items-center gap-2 text-terra font-black text-[10px] uppercase tracking-widest">
            <ChevronLeft size={16} strokeWidth={3} /> Voltar
          </Link>
          <h1 className="text-xs font-black text-graphite uppercase tracking-[0.2em]">Histórico</h1>
          <div className="w-16" /> 
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-24">
        <div className="mb-10 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-terra transition-colors" size={20} />
          <input 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-stone/30 bg-white shadow-sm focus:border-terra focus:ring-4 focus:ring-terra/5 outline-none text-sm font-bold text-graphite transition-all"
            placeholder="Buscar por matéria ou tema..."
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24 text-muted">
            <Loader2 className="animate-spin mb-4 text-terra" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando seus planos...</p>
          </div>
        ) : filteredPlanos.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border-2 border-dashed border-stone/40">
            <div className="w-20 h-20 bg-cream-dark rounded-3xl flex items-center justify-center text-stone mx-auto mb-6">
              <FileText size={36} />
            </div>
            <h3 className="text-graphite text-lg font-black tracking-tight">Vazio por aqui</h3>
            <p className="text-muted text-sm mt-2 max-w-xs mx-auto font-medium">Seu plano de aula aparecerão nesta lista para download imediato.</p>
            <Link href="/gerador" className="mt-8 inline-block btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest">Criar Primeiro Plano</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPlanos.map((plano) => (
              <div key={plano.id} className="sapa-card bg-white p-5 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-terra/30 transition-all group overflow-hidden relative">
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-14 h-14 bg-terra/10 rounded-2xl flex items-center justify-center text-terra group-hover:bg-terra group-hover:text-white transition-all duration-300 shadow-sm">
                    <BookOpen size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase text-terra bg-terra/10 px-2.5 py-1 rounded-lg tracking-wider">{plano.bimestre}º Bimestre</span>
                      <span className="text-[9px] font-black uppercase text-gold bg-gold/10 px-2.5 py-1 rounded-lg tracking-wider">Semana {plano.semana}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-graphite leading-tight mb-1.5">{plano.componente}</h3>
                    <p className="text-muted text-xs font-medium line-clamp-1 italic">"{plano.tema}"</p>
                    
                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[9px] font-black text-muted/60 uppercase tracking-[0.1em]">
                      <div className="flex items-center gap-1.5"><Calendar size={12} className="text-terra/50" /> {new Date(plano.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="flex items-center gap-1.5"><School size={12} className="text-terra/50" /> {plano.escola}</div>
                      <div className="flex items-center gap-1.5"><User size={12} className="text-terra/50" /> {plano.turma}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  {plano.arquivo_url ? (
                    <a 
                      href={plano.arquivo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none btn-primary !bg-bark !shadow-none hover:!bg-terra px-8 py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl"
                    >
                      <Download size={16} strokeWidth={3} /> Baixar Word
                    </a>
                  ) : (
                    <span className="text-[10px] font-black text-muted/40 uppercase tracking-widest px-4 border border-stone/20 py-2 rounded-lg italic">Arquivo Indisponível</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
