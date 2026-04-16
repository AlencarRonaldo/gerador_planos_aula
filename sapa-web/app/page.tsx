import { PlusCircle, Clock, BookOpen, FileText, ChevronRight, BarChart3, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseServer } from '../lib/supabase-server'

export default async function Home() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let nome = ''
  let escola = ''
  let creditos = 0
  let isFull = false
  let totalGerado = 0
  let geradosSemana = 0
  let historicoRecente: any[] = []

  if (user) {
    const { data: profile } = await supabase
      .from('perfis')
      .select('nome_completo, escola_padrao, creditos, assinatura_ativa')
      .eq('id', user.id)
      .maybeSingle()

    nome = profile?.nome_completo || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    escola = profile?.escola_padrao || ''
    creditos = profile?.creditos ?? 0
    isFull = profile?.assinatura_ativa === true

    const { count: total } = await supabase
      .from('planos_gerados')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
    totalGerado = total || 0

    const umaSemanaAtras = new Date()
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)
    const { count: semana } = await supabase
      .from('planos_gerados')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
      .gte('created_at', umaSemanaAtras.toISOString())
    geradosSemana = semana || 0

    const { data: hist } = await supabase
      .from('planos_gerados')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    historicoRecente = hist || []
  }

  const initials = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E0D4]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#C4622D] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#C4622D]/30">
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl md:text-2xl font-black text-[#1C1917] tracking-tight hidden sm:block">
                SAPA
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#F2EEE6] p-1 rounded-xl border border-[#E8E0D4]">
              <button className="bg-white text-[#1C1917] shadow-sm px-3 md:px-4 py-1.5 text-[11px] md:text-xs rounded-lg font-bold">Painel</button>
              <Link href="/historico" className="text-[#8C7B70] hover:text-[#1C1917] px-3 md:px-4 py-1.5 text-[11px] md:text-xs hidden sm:block transition-colors">Planos</Link>
              <Link href="/gerador" className="text-[#8C7B70] hover:text-[#1C1917] px-3 md:px-4 py-1.5 text-[11px] md:text-xs transition-colors">Novo</Link>
            </div>
          </div>
          <Link href="/perfil" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#C4622D] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-105 transition-transform">
              {initials}
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-24 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">

          {/* ── Banner de Boas-Vindas ── */}
          <div className="col-span-1 md:col-span-12 p-6 md:p-8 bg-[#3D2B1F] rounded-[32px] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-[#3D2B1F]/20">
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-[#C4622D]/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <p className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">{greeting}</p>
              <h1 className="font-display text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-1">
                Prof. {nome.split(' ')[0] || 'Professor'}
              </h1>
              {escola && <p className="text-sm text-white/40 font-medium mb-4">{escola}</p>}
              {isFull ? (
                <span className="inline-flex items-center gap-1.5 bg-[#C4622D]/25 text-[#E07A4A] border border-[#C4622D]/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  ✦ Plano Full · {creditos} créditos
                </span>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Free</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-black text-lg">{creditos}</span>
                      <span className="text-white/30 text-sm">/ 5</span>
                    </div>
                  </div>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#C4622D] rounded-full" style={{ width: `${Math.min((creditos / 5) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <Link href="/gerador" className="w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-4 bg-[#C4622D] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-[#C4622D]/20 hover:bg-[#9C4A1F] transition-all">
                  <PlusCircle size={18} />
                  Novo Plano
                </button>
              </Link>
              {!isFull && (
                <Link href="/planos" className="w-full md:w-auto text-center text-[10px] font-black text-white/40 hover:text-[#E07A4A] transition-colors uppercase tracking-widest">
                  Fazer Upgrade →
                </Link>
              )}
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="col-span-1 md:col-span-6 p-6 bg-white border border-[#E8E0D4] rounded-[32px] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5A7A5A]/10 rounded-2xl flex items-center justify-center text-[#5A7A5A] flex-shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#8C7B70] uppercase tracking-widest mb-0.5">Total gerado</p>
                <p className="text-3xl font-black text-[#1C1917] leading-none mb-1">{totalGerado}</p>
                <span className="text-[9px] font-black uppercase text-[#5A7A5A] bg-[#5A7A5A]/10 px-2 py-0.5 rounded">Planos criados</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-6 p-6 bg-white border border-[#E8E0D4] rounded-[32px] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C89B3C]/10 rounded-2xl flex items-center justify-center text-[#C89B3C] flex-shrink-0">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#8C7B70] uppercase tracking-widest mb-0.5">Esta semana</p>
                <p className="text-3xl font-black text-[#1C1917] leading-none mb-1">{geradosSemana}</p>
                <span className="text-[9px] font-black uppercase text-[#C89B3C] bg-[#C89B3C]/10 px-2 py-0.5 rounded">Novos planos</span>
              </div>
            </div>
          </div>

          {/* ── Histórico Recente ── */}
          <div className="col-span-1 md:col-span-12 bg-white border border-[#E8E0D4] rounded-[32px] flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-[#E8E0D4] flex justify-between items-center">
              <h2 className="text-xs md:text-sm font-black text-[#1C1917] flex items-center gap-2 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-[#C4622D] rounded-full" />
                Histórico Recente
              </h2>
              <Link href="/historico" className="text-[11px] font-bold text-[#C4622D] hover:underline flex items-center gap-1">
                Ver tudo <ChevronRight size={14} />
              </Link>
            </div>

            {historicoRecente.length > 0 ? (
              <div className="divide-y divide-[#E8E0D4]/50">
                {historicoRecente.map((plano) => (
                  <div key={plano.id} className="p-4 md:px-6 md:py-4 flex justify-between items-center hover:bg-[#FAF8F3] transition-colors">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 bg-[#F2EEE6] rounded-xl flex items-center justify-center text-[#8C7B70]">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-[#1C1917] line-clamp-1">
                          {plano.componente} · Semana {plano.semana}
                        </p>
                        <p className="text-[10px] md:text-[11px] text-[#8C7B70] font-medium">
                          {plano.turma && `${plano.turma} · `}
                          {plano.bimestre && `${plano.bimestre}º Bim · `}
                          {new Date(plano.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <a href={plano.arquivo_url} target="_blank" rel="noopener noreferrer">
                      <button className="px-4 py-2 border-2 border-[#E8E0D4] text-[#C4622D] font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-[#FAF8F3] transition-colors">
                        ↓ Word
                      </button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="w-12 h-12 bg-[#F2EEE6] rounded-xl flex items-center justify-center text-[#B5A89A] mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-sm md:text-base font-bold text-[#1C1917] mb-2">Inicie sua primeira geração</h3>
                <p className="text-xs md:text-sm text-[#8C7B70] max-w-xs mx-auto leading-relaxed mb-6 font-medium">
                  Seus planos gerados aparecerão aqui para download rápido.
                </p>
                <Link href="/gerador">
                  <button className="px-6 py-2.5 border-2 border-[#C4622D] text-[#C4622D] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-[#FAF8F3] transition-all">
                    Começar Agora
                  </button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E8E0D4] py-8 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-[#8C7B70] uppercase tracking-widest">© 2026 SAPA. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            {['Termos', 'Privacidade', 'Suporte'].map(item => (
              <Link key={item} href="#" className="text-[11px] font-black text-[#8C7B70] uppercase tracking-[0.15em] hover:text-[#C4622D] transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
