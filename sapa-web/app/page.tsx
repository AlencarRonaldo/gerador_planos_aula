import { PlusCircle, BookOpen, FileText, ChevronRight, BarChart3, CalendarDays, Coins, Sparkles, Clock, ShieldCheck, CheckCircle2, ArrowRight, Coffee, PenTool, Heart, GraduationCap, Zap } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseServer } from '../lib/supabase-server'
import HistoricoRecente from './HistoricoRecente'

// ── Componentes Visuais de Apoio ──

function Noise() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] mix-blend-overlay">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  )
}

function NotebookPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
         style={{ backgroundImage: 'radial-gradient(#0F172A 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
  )
}

export default async function Home() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // ── LANDING PAGE (MODELO A: O ACOLHEDOR REFINADO) ──
    return (
      <div className="min-h-screen bg-cream selection:bg-terra/20 overflow-x-hidden font-sans">
        <Noise />
        
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-xl border-b border-stone/40 overflow-visible">
          <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center overflow-visible">
            <div className="flex items-center">
              <img src="/logo.png" alt="Aula360" className="h-28 w-auto" />
            </div>
            <div className="flex items-center gap-8">
              <Link href="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-terra transition-colors">
                Entrar no Sistema
              </Link>
              <Link href="/login">
                <button className="px-6 py-2.5 bg-graphite text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-lg hover:bg-terra transition-all">
                  Começar Agora
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <header className="relative pt-32 pb-20 md:pt-52 md:pb-40 px-6">
          <NotebookPattern />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full opacity-30 pointer-events-none">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-terra/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-stone/60 text-terra rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-sm animate-fade-up">
              <Heart size={12} className="fill-terra" /> Criado de professor para professor
            </div>
            
            <h1 className="font-display text-5xl md:text-8xl font-black text-graphite leading-[1] tracking-tighter mb-10 animate-fade-up delay-1">
              Troque o Word pelo café. <br />
              <span className="text-terra relative inline-block">
                Seus domingos
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-gold/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span> voltaram a ser seus.
            </h1>
            
            <p className="text-lg md:text-2xl text-muted font-medium leading-relaxed max-w-3xl mx-auto mb-14 animate-fade-up delay-2">
              Deixe a burocracia da BNCC com a nossa inteligência pedagógica. Gere planos de aula <span className="text-graphite font-bold underline decoration-terra/30 decoration-4 underline-offset-4">completos e formatados</span> enquanto você realmente descansa.
            </p>

            <div className="flex flex-col items-center gap-6 animate-fade-up delay-3">
              <Link href="/login" className="group">
                <button className="px-10 py-6 bg-terra text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-terra/40 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4">
                  Recuperar meu tempo livre <ArrowRight size={20} />
                </button>
              </Link>
              <div className="flex items-center gap-4 text-muted/60">
                <div className="w-12 h-[1px] bg-stone" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Teste grátis agora</span>
                <div className="w-12 h-[1px] bg-stone" />
              </div>
            </div>
          </div>
        </header>

        {/* The Pain - Problem Empathy */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 lg:gap-24 items-center">
              <div className="space-y-8">
                <h2 className="font-display text-4xl md:text-5xl font-black text-graphite tracking-tight leading-tight">
                  Chega de lutar contra a <span className="italic text-muted-light">burocracia infinita</span>.
                </h2>
                <div className="space-y-6 text-muted font-medium leading-relaxed">
                  <p>
                    Sabemos que o planejamento consome horas que deveriam ser suas. A busca por códigos da BNCC, a elaboração de metodologias e a formatação no Word são tarefas exaustivas.
                  </p>
                  <p className="font-bold text-graphite">
                    O Aula360 não substitui sua criatividade — ele a liberta de todo o trabalho mecânico.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-cream rounded-xl border border-stone/50">
                    <p className="text-2xl font-display font-black text-terra mb-1">-95%</p>
                    <p className="text-[10px] font-black uppercase text-muted-light tracking-widest">Tempo de Escrita</p>
                  </div>
                  <div className="p-4 bg-cream rounded-xl border border-stone/50">
                    <p className="text-2xl font-display font-black text-terra mb-1">Zero</p>
                    <p className="text-[10px] font-black uppercase text-muted-light tracking-widest">Erros de Código</p>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gold/10 rounded-[40px] rotate-3 -z-10 group-hover:rotate-1 transition-transform duration-500" />
                <div className="bg-cream-dark rounded-[40px] border border-stone/60 shadow-2xl overflow-hidden aspect-video transform hover:scale-[1.02] transition-transform duration-500">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  >
                    <source src="/plano.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white rounded-[32px] border border-stone/60 shadow-2xl flex flex-col items-center justify-center p-6 z-20">
                   <FileText size={48} className="text-terra mb-3" />
                   <span className="text-[10px] font-black uppercase text-center tracking-tighter leading-tight">Word Gerado com Sucesso</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Freedom */}
        <section className="py-32 bg-cream/50 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="font-display text-4xl md:text-6xl font-black text-graphite tracking-tight mb-6">
                Tecnologia com alma pedagógica.
              </h2>
              <p className="text-muted font-medium text-lg">
                Não é apenas um gerador de texto. É um assistente que entende as competências e habilidades reais da educação brasileira.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: <Zap className="text-terra" size={32} />, 
                  title: "Velocidade Real", 
                  desc: "Gere um semestre inteiro de planos de aula em minutos. Importe seu escopo-sequência e deixe o resto conosco." 
                },
                { 
                  icon: <GraduationCap className="text-sage" size={32} />, 
                  title: "Domínio BNCC", 
                  desc: "Cálculo preciso de códigos e habilidades. O sistema sugere as melhores competências para cada objetivo de aula." 
                },
                { 
                  icon: <Coffee className="text-gold" size={32} />, 
                  title: "Tranquilidade Total", 
                  desc: "Exportação direta para Word (.docx) com templates profissionais. Salve na nuvem e acesse de qualquer lugar." 
                }
              ].map((pill, i) => (
                <div key={i} className="group p-10 bg-white border border-stone/40 rounded-[32px] shadow-sm hover:shadow-2xl hover:border-terra/20 hover:-translate-y-2 transition-all duration-500">
                  <div className="w-16 h-16 bg-cream-dark rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {pill.icon}
                  </div>
                  <h3 className="text-xl font-black text-graphite mb-4 tracking-tight">{pill.title}</h3>
                  <p className="text-sm text-muted font-medium leading-relaxed">{pill.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simplicity Loop */}
        <section className="py-24 bg-bark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-terra/5 -skew-x-12 translate-x-1/2" />
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8">
                <h2 className="font-display text-4xl md:text-5xl font-black leading-tight tracking-tight">
                  Tão simples que parece <span className="text-terra-light italic">mágica</span>.
                </h2>
                <div className="space-y-10">
                  {[
                    { n: "1", t: "Envie sua planilha", d: "Aquece o café enquanto nosso sistema lê seu cronograma escolar." },
                    { n: "2", t: "A IA escreve", d: "Desenvolvimento, AEE e Exercícios gerados com rigor pedagógico." },
                    { n: "3", t: "Baixe e Brilhe", d: "Um documento Word perfeito pronto para ser entregue." }
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="w-10 h-10 rounded-full border-2 border-terra-light flex items-center justify-center font-black text-terra-light shrink-0">
                        {step.n}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-lg tracking-tight">{step.t}</h4>
                        <p className="text-white/60 text-sm font-medium">{step.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                 <div className="bg-white/5 border border-white/10 p-4 rounded-[32px] backdrop-blur-md shadow-2xl">
                    <div className="bg-white rounded-[24px] overflow-hidden aspect-video shadow-inner">
                       <video 
                         className="w-full h-full object-cover"
                         autoPlay 
                         loop 
                         muted 
                         playsInline
                         controls
                       >
                         <source src="/plano.mp4" type="video/mp4" />
                         Seu navegador não suporta vídeos.
                       </video>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial / Social Proof */}
        <section className="py-32 bg-white border-b border-stone/20">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
            <div className="inline-flex gap-1 text-gold">
              {[1,2,3,4,5].map(i => <Sparkles key={i} size={20} className="fill-gold" />)}
            </div>
            <blockquote className="font-display text-3xl md:text-4xl font-black text-graphite leading-snug">
              "Pela primeira vez em 12 anos de magistério, consegui terminar meu planejamento de bimestre em uma única tarde. É libertador."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-terra/10 rounded-full flex items-center justify-center text-terra font-black text-xs">MA</div>
              <div className="text-left">
                <p className="font-black text-graphite text-sm tracking-tight">Maria Alice</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Professora de TI e Robótica</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 bg-cream relative">
          <div className="max-w-5xl mx-auto bg-graphite p-12 md:p-24 rounded-[48px] text-center relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <NotebookPattern />
            </div>
            <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-terra/30 rounded-full blur-[100px]" />
            
            <h2 className="font-display text-4xl md:text-7xl font-black text-white leading-[1] tracking-tighter mb-10 relative z-10">
              Sua carreira merece <br /><span className="text-terra-light">mais prosperidade</span>.
            </h2>
            
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-14 relative z-10 leading-relaxed">
              Junte-se a centenas de professores que estão redescobrindo o prazer de ensinar sem a carga do planejamento manual.
            </p>

            <Link href="/login" className="relative z-10 inline-block group">
              <button className="px-12 py-7 bg-white text-graphite rounded-[24px] font-black text-sm md:text-base uppercase tracking-[0.2em] shadow-xl group-hover:bg-terra-light group-hover:text-white transition-all duration-300 active:scale-95">
                Começar agora com 3 créditos grátis
              </button>
            </Link>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-terra-light" /> Sem cartão necessário</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-terra-light" /> Alinhado à BNCC</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-terra-light" /> Exportação Word Imediata</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 border-t border-stone/20">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 text-center md:text-left">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center justify-center md:justify-start">
                <img src="/logo.png" alt="Aula360" className="h-12 w-auto" />
              </div>
              <p className="text-sm text-muted font-medium leading-relaxed max-w-xs mx-auto md:mx-0">
                Transformando a rotina docente através da inteligência pedagógica e tecnologia humanizada.
              </p>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite">Plataforma</h5>
              <ul className="space-y-4 text-xs font-bold text-muted">
                <li><Link href="/login" className="hover:text-terra transition-colors">Entrar</Link></li>
                <li><Link href="/planos" className="hover:text-terra transition-colors">Preços</Link></li>
                <li><Link href="#" className="hover:text-terra transition-colors">Segurança</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-graphite">Suporte</h5>
              <ul className="space-y-4 text-xs font-bold text-muted">
                <li><Link href="#" className="hover:text-terra transition-colors">Termos</Link></li>
                <li><Link href="#" className="hover:text-terra transition-colors">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-terra transition-colors">Fale Conosco</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-6 mt-20 pt-8 border-t border-stone/10 text-center">
            <p className="text-[9px] font-black text-muted-light uppercase tracking-[0.3em]">© 2026 Aula360. Desenvolvido para inspirar o ensino.</p>
          </div>
        </footer>
      </div>
    )
  }

  // ── DASHBOARD (PARA USUÁRIOS LOGADOS - MANTIDO E REFINADO) ──
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
    <div className="min-h-screen flex flex-col bg-cream selection:bg-terra/20">
      <Noise />

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center">
              <img src="/logo.png" alt="Aula360" className="h-12 w-auto" />
            </div>
            <div className="flex items-center gap-1 bg-cream-dark p-1 rounded-xl border border-stone">
              <button className="bg-white text-graphite shadow-sm px-3 md:px-4 py-1.5 text-[11px] md:text-xs rounded-lg font-bold tracking-tight">Painel</button>
              <Link href="/historico" className="text-muted hover:text-graphite px-3 md:px-4 py-1.5 text-[11px] md:text-xs hidden sm:block transition-colors font-bold tracking-tight">Histórico</Link>
              <Link href="/gerador" className="text-muted hover:text-graphite px-3 md:px-4 py-1.5 text-[11px] md:text-xs transition-colors font-bold tracking-tight">Novo Plano</Link>
            </div>
          </div>
          <Link href="/perfil" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-terra rounded-full flex items-center justify-center text-white font-black text-xs shadow-md group-hover:scale-105 group-hover:rotate-3 transition-all">
              {initials}
            </div>
          </Link>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* ── Banner de Boas-Vindas ── */}
          <div className="col-span-1 md:col-span-12 p-6 md:p-10 bg-bark rounded-[40px] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-2xl shadow-bark/30">
            <NotebookPattern />
            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-terra/20 rounded-full blur-[60px]" />
            <div className="relative z-10 space-y-2">
              <p className="text-[11px] font-black text-terra-light uppercase tracking-[0.3em] mb-2">{greeting}, professor.</p>
              <h1 className="font-display text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                {nome.split(' ')[0] || 'Docente'}
              </h1>
              {escola && <p className="text-base text-white/40 font-medium italic">{escola}</p>}
              <div className="pt-6">
                {isFull ? (
                  <span className="inline-flex items-center gap-2 bg-terra/25 text-terra-light border border-terra/30 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">
                    <Sparkles size={14} className="animate-pulse" /> Plano Premium Ativo
                  </span>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Créditos de aula</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-white font-black text-2xl">{creditos}</span>
                        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Disponíveis</span>
                      </div>
                    </div>
                    <div className="w-56 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <div className="h-full bg-gradient-to-r from-terra to-gold rounded-full shadow-[0_0_12px_rgba(196,98,45,0.5)]" style={{ width: `${Math.min((creditos / 5) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <Link href="/planos" className="w-full md:w-auto">
                <button className="w-full md:w-auto px-8 py-4 bg-white text-graphite rounded-[20px] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] shadow-2xl hover:bg-terra-light hover:text-white transition-all group">
                  <Coins size={18} className="group-hover:rotate-12 transition-transform" />
                  Recarregar Créditos
                </button>
              </Link>
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="col-span-1 md:col-span-6 p-6 md:p-8 bg-white border border-stone rounded-[32px] shadow-sm group hover:border-terra/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-sage/10 rounded-2xl flex items-center justify-center text-sage flex-shrink-0 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Impacto Total</p>
                <p className="text-4xl font-display font-black text-graphite leading-none mb-2">{totalGerado}</p>
                <span className="badge badge-sage">Planos Concluídos</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-6 p-6 md:p-8 bg-white border border-stone rounded-[32px] shadow-sm group hover:border-terra/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gold/10 rounded-2xl flex items-center justify-center text-gold flex-shrink-0 group-hover:scale-110 transition-transform">
                <CalendarDays size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Ritmo Semanal</p>
                <p className="text-4xl font-display font-black text-graphite leading-none mb-2">{geradosSemana}</p>
                <span className="badge badge-gold">Novos Planos</span>
              </div>
            </div>
          </div>

          {/* ── Novo Plano de Aula ── */}
          <div className="col-span-1 md:col-span-12 flex justify-center py-4">
            <Link href="/gerador" className="w-full md:w-auto relative group">
              <div className="absolute inset-0 bg-terra blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <button className="relative w-full md:w-auto px-8 py-3.5 bg-terra text-white rounded-[16px] flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-[0_12px_24px_-8px_rgba(196,98,45,0.4)] hover:bg-terra-dark hover:-translate-y-1 transition-all">
                <PlusCircle size={18} />
                Gerar Novo Plano
              </button>
            </Link>
          </div>

          {/* ── Histórico Recente ── */}
          <div className="col-span-1 md:col-span-12 bg-white border border-stone rounded-[32px] flex flex-col overflow-hidden shadow-sm">
            <div className="px-6 md:px-8 py-5 border-b border-stone flex justify-between items-center bg-cream-dark/30">
              <h2 className="text-xs font-black text-graphite flex items-center gap-3 uppercase tracking-widest">
                <div className="w-2 h-2 bg-terra rounded-full animate-pulse" />
                Planos em Andamento
              </h2>
              <Link href="/historico" className="text-[10px] font-bold text-terra hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                Ver Arquivo Completo <ChevronRight size={14} />
              </Link>
            </div>

            {historicoRecente.length > 0 ? (
              <HistoricoRecente planos={historicoRecente} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 md:p-20 text-center">
                <div className="w-20 h-20 bg-cream-dark rounded-[30px] flex items-center justify-center text-muted-light mb-8 shadow-inner border border-stone/50 rotate-3">
                  <PenTool size={32} />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-black text-graphite mb-4 tracking-tight">Sua jornada começa aqui.</h3>
                <p className="text-sm md:text-base text-muted max-w-sm mx-auto leading-relaxed mb-10 font-medium italic">
                  "O segredo de progredir é começar." — Mark Twain
                </p>
                <Link href="/gerador" className="w-full md:w-auto">
                  <button className="w-full md:w-auto px-8 py-3 border-2 border-terra text-terra font-black text-xs uppercase tracking-widest rounded-xl hover:bg-terra hover:text-white transition-all shadow-xl shadow-terra/10">
                    Criar meu primeiro plano
                  </button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-stone py-12 bg-white mt-12 relative overflow-hidden">
        <NotebookPattern />
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center relative z-10">
          <div className="space-y-2">
            <p className="text-[11px] font-black text-graphite uppercase tracking-[0.2em]">Aula360 © 2026</p>
            <p className="text-[9px] font-bold text-muted-light uppercase tracking-widest">Educação, Tecnologia e Qualidade de Vida.</p>
          </div>
          <div className="flex gap-10">
            {['Documentação', 'Políticas', 'Canal do Prof'].map(item => (
              <Link key={item} href="#" className="text-[10px] font-black text-muted-light uppercase tracking-[0.15em] hover:text-terra transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
