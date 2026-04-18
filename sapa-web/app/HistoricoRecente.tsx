'use client'

import { useState } from 'react'
import { FileText, ChevronRight, ChevronDown } from 'lucide-react'

interface Plano {
  id: string
  componente: string
  semana: number
  turma?: string
  bimestre?: number
  criado_em: string
  arquivo_url: string
}

export default function HistoricoRecente({ planos }: { planos: Plano[] }) {
  const [aberto, setAberto] = useState<string | null>(null)

  if (planos.length === 0) return null

  return (
    <div className="divide-y divide-[#CBD5E1]/50">
      {planos.map((plano) => {
        const isOpen = aberto === plano.id
        return (
          <div key={plano.id}>
            {/* Linha clicável (sempre visível) */}
            <button
              onClick={() => setAberto(isOpen ? null : plano.id)}
              className="w-full p-4 md:px-6 md:py-4 flex justify-between items-center hover:bg-[#F0F4FF] transition-colors text-left"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 bg-[#E2EAFF] rounded-xl flex items-center justify-center text-[#64748B] flex-shrink-0">
                  <FileText size={18} />
                </div>
                <p className="text-xs md:text-sm font-bold text-[#0F172A] line-clamp-1">
                  {plano.componente} · Semana {plano.semana}
                </p>
              </div>
              <div className="text-[#64748B] flex-shrink-0 ml-2">
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>

            {/* Detalhes expandidos */}
            {isOpen && (
              <div className="px-4 md:px-6 pb-4 flex justify-between items-center bg-[#F0F4FF] border-t border-[#CBD5E1]/40">
                <p className="text-[10px] md:text-[11px] text-[#64748B] font-medium pt-3">
                  {plano.turma && `${plano.turma} · `}
                  {plano.bimestre && `${plano.bimestre}º Bim · `}
                  {new Date(plano.criado_em).toLocaleDateString('pt-BR')}
                </p>
                <a href={plano.arquivo_url} target="_blank" rel="noopener noreferrer" className="pt-3">
                  <button className="px-4 py-2 border-2 border-[#CBD5E1] text-[#2563EB] font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-white transition-colors">
                    ↓ Word
                  </button>
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
