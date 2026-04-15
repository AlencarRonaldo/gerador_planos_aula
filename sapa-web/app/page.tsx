import { PlusCircle, Clock, BookOpen, Zap, FileText, ArrowRight, Search, Bell, ChevronRight, Sparkles, BarChart3, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseServer } from '../lib/supabase-server'

export default async function Home() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let nome = ''
  let escola = ''
  let creditos = 0
  let totalGerado = 0
  let geradosSemana = 0
  let historicoRecente: any[] = []

  if (user) {
    // 1. Dados do Perfil
    const { data: profile } = await supabase.from('perfis').select('nome_completo, escola_padrao, creditos').eq('id', user.id).maybeSingle()
    
    // Prioridade: Banco > Metadados (Social Login) > Email > Fallback
    nome = profile?.nome_completo || user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    escola = profile?.escola_padrao || ''
    creditos = profile?.creditos ?? 0

    // 2. Estatísticas de Geração
    const { count: total } = await supabase.from('planos_gerados').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id)
    totalGerado = total || 0

    const umaSemanaAtras = new Date()
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7)
    const { count: semana } = await supabase.from('planos_gerados').select('*', { count: 'exact', head: true })
      .eq('usuario_id', user.id)
      .gte('created_at', umaSemanaAtras.toISOString())
    geradosSemana = semana || 0

    // 3. Histórico Recente
    const { data: hist } = await supabase.from('planos_gerados').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false }).limit(5)
    historicoRecente = hist || []
  }

  const primeiroNome = nome.split(' ')[0] || 'Professor'
  const initials = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'

  // Hora do dia para saudação contextual
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="sapa-nav">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          
          {/* Logo + Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38,
                background: 'var(--terra)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px -2px rgba(196,98,45,0.4)',
              }}>
                <BookOpen size={18} color="#fff" strokeWidth={2} />
              </div>
              <span className="font-display" style={{ fontSize: 22, fontWeight: 900, color: 'var(--graphite)', letterSpacing: '-0.02em' }}>
                SAPA
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--cream-dark)', padding: '4px', borderRadius: 12, border: '1px solid var(--stone)' }}>
              <button className="nav-pill-active" style={{ padding: '6px 16px', fontSize: 13 }}>Dashboard</button>
              <Link href="/historico" className="nav-pill" style={{ padding: '6px 16px', fontSize: 13, textDecoration: 'none', display: 'block' }}>Planos</Link>
              <Link href="/gerador" className="nav-pill" style={{ padding: '6px 16px', fontSize: 13, textDecoration: 'none', display: 'block' }}>Gerador</Link>
            </div>
          </div>

          {/* Search + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', display: 'none' }} className="lg-search">
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} size={14} />
              <input
                type="text"
                placeholder="Buscar planos..."
                className="sapa-input"
                style={{ width: 240 }}
              />
            </div>

            <button
              style={{ padding: 9, borderRadius: 10, border: '1px solid var(--stone)', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', display: 'flex', transition: 'color 0.2s' }}
              title="Notificações"
            >
              <Bell size={18} />
            </button>

            <Link href="/perfil" title="Perfil">
              <div style={{
                width: 38, height: 38,
                background: 'var(--terra)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(196,98,45,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                letterSpacing: '0.02em',
              }}>
                {initials}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '40px 24px 60px' }}>

        {/* ── Header ── */}
        <header className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 40, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--terra)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {greeting}, Prof. {nome || 'Professor'}
              {escola && <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> · {escola}</span>}
            </p>
            <h1 className="font-display" style={{ fontSize: 38, fontWeight: 900, color: 'var(--graphite)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              Painel de<br />Controle
            </h1>
          </div>
          <Link href="/gerador">
            <button className="btn-primary">
              <PlusCircle size={18} />
              Criar Novo Plano
            </button>
          </Link>
        </header>

        {/* ── Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>

          {/* ── Card de Créditos (dark hero) ── */}
          <div className="sapa-card-dark animate-fade-up delay-1" style={{ gridColumn: 'span 4', padding: '20px 22px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
            {/* Orb decorativo */}
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 140, height: 140,
              background: 'rgba(196,98,45,0.2)', borderRadius: '50%', filter: 'blur(50px)',
              animation: 'pulseOrb 4s ease-in-out infinite',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="badge badge-terra" style={{ background: 'rgba(196,98,45,0.25)', color: '#E8A07A' }}>Plano Free</span>
                <Sparkles size={14} color="rgba(255,255,255,0.3)" />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)', marginBottom: 4 }}>Créditos de Geração</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="stat-value" style={{ fontSize: 40 }}>{String(creditos).padStart(2, '0')}</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.28)', fontWeight: 300, fontFamily: 'DM Sans' }}>/&thinsp;05</span>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="progress-track" style={{ marginBottom: 10 }}>
                <div className="progress-fill" style={{ width: `${(creditos / 5) * 100}%` }} />
              </div>
              <button style={{
                width: '100%', padding: '9px 0',
                background: 'rgba(255,255,255,0.97)',
                color: 'var(--bark)',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 700, fontSize: 11,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                transition: 'background 0.2s',
              }}>
                <Link href="/planos" style={{ color: 'var(--bark)', textDecoration: 'none', display: 'block' }}>
                  Fazer Upgrade →
                </Link>
              </button>
            </div>
          </div>

          {/* ── Histórico Recente ── */}
          <div className="sapa-card animate-fade-up delay-2" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--stone)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--graphite)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Clock size={15} color="var(--terra)" strokeWidth={2} />
                Histórico Recente
              </h2>
              <Link href="/historico" style={{ fontSize: 12, fontWeight: 700, color: 'var(--terra)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
                Ver tudo <ChevronRight size={13} />
              </Link>
            </div>

            {/* Lista de Histórico ou Empty State */}
            {historicoRecente.length > 0 ? (
              <div style={{ flex: 1, padding: '10px 0' }}>
                {historicoRecente.map((plano) => (
                  <div key={plano.id} style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--stone-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, background: 'var(--cream-dark)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={14} color="var(--muted)" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--graphite)' }}>{plano.componente}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>Semana {plano.semana} · {new Date(plano.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <a href={plano.arquivo_url} target="_blank" rel="noopener noreferrer">
                      <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>Baixar</button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px', textAlign: 'center' }}>
                <div className="empty-eye" style={{ marginBottom: 14, width: 44, height: 44, borderRadius: 12 }}>
                  <FileText size={20} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--graphite)' }}>
                  Inicie sua primeira geração
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--muted)', maxWidth: 340, lineHeight: 1.6 }}>
                  Seus planos gerados aparecerão aqui para download e edição rápida — prontos na hora em que você precisar.
                </p>
                <Link href="/gerador">
                  <button className="btn-ghost">
                    <Zap size={14} />
                    Começar Agora
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Card Stats Row ── */}
          <div className="sapa-card animate-fade-up delay-3" style={{ gridColumn: 'span 4', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(90,122,90,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart3 size={20} color="var(--sage)" />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total gerado</p>
                <p className="font-display" style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: 'var(--graphite)', lineHeight: 1 }}>{totalGerado}</p>
                <span className="badge badge-sage" style={{ fontSize: 10 }}>Planos criados</span>
              </div>
            </div>
          </div>

          <div className="sapa-card animate-fade-up delay-3" style={{ gridColumn: 'span 4', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(200,155,60,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CalendarDays size={20} color="var(--gold)" />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Esta semana</p>
                <p className="font-display" style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: 'var(--graphite)', lineHeight: 1 }}>{geradosSemana}</p>
                <span className="badge badge-gold" style={{ fontSize: 10 }}>Novos planos</span>
              </div>
            </div>
          </div>

          <div className="sapa-card animate-fade-up delay-3" style={{ gridColumn: 'span 4', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(196,98,45,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={20} color="var(--terra)" />
              </div>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Créditos</p>
                <p className="font-display" style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: 'var(--graphite)', lineHeight: 1 }}>{creditos}</p>
                <span className="badge badge-terra" style={{ fontSize: 10 }}>Disponíveis</span>
              </div>
            </div>
          </div>

          {/* ── Dica de Produtividade ── */}
          <div className="animate-fade-up delay-4" style={{
            gridColumn: 'span 6', padding: 24,
            background: 'linear-gradient(135deg, rgba(90,122,90,0.08) 0%, rgba(90,122,90,0.04) 100%)',
            border: '1px solid rgba(90,122,90,0.18)',
            borderRadius: 'var(--radius-card)',
          }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: 'var(--sage)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px -2px rgba(90,122,90,0.4)' }}>
                <Zap size={20} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#2E4A2E', lineHeight: 1.3 }}>Dica de Produtividade</h4>
                <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(46,74,46,0.75)', lineHeight: 1.6 }}>
                  Selecione <strong>múltiplas semanas</strong> de uma vez para gerar o cronograma completo do bimestre em segundos.
                </p>
              </div>
            </div>
          </div>

          {/* ── Suporte ao Template ── */}
          <div className="animate-fade-up delay-5" style={{
            gridColumn: 'span 6', padding: 24,
            background: 'linear-gradient(135deg, rgba(200,155,60,0.08) 0%, rgba(200,155,60,0.04) 100%)',
            border: '1px solid rgba(200,155,60,0.2)',
            borderRadius: 'var(--radius-card)',
          }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: 'var(--gold)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px -2px rgba(200,155,60,0.4)' }}>
                <FileText size={20} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#5C3D0A', lineHeight: 1.3 }}>Suporte ao Template</h4>
                <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(92,61,10,0.75)', lineHeight: 1.6 }}>
                  Adicione tags como <code style={{ background: 'rgba(255,255,255,0.55)', padding: '1px 6px', borderRadius: 5, fontFamily: 'monospace', fontSize: 12, color: '#9A6E1A' }}>{'{desenvolvimento}'}</code> no seu Word para preenchimento automático.
                </p>
              </div>
            </div>
          </div>

          {/* ── CTA Banner ── */}
          <div className="animate-fade-up delay-5" style={{
            gridColumn: 'span 12',
            padding: '24px 32px',
            background: 'var(--bark)',
            borderRadius: 'var(--radius-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Pronto para começar?</p>
              <p className="font-display" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                Crie seu primeiro plano de aula agora.
              </p>
            </div>
            <Link href="/gerador">
              <button className="btn-primary" style={{ background: 'var(--terra)', flexShrink: 0 }}>
                Ir para o Gerador <ArrowRight size={16} />
              </button>
            </Link>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--stone)', padding: '24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--muted-light)', fontWeight: 500 }}>© 2026 SAPA. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Termos', 'Privacidade', 'Suporte'].map(item => (
              <Link key={item} href="#" style={{ fontSize: 12, color: 'var(--muted-light)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
