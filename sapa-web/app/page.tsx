import { PlusCircle, BookOpen, FileText, ChevronRight, BarChart3, CalendarDays, Coins, Sparkles, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseServer } from '../lib/supabase-server'
import HistoricoRecente from './HistoricoRecente'

export default async function Home() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // ── LANDING PAGE (MODELO A: O ACOLHEDOR) ──
    return (
      <div className="min-h-screen bg-cream selection:bg-terra/20">
        
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-stone/30">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-terra rounded-lg flex items-center justify-center text-white shadow-lg shadow-terra/20">
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black text-graphite tracking-tight">
                ProsperAula
              </span>
            </div>
            <Link href="/login">
              <button className="text-xs font-black uppercase tracking-widest text-graphite/60 hover:text-terra transition-colors">
                Entrar
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-terra/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-terra/10 text-terra rounded-full text-[10px] font-black uppercase tracking-widest mb-6 animate-fade-in">
              <Sparkles size={12} /> A Inteligência Pedagógica que você esperava
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black text-graphite leading-[1.1] tracking-tight mb-8">
              Professor, você não nasceu para passar os <span className="text-terra">domingos</span> preenchendo papelada.
            </h1>
            <p className="text-lg md:text-xl text-muted font-medium leading-relaxed max-w-2xl mx-auto mb-10">
              Recupere seu tempo livre. Gere planos de aula completos, criativos e <span className="text-graphite font-bold">100% alinhados à BNCC</span> em menos de 3 minutos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-5 bg-terra text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-terra/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Recuperar meus finais de semana <ArrowRight size={18} />
                </button>
              </Link>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                Comece agora com 3 créditos grátis
              </p>
            </div>
          </div>
        </header>

        {/* Features / Pain Section */}
        <section className="py-20 bg-white border-y border-stone/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-terra/10 rounded-2xl flex items-center justify-center text-terra">
                  <Clock size={24} />
                </div>
                <h3 className="text-lg font-black text-graphite tracking-tight">De 3 horas para 3 minutos</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Não perca mais tempo com burocracia. Nossa IA cuida do desenvolvimento, objetivos e metodologias enquanto você foca no que importa: seus alunos.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-sage/10 rounded-2xl flex items-center justify-center text-sage">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-black text-graphite tracking-tight">100% Alinhado à BNCC</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Códigos, competências e habilidades integrados automaticamente. Planos de aula que a sua coordenação vai amar e aprovar de primeira.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-black text-graphite tracking-tight">Exportação Pronta em Word</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Nada de copiar e colar. Baixe seu plano formatado em .docx, pronto para imprimir ou enviar por e-mail, com visual profissional e limpo.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simplicity Section */}
        <section className="py-24 bg-cream">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-graphite tracking-tight mb-16">
              Planejamento de elite sem esforço
            </h2>
            <div className="space-y-8 relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone/50 -translate-x-1/2 hidden md:block" />
              
              {[
                { step: "01", title: "Escolha sua aula", desc: "Selecione o componente curricular e o bimestre. Se tiver material de apoio (PDF ou texto), basta fazer o upload." },
                { step: "02", title: "IA Pedagógica em ação", desc: "Nossa tecnologia analisa o escopo-sequência e gera o desenvolvimento passo a passo da sua aula." },
                { step: "03", title: "Plano pronto!", desc: "Revise e baixe seu arquivo Word formatado. Pronto para entrar em sala com tranquilidade." }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col md:flex-row items-center gap-8 group">
                  <div className="w-12 h-12 bg-white border-2 border-terra rounded-full flex items-center justify-center text-terra font-black text-sm z-10 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="flex-1 bg-white p-8 rounded-card border border-stone/30 text-left shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all">
                    <h4 className="text-lg font-black text-graphite mb-2">{item.title}</h4>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-bark p-12 md:p-20 rounded-[40px] text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-terra/20 rounded-full blur-[80px]" />
            <h2 className="font-display text-3xl md:text-5xl font-black text-white leading-tight mb-8 relative z-10">
              Sua criatividade merece <span className="text-terra-light">mais tempo</span>, sua mente merece <span className="text-terra-light">mais paz</span>.
            </h2>
            <Link href="/login" className="relative z-10">
              <button className="px-10 py-5 bg-white text-graphite rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-cream-dark transition-all">
                Começar agora gratuitamente
              </button>
            </Link>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-widest relative z-10">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-terra" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-terra" /> 3 planos grátis</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-stone/20 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="w-6 h-6 bg-terra/20 rounded flex items-center justify-center text-terra">
              <BookOpen size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-black text-graphite tracking-tight">ProsperAula</span>
          </div>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">© 2026 ProsperAula. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-6">
            {['Termos', 'Privacidade', 'Contato'].map(item => (
              <Link key={item} href="#" className="text-[10px] font-black text-muted hover:text-terra uppercase tracking-widest transition-colors">{item}</Link>
            ))}
          </div>
        </footer>

      </div>
    )
  }

  // ── DASHBOARD (PARA USUÁRIOS LOGADOS) ──
  let nome = ''
  let escola = ''
  let creditos = 0
  let isFull = false
  let totalGerado = 0
  let geradosSemana = 0
  let historicoRecente: any[] = []

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
    .gte('criado_em', umaSemanaAtras.toISOString())
  geradosSemana = semana || 0

  const { data: hist } = await supabase
    .from('planos_gerados')
    .select('*')
    .eq('usuario_id', user.id)
    .order('criado_em', { ascending: false })
    .limit(5)
  historicoRecente = hist || []

  const initials = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-screen flex flex-col bg-cream">

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-terra rounded-xl flex items-center justify-center text-white shadow-lg shadow-terra/30">
                <BookOpen size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl md:text-2xl font-black text-graphite tracking-tight hidden sm:block">
                ProsperAula
              </span>
            </div>
            <div className="flex items-center gap-1 bg-cream-dark p-1 rounded-xl border border-stone">
              <button className="bg-white text-graphite shadow-sm px-3 md:px-4 py-1.5 text-[11px] md:text-xs rounded-lg font-bold">Painel</button>
              <Link href="/historico" className="text-muted hover:text-graphite px-3 md:px-4 py-1.5 text-[11px] md:text-xs hidden sm:block transition-colors">Planos</Link>
              <Link href="/gerador" className="text-muted hover:text-graphite px-3 md:px-4 py-1.5 text-[11px] md:text-xs transition-colors">Novo</Link>
            </div>
          </div>
          <Link href="/perfil" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-terra rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-105 transition-transform">
              {initials}
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">

          {/* ── Banner de Boas-Vindas ── */}
          <div className="col-span-1 md:col-span-12 p-4 md:p-6 bg-bark rounded-[24px] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl shadow-bark/20">
            <div className="absolute top-[-30px] right-[-30px] w-36 h-36 bg-terra/10 rounded-full blur-[50px]" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">{greeting}</p>
              <h1 className="font-display text-xl md:text-2xl font-black text-white leading-tight tracking-tight mb-0.5">
                Prof. {nome.split(' ')[0] || 'Professor'}
              </h1>
              {escola && <p className="text-sm text-white/40 font-medium mb-4">{escola}</p>}
              {isFull ? (
                <span className="inline-flex items-center gap-1.5 bg-terra/25 text-terra-light border border-terra/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  ✦ Plano Full · {creditos} créditos
                </span>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Créditos</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-black text-lg">{creditos}</span>
                      <span className="text-white/30 text-sm">disponíveis</span>
                    </div>
                  </div>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-terra rounded-full" style={{ width: `${Math.min((creditos / 5) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="relative z-10 flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
              <Link href="/planos" className="w-full md:w-auto">
                <button className="w-full md:w-auto px-6 py-3 bg-terra text-white rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-terra/20 hover:bg-terra-dark transition-all">
                  <Coins size={16} />
                  Inserir Créditos
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="col-span-1 md:col-span-6 p-4 md:p-5 bg-white border border-stone rounded-[24px] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/10 rounded-xl flex items-center justify-center text-sage flex-shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Total gerado</p>
                <p className="text-2xl font-black text-graphite leading-none mb-0.5">{totalGerado}</p>
                <span className="text-[8px] font-black uppercase text-sage bg-sage/10 px-1.5 py-0.5 rounded">Planos criados</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-6 p-4 md:p-5 bg-white border border-stone rounded-[24px] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold flex-shrink-0">
                <CalendarDays size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-0.5">Esta semana</p>
                <p className="text-2xl font-black text-graphite leading-none mb-0.5">{geradosSemana}</p>
                <span className="text-[8px] font-black uppercase text-gold bg-gold/10 px-1.5 py-0.5 rounded">Novos planos</span>
              </div>
            </div>
          </div>

          {/* ── Novo Plano de Aula ── */}
          <div className="col-span-1 md:col-span-12 flex justify-center py-4">
            <Link href="/gerador" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-5 bg-terra text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest shadow-xl shadow-terra/25 hover:bg-terra-dark transition-all">
                <PlusCircle size={20} />
                Novo Plano de Aula
              </button>
            </Link>
          </div>

          {/* ── Histórico Recente ── */}
          <div className="col-span-1 md:col-span-12 bg-white border border-stone rounded-[24px] flex flex-col overflow-hidden shadow-sm">
            <div className="px-4 md:px-5 py-3 border-b border-stone flex justify-between items-center">
              <h2 className="text-xs font-black text-graphite flex items-center gap-2 uppercase tracking-widest">
                <div className="w-1 h-1 bg-terra rounded-full" />
                Histórico Recente
              </h2>
              <Link href="/historico" className="text-[10px] font-bold text-terra hover:underline flex items-center gap-1">
                Ver tudo <ChevronRight size={12} />
              </Link>
            </div>

            {historicoRecente.length > 0 ? (
              <HistoricoRecente planos={historicoRecente} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center">
                <div className="w-12 h-12 bg-cream-dark rounded-xl flex items-center justify-center text-muted-light mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-sm md:text-base font-bold text-graphite mb-2">Inicie sua primeira geração</h3>
                <p className="text-xs md:text-sm text-muted max-w-xs mx-auto leading-relaxed mb-6 font-medium">
                  Seus plano de aula aparecerão aqui para download rápido.
                </p>
                <Link href="/gerador" className="w-full md:w-auto">
                  <button className="w-full md:w-auto px-5 py-2 border-2 border-terra text-terra font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cream transition-all">
                    Começar Agora
                  </button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-stone py-8 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">© 2026 ProsperAula. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            {['Termos', 'Privacidade', 'Suporte'].map(item => (
              <Link key={item} href="#" className="text-[11px] font-black text-muted uppercase tracking-[0.15em] hover:text-terra transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
