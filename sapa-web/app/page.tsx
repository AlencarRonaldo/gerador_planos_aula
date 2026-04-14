import { PlusCircle, User, History, Zap, LayoutDashboard, Search, Bell, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar Premium */}
      <nav className="nav-blur px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">SAPA<span className="text-indigo-600">.</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-xs font-bold text-slate-800">Dashboard</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Planos</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Materiais</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Buscar planos..." className="bg-slate-100 border-none rounded-full pl-9 pr-4 py-2 text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Bell size={20} /></button>
            <div className="w-9 h-9 bg-slate-200 rounded-full border border-white shadow-sm overflow-hidden">
              <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">RV</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10">
        <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h2>
            <p className="text-slate-500 font-medium mt-1">Bem-vindo, Prof. Rafael. Vamos planejar hoje?</p>
          </div>
          <Link href="/gerador">
            <button className="btn-gradient px-8 py-3.5 flex items-center gap-3 text-sm">
              <PlusCircle size={20} /> Criar Novo Plano
            </button>
          </Link>
        </header>

        {/* Grid Bento Principal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card de Assinatura - Destaque */}
          <div className="md:col-span-4 premium-card p-8 bg-slate-900 text-white border-none relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-10">
                  <div className="px-3 py-1 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">Plano Free</div>
                  <Settings size={18} className="text-slate-500 hover:text-white cursor-pointer transition-colors" />
                </div>
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Créditos de Geração</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-black">03</span>
                  <span className="text-2xl text-slate-500">/ 05</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full group-hover:w-[70%] transition-all duration-1000 ease-out" style={{ width: '60%' }}></div>
                </div>
                <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors">Fazer Upgrade</button>
              </div>
            </div>
            {/* Decoração de Fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          </div>

          {/* Histórico Recente */}
          <div className="md:col-span-8 premium-card p-0 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History size={18} className="text-indigo-600" /> Histórico Recente
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Ver tudo</button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
                  <PlusCircle size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">Inicie sua primeira geração</h4>
                <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
                  Seus planos gerados via portal web aparecerão aqui para download e edição rápida.
                </p>
                <Link href="/gerador" className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-6 py-3 rounded-xl hover:bg-indigo-100 transition-colors">
                  Começar Agora
                </Link>
              </div>
            </div>
          </div>

          {/* Cards Secundários - Dicas/News */}
          <div className="md:col-span-6 premium-card p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-100/50">
            <div className="flex gap-5">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-emerald-900 mb-1 leading-tight">Dica de Produtividade</h4>
                <p className="text-sm text-emerald-700/80 leading-relaxed">
                  Você pode selecionar múltiplas semanas de uma vez para gerar o cronograma completo do bimestre em segundos.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 premium-card p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-100/50">
            <div className="flex gap-5">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 shrink-0">
                <Settings size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-amber-900 mb-1 leading-tight">Suporte ao Template</h4>
                <p className="text-sm text-amber-700/80 leading-relaxed">
                  Adicione tags como <code className="bg-white/50 px-1.5 py-0.5 rounded text-amber-900">{"{desenvolvimento}"}</code> no seu Word para preenchimento automático.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="px-6 py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-tighter">
          <p>© 2026 SAPA SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Termos</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
