'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  PenTool, 
  Sparkles, 
  Calendar, 
  Layers,
  CheckCircle,
  Loader2,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '../../components/file-upload'
import * as XLSX from 'xlsx'
import { fillWordTemplate, gerarNomeArquivo } from '../../lib/gerador'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { supabase } from '../../lib/supabase'

export default function GeradorPage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  
  const [professor, setProfessor] = useState('')
  const [escola, setEscola] = useState('')
  const [turma, setTurma] = useState('')
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [wordFile, setWordFile] = useState<File | null>(null)

  const [abas, setAbas] = useState<string[]>([])
  const [abaSel, setAbaSel] = useState('')
  const [componentes, setComponentes] = useState<string[]>([])
  const [compSel, setCompSel] = useState('')
  const [bimestres, setBimestres] = useState<number[]>([])
  const [bimSel, setBimSel] = useState<number>(1)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([])

  // Carregar dados do perfil se logado
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('perfis').select('*').eq('id', user.id).single()
        if (profile) {
          setProfessor(profile.nome_completo || '')
          setEscola(profile.escola_padrao || '')
        }
      }
    }
    loadProfile()
  }, [])

  useEffect(() => {
    if (excelFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' })
        setAbas(wb.SheetNames)
        if (wb.SheetNames.length > 0) setAbaSel(wb.SheetNames[0])
      }
      reader.readAsArrayBuffer(excelFile)
    }
  }, [excelFile])

  useEffect(() => {
    if (excelFile && abaSel) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: 'array' })
        const json = XLSX.utils.sheet_to_json(wb.Sheets[abaSel], { header: 1 }) as any[][]
        const comps = new Set<string>(); const bims = new Set<number>(); const lessons: any[] = []

        json.slice(1).forEach(row => {
          if (!row[1] || !row[10]) return
          const b = Number(row[1]); const w = Number(row[10])
          if (!isNaN(b)) bims.add(b)
          const m = String(row[5] || "").length > 100 ? String(row[3] || "") : (String(row[5] || "") || String(row[3] || ""))
          if (m) { comps.add(m); lessons.push({ bimestre: b, semana: w, componente: m, titulo: row[12], obj: row[15], hab: row[13], tema: row[11] }) }
        })
        setAllLessons(lessons); setComponentes(Array.from(comps).sort()); setBimestres(Array.from(bims).sort((a,b)=>a-b))
      }
      reader.readAsArrayBuffer(excelFile)
    }
  }, [excelFile, abaSel])

  const handleGenerate = async () => {
    setIsGenerating(true)
    const zip = new JSZip()
    const templateBuffer = await wordFile!.arrayBuffer()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      for (const w of selectedWeeks) {
        const weekLessons = allLessons.filter(l => l.semana === w && l.componente === compSel && l.bimestre === bimSel)
        if (weekLessons.length > 0) {
          // Chamada via API Route (Segurança)
          const response = await fetch('/api/gerar', {
            method: 'POST',
            body: JSON.stringify({ lessons: weekLessons })
          })
          
          if (!response.ok) throw new Error("Falha na IA")
          const { content } = await response.json()

          const objetivosStr = weekLessons.map((l, i) => `Aula ${i+1}: ${l.obj || l.objetivo}`).join('\n')

          const docBlob = await fillWordTemplate(templateBuffer, {
            escola, 
            professor, 
            turma, 
            componente: compSel, 
            bimestre: bimSel, 
            semana: w, 
            tema: weekLessons[0].tema,
            objetivos: objetivosStr,
            natureza: weekLessons[0].natureza || 'Teórica/Prática',
            desenvolvimento: content
          })
          
          const filename = gerarNomeArquivo(turma, w, compSel)
          zip.file(filename, docBlob)

          // Salvar Histórico no Supabase (Fase 1 do Roadmap)
          if (user) {
            await supabase.from('planos_gerados').insert({
              usuario_id: user.id,
              professor,
              escola,
              turma,
              componente: compSel,
              bimestre: bimSel,
              semana: w,
              tema: weekLessons[0].tema,
              arquivo_nome: filename
            })
          }
        }
      }
      const finalZip = await zip.generateAsync({ type: 'blob' })
      setZipBlob(finalZip); setIsFinished(true); saveAs(finalZip, `planos.zip`)
    } catch (e) { 
      console.error(e)
      alert("Erro na geração. Verifique sua conexão e tente novamente.") 
    } finally { 
      setIsGenerating(false) 
    }
  }


  const currentWeeks = Array.from(new Set(allLessons.filter(l => l.bimestre === bimSel && l.componente === compSel).map(l => l.semana))).sort((a,b)=>a-b)

  return (
    <div className="min-h-screen pb-12">
      <nav className="nav-blur px-6 py-3 mb-8 flex justify-between items-center shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><GraduationCap size={18} /></div>
          <h1 className="text-base font-bold leading-none text-slate-900">SAPA <span className="text-indigo-600 text-[9px] block font-black uppercase">SaaS</span></h1>
        </Link>
        <div className="flex gap-2">
          {[1,2,3,4].map(i => <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-indigo-600' : 'bg-slate-200'}`} />)}
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Passo 01</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Identificação</h2>
            </header>
            <div className="premium-card grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Professor</label><input value={professor} onChange={e=>setProfessor(e.target.value)} className="w-full p-3 rounded-xl border-2 text-sm outline-none focus:border-indigo-500" placeholder="Nome completo" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Escola</label><input value={escola} onChange={e=>setEscola(e.target.value)} className="w-full p-3 rounded-xl border-2 text-sm outline-none focus:border-indigo-500" placeholder="Nome da instituição" /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Turma</label><input value={turma} onChange={e=>setTurma(e.target.value)} className="w-full p-3 rounded-xl border-2 text-sm outline-none focus:border-indigo-500" placeholder="Ex: 3º Ano B" /></div>
            </div>
            <div className="flex justify-end"><button onClick={()=>setStep(2)} disabled={!professor||!escola} className="btn-gradient px-8 py-2.5 text-xs flex items-center gap-2">Continuar <ArrowRight size={14}/></button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Passo 02</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Arquivos Base</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload label="Escopo" description=".xlsx" accept={{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}} file={excelFile} onFileSelect={setExcelFile} color="indigo" />
              <FileUpload label="Modelo" description=".docx" accept={{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}} file={wordFile} onFileSelect={setWordFile} color="amber" />
            </div>
            <div className="flex justify-between items-center mt-8">
              <button onClick={()=>setStep(1)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"><ArrowLeft size={14}/> Voltar</button>
              <button onClick={()=>setStep(3)} disabled={!excelFile||!wordFile} className="btn-gradient px-8 py-2.5 text-xs flex items-center gap-2">Continuar <ArrowRight size={14}/></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Passo 03</span>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Configurações</h2>
            </header>
            <div className="premium-card grid grid-cols-1 md:grid-cols-3 gap-3 p-6">
              <div><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Aba</label><select value={abaSel} onChange={e=>setAbaSel(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all">{abas.map(a=><option key={a}>{a}</option>)}</select></div>
              <div><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Bimestre</label><select value={bimSel} onChange={e=>setBimSel(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all">{bimestres.map(b=><option key={b} value={b}>{b}º</option>)}</select></div>
              <div><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Matéria</label><select value={compSel} onChange={e=>setCompSel(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all">{componentes.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="md:col-span-3 pt-4"><label className="text-[10px] font-black uppercase text-slate-400 block mb-2 ml-1">Semanas Disponíveis</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currentWeeks.map(w=><div key={w} onClick={()=>setSelectedWeeks(prev=>prev.includes(w)?prev.filter(x=>x!==w):[...prev,w])} className={`p-2.5 border-2 rounded-xl cursor-pointer text-[11px] font-black transition-all text-center ${selectedWeeks.includes(w)?'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100':'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'}`}>Semana {w}</div>)}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8">
              <button onClick={()=>setStep(2)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"><ArrowLeft size={14}/> Voltar</button>
              <button onClick={()=>setStep(4)} disabled={selectedWeeks.length===0} className="btn-gradient px-8 py-2.5 text-xs flex items-center gap-2 tracking-widest uppercase">Próximo Passo <ArrowRight size={14}/></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-10 flex flex-col items-center animate-in zoom-in">
            <div className={`w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-8 ${isGenerating?'animate-pulse':'rotate-6 animate-bounce'}`}><Sparkles size={36} /></div>
            <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">{isFinished ? "Tudo Pronto!" : "Gerar Planos"}</h2>
            <p className="text-slate-500 text-sm mb-10 max-w-sm font-medium leading-relaxed">{isFinished ? "Seus planos foram processados. Clique para baixar o pacote ZIP." : "Inicie o motor de inteligência artificial para criar seus documentos."}</p>
            {isFinished ? (
              <button onClick={()=>saveAs(zipBlob!, 'planos.zip')} className="btn-gradient from-emerald-600 to-teal-600 w-full max-w-xs py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3"><Download size={18}/> Baixar ZIP Completo</button>
            ) : (
              <button onClick={handleGenerate} disabled={isGenerating} className="btn-gradient w-full max-w-xs py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3">{isGenerating ? <Loader2 className="animate-spin" size={18} /> : "Iniciar Geração Agora"}</button>
            )}
            {!isGenerating && <button onClick={()=>setStep(3)} className="mt-8 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Revisar configurações</button>}
          </div>
        )}
      </main>
    </div>
  )
}
