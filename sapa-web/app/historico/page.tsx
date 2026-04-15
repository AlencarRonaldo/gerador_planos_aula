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
          .order('criado_em', { ascending: false })
        
        if (!error) setPlanos(data || [])
      }
      setLoading(false)
    }
    fetchHistorico()
  }, [])

  const filteredPlanos = planos.filter(p => 
    p.componente.toLowerCase().includes(filter.toLowerCase()) ||
    p.tema.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <nav className="nav-blur px-6 py-3 mb-8 flex justify-between items-center shadow-sm bg-white">
        <Link href="/gerador" className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <ChevronLeft size={16} /> Voltar ao Gerador
        </Link>
        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Histórico de Planos</h1>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      <main className="max-w-4xl mx-auto px-4">
        <div className="mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
            placeholder="Buscar por matéria ou tema..."
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Carregando seus planos...</p>
          </div>
        ) : filteredPlanos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] shadow-sm border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-slate-900 font-black tracking-tight">Nenhum plano encontrado</h3>
            <p className="text-slate-500 text-sm mt-1">Você ainda não gerou nenhum plano de aula.</p>
            <Link href="/gerador" className="mt-6 inline-block bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Gerar meu primeiro plano</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPlanos.map((plano) => (
              <div key={plano.id} className="premium-card bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Bimestre {plano.bimestre}</span>
                      <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Semana {plano.semana}</span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{plano.componente}</h3>
                    <p className="text-slate-500 text-xs font-medium line-clamp-1">{plano.tema}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(plano.criado_em).toLocaleDateString('pt-BR')}</div>
                      <div className="flex items-center gap-1.5"><School size={12} /> {plano.escola}</div>
                      <div className="flex items-center gap-1.5"><User size={12} /> {plano.turma}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {plano.arquivo_url ? (
                    <a 
                      href={plano.arquivo_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200"
                    >
                      <Download size={14} /> Download .DOCX
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic font-medium px-4">Arquivo não disponível</span>
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
