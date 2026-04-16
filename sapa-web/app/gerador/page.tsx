export const dynamic = 'force-dynamic'

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
  Download,
  Plus,
  X,
  Edit3
} from 'lucide-react'
import Link from 'next/link'
import { FileUpload } from '../../components/file-upload'
import * as XLSX from 'xlsx'
import { fillWordTemplate, gerarNomeArquivo } from '../../lib/gerador'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { supabase } from '../../lib/supabase'

export default function GeradorPage() {
  // ── ESTADOS ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  const [drafts, setDrafts] = useState<Record<number, any>>({}) 
  
  const [professor, setProfessor] = useState('')
  const [escola, setEscola] = useState('')
  const [turma, setTurma] = useState('')
  const [escolasSalvas, setEscolasSalvas] = useState<string[]>([])
  const [novaEscola, setNovaEscola] = useState('')
  const [adicionandoEscola, setAdicionandoEscola] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [wordFile, setWordFile] = useState<File | null>(null)
  const [refFile, setRefFile] = useState<File | null>(null)

  const [abas, setAbas] = useState<string[]>([])
  const [abaSel, setAbaSel] = useState('')
  const [componentes, setComponentes] = useState<string[]>([])
  const [compSel, setCompSel] = useState('')
  const [bimestres, setBimestres] = useState<number[]>([])
  const [bimSel, setBimSel] = useState<number>(1)
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([])
  const [creditosAtuais, setCreditosAtuais] = useState<number>(0)
  const [isFullPlan, setIsFullPlan] = useState(false)

  // ── EFEITOS ────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle()
        if (profile) {
          setProfessor(profile.nome_completo || '')
          setCreditosAtuais(profile.creditos || 0)
          setIsFullPlan(profile.assinatura_ativa === true)
          const lista: string[] = profile.escolas || []
          const padrao = profile.escola_padrao || ''
          let listaFinal = [...lista]
          if (padrao && !listaFinal.includes(padrao)) {
            listaFinal = [padrao, ...listaFinal]
          }
          setEscolasSalvas(listaFinal)
          if (padrao) setEscola(padrao)
          else if (listaFinal.length > 0) setEscola(listaFinal[0])
        }
      }
    }
    loadProfile()
  }, [])

  const salvarEscola = async (nome: string) => {
    if (!nome.trim()) return
    const novaLista = Array.from(new Set([...escolasSalvas, nome.trim()]))
    setEscolasSalvas(novaLista)
    setEscola(nome.trim())
    if (userId) {
      await supabase.from('perfis').update({ escolas: novaLista }).eq('id', userId)
    }
    setAdicionandoEscola(false)
    setNovaEscola('')
  }

  const removerEscola = async (nome: string) => {
    const novaLista = escolasSalvas.filter(e => e !== nome)
    setEscolasSalvas(novaLista)
    if (escola === nome) setEscola(novaLista[0] || '')
    if (userId) {
      await supabase.from('perfis').update({ escolas: novaLista }).eq('id', userId)
    }
  }

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
        const sortedComps = Array.from(comps).sort()
        const sortedBims = Array.from(bims).sort((a,b)=>a-b)
        setAllLessons(lessons)
        setComponentes(sortedComps)
        setBimestres(sortedBims)
        if (sortedComps.length > 0) setCompSel(sortedComps[0])
        if (sortedBims.length > 0) setBimSel(sortedBims[0])
      }
      reader.readAsArrayBuffer(excelFile)
    }
  }, [excelFile, abaSel])

  const handleGenerateDrafts = async () => {
    if (!isFullPlan && creditosAtuais < selectedWeeks.length) {
      alert(`Saldo insuficiente. Você precisa de ${selectedWeeks.length} créditos, mas possui ${creditosAtuais}.`)
      return
    }

    let refBase64: string | undefined
    let refMimeType: string | undefined
    let refText: string | undefined

    setIsGenerating(true)

    if (refFile) {
      try {
        if (refFile.type === 'text/plain') {
          refText = await refFile.text()
        } else {
          if (refFile.size > 15 * 1024 * 1024) {
            setIsGenerating(false)
            alert('Arquivo de referência muito grande. Limite: 15MB.')
            return
          }
          const buffer = await refFile.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          refBase64 = btoa(binary)
          refMimeType = refFile.type
        }
      } catch (e) {
        setIsGenerating(false)
        alert("Erro ao ler o arquivo de referência.")
        return
      }
    }

    try {
      const newDrafts: Record<number, any> = {}
      for (const w of selectedWeeks) {
        const weekLessons = allLessons.filter(l => l.semana === w && l.componente === compSel && l.bimestre === bimSel)
        if (weekLessons.length > 0) {
          const response = await fetch('/api/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessons: weekLessons, refBase64, refMimeType, refText })
          })
          
          if (!response.ok) throw new Error("Falha na API da IA")
          const { content } = await response.json()

          const parse = (tag: string, text: string) => {
            const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
            return match ? match[1].trim() : ""
          }

          newDrafts[w] = {
            desenvolvimento: parse("DESENVOLVIMENTO", content) || content,
            aee: parse("AEE", content),
            exercicios: parse("EXERCICIOS", content)
          }
        }
      }
      setDrafts(newDrafts)
      setStep(5)
    } catch (e: any) {
      alert(e.message || "Erro na geração dos rascunhos.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadWords = async () => {
    setIsGenerating(true)
    const zip = new JSZip()
    const templateBuffer = await wordFile!.arrayBuffer()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      for (const w of selectedWeeks) {
        const weekLessons = allLessons.filter(l => l.semana === w && l.componente === compSel && l.bimestre === bimSel)
        if (weekLessons.length > 0) {
          const draft = drafts[w]
          const fullContent = `<DESENVOLVIMENTO>\n${draft.desenvolvimento}\n</DESENVOLVIMENTO>\n<AEE>\n${draft.aee}\n</AEE>\n<EXERCICIOS>\n${draft.exercicios}\n</EXERCICIOS>`
          const objetivosStr = weekLessons.map((l, i) => `Aula ${i+1}: ${l.obj || l.objetivo}`).join('\n')

          const docBlob = await fillWordTemplate(templateBuffer, {
            escola, professor, turma, componente: compSel, bimestre: bimSel, semana: w, 
            tema: weekLessons[0].tema, objetivos: objetivosStr, natureza: weekLessons[0].natureza || 'Teórica/Prática', 
            desenvolvimento: fullContent
          })
          
          const filename = gerarNomeArquivo(turma, w, compSel)
          zip.file(filename, docBlob)

          if (user) {
            if (!isFullPlan) {
              await supabase.rpc('descontar_creditos', { p_user_id: user.id, p_quantidade: 1 })
              setCreditosAtuais(prev => prev - 1)
            }
            const filePath = `${user.id}/${Date.now()}_${filename}`
            const { error: uploadError } = await supabase.storage.from('planos').upload(filePath, docBlob)
            let publicUrl = ""
            if (!uploadError) {
              const { data: urlData } = supabase.storage.from('planos').getPublicUrl(filePath)
              publicUrl = urlData.publicUrl
            }
            await supabase.from('planos_gerados').insert({
              usuario_id: user.id, professor, escola, turma, componente: compSel, 
              bimestre: bimSel, semana: w, tema: weekLessons[0].tema, arquivo_nome: filename, arquivo_url: publicUrl
            })
          }
        }
      }
      const finalZip = await zip.generateAsync({ type: 'blob' })
      setZipBlob(finalZip)
      setIsFinished(true)
      saveAs(finalZip, `planos_revisados.zip`)
    } catch (e: any) { 
      alert(e.message || "Erro na conversão para Word.") 
    } finally { 
      setIsGenerating(false) 
    }
  }

  const currentWeeks = Array.from(new Set(allLessons.filter(l => l.bimestre === bimSel && l.componente === compSel).map(l => l.semana))).sort((a,b)=>a-b)
  const stepNames = ['Identificação', 'Arquivos Base', 'Configurações', 'Gerar Rascunhos', 'Revisão']
  const progressPercent = Math.round((step / 5) * 100)
  const stepLabel = stepNames[step - 1] ?? ''

  return (
    <div className="min-h-screen pb-12 bg-[#FAF8F3]">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E0D4]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#1C1917]">
            <div className="w-8 h-8 bg-[#C4622D] rounded-lg flex items-center justify-center text-white"><GraduationCap size={18} /></div>
            <h1 className="text-sm md:text-base font-black leading-none uppercase tracking-tighter text-[#1C1917]">SAPA <span className="text-[#C4622D] text-[9px] block">SaaS</span></h1>
          </Link>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/historico" className="text-[10px] font-black uppercase text-[#8C7B70] hover:text-[#C4622D] transition-colors flex items-center gap-1.5 tracking-widest hidden xs:flex"><Layers size={14} /> Histórico</Link>
            <div className="flex flex-col items-end gap-1 min-w-[160px]">
              <div className="flex justify-between items-center w-full">
                <span className="text-[9px] font-black text-[#C4622D] uppercase tracking-widest">
                  Passo {step} de 5 · {stepLabel}
                </span>
                <span className="text-[9px] font-black text-[#8C7B70]">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E8E0D4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C4622D] rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-24 md:pt-28 w-full">
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest bg-[#C4622D]/10 px-2 py-0.5 rounded">Passo 01</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-tight">Identificação</h2>
            </header>
            <div className="bg-white rounded-[32px] border border-[#E8E0D4] p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 shadow-sm">
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Professor</label><input value={professor} onChange={e=>setProfessor(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all" placeholder="Seu nome completo" /></div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Escola</label>
                {escolasSalvas.length > 0 && !adicionandoEscola ? (
                  <div className="space-y-3">
                    <select value={escola} onChange={e => setEscola(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D] transition-all">
                      {escolasSalvas.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      {escolasSalvas.map(e => (
                        <span key={e} className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1.5 rounded-lg cursor-pointer transition-all uppercase tracking-tight ${escola === e ? 'bg-[#C4622D] text-white' : 'bg-[#E8E0D4] text-[#8C7B70]'}`}>
                          {e}
                          <X size={10} onClick={ev => { ev.stopPropagation(); removerEscola(e) }} />
                        </span>
                      ))}
                      <button onClick={() => setAdicionandoEscola(true)} className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-[#C4622D]/10 text-[#C4622D] uppercase tracking-tight">+ Nova</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      autoFocus value={adicionandoEscola ? novaEscola : escola}
                      onChange={e => adicionandoEscola ? setNovaEscola(e.target.value) : setEscola(e.target.value)}
                      className="flex-1 p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all"
                      placeholder="Nome da instituição"
                    />
                    {adicionandoEscola && (
                      <button onClick={() => salvarEscola(novaEscola)} className="px-4 bg-[#C4622D] text-white rounded-xl"><Plus size={20}/></button>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Turma</label><input value={turma} onChange={e=>setTurma(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] focus:border-[#C4622D] focus:bg-white outline-none text-sm font-bold text-[#1C1917] transition-all" placeholder="Ex: 3º Ano Ensino Médio - TI" /></div>
            </div>
            <div className="flex justify-end"><button onClick={()=>setStep(2)} disabled={!professor||!escola} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20">Continuar <ArrowRight size={16} className="inline ml-2" /></button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest bg-[#C4622D]/10 px-2 py-0.5 rounded">Passo 02</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-tight">Arquivos Base</h2>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              <FileUpload label={"Escopo\nSequência"} description=".xlsx" accept={{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}} file={excelFile} onFileSelect={setExcelFile} color="terra" />
              <FileUpload label="Modelo de Plano de Aula" description=".docx" accept={{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}} file={wordFile} onFileSelect={setWordFile} color="gold" />
              <FileUpload label="Material Digital" description="PDF ou TXT · opcional" accept={{'application/pdf':['.pdf'],'text/plain':['.txt']}} file={refFile} onFileSelect={setRefFile} color="sage" />
            </div>
            <div className="bg-[#F2EEE6] border border-[#E8E0D4] rounded-2xl p-4 text-sm text-[#8C7B70] leading-relaxed space-y-1">
              <p><span className="font-black text-[#1C1917]">Escopo:</span> planilha .xlsx com componentes curriculares e semanas</p>
              <p><span className="font-black text-[#1C1917]">Modelo:</span> seu arquivo .docx com o layout oficial da escola</p>
              <p><span className="font-black text-[#8C7B70]">Referência:</span> ementa ou apostila em PDF/TXT — opcional</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 md:mt-10">
              <button onClick={()=>setStep(1)} className="w-full md:w-auto px-8 py-3 border-2 border-[#E8E0D4] rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:bg-[#F2EEE6] transition-all">Voltar</button>
              <button onClick={()=>setStep(3)} disabled={!excelFile||!wordFile} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20">Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest bg-[#C4622D]/10 px-2 py-0.5 rounded">Passo 03</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-tight">Configurações</h2>
            </header>
            <div className="bg-white rounded-[32px] border border-[#E8E0D4] p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 shadow-sm">
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Aba do Excel</label><select value={abaSel} onChange={e=>setAbaSel(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{abas.map(a=><option key={a}>{a}</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Bimestre</label><select value={bimSel} onChange={e=>setBimSel(Number(e.target.value))} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{bimestres.map(b=><option key={b} value={b}>{b}º Bimestre</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Matéria</label><select value={compSel} onChange={e=>setCompSel(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{componentes.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="md:col-span-3 pt-6 border-t border-[#E8E0D4] mt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentWeeks.map(w=><div key={w} onClick={()=>setSelectedWeeks(prev=>prev.includes(w)?prev.filter(x=>x!==w):[...prev,w])} className={`p-4 border-2 rounded-2xl cursor-pointer text-xs font-black transition-all text-center flex flex-col items-center gap-1 ${selectedWeeks.includes(w)?'border-[#C4622D] bg-[#C4622D] text-white':'border-[#E8E0D4] bg-white text-[#8C7B70]'}`}><span className="text-[9px] opacity-60 uppercase tracking-tighter">Semana</span><span className="text-lg leading-none">{w}</span></div>)}
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
              <button onClick={()=>setStep(2)} className="w-full md:w-auto px-8 py-3 border-2 border-[#E8E0D4] rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:bg-[#F2EEE6]">Voltar</button>
              <button onClick={()=>setStep(4)} disabled={selectedWeeks.length===0} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20">Próximo Passo</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-12 flex flex-col items-center animate-fade-up">
            <div className="w-28 h-28 bg-[#C4622D] rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-[#C4622D]/30 mb-10 rotate-6"><Sparkles size={44} strokeWidth={2.5} /></div>
            <h2 className="text-3xl md:text-4xl font-black mb-3 text-[#1C1917] tracking-tight text-center uppercase">Gerar Rascunhos</h2>
            <p className="text-[#8C7B70] text-sm md:text-base mb-12 max-w-sm font-medium leading-relaxed text-center uppercase tracking-tight">A IA escreverá o conteúdo pedagógico de cada aula agora.</p>
            {refFile && <div className="flex items-center gap-3 bg-[#5A7A5A]/10 border border-[#5A7A5A]/20 rounded-2xl px-6 py-3 mb-10 text-[11px] font-black text-[#5A7A5A] uppercase tracking-widest">Referência Ativa: {refFile.name}</div>}
            <button onClick={handleGenerateDrafts} disabled={isGenerating} className="w-full max-w-sm py-5 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#C4622D]/20 flex items-center justify-center gap-3">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Geração Grátis"}
            </button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-fade-up pb-32">
            <header className="mb-8">
              <span className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest bg-[#C4622D]/10 px-2 py-0.5 rounded">Passo 05</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-tight">Revisão</h2>
            </header>
            <div className="space-y-10">
              {selectedWeeks.map(w => (
                <div key={w} className="bg-white rounded-[32px] border border-[#E8E0D4] p-5 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#E8E0D4] pb-4">
                    <h3 className="text-base font-black text-[#1C1917] uppercase tracking-widest">Semana {w}</h3>
                    <span className="text-[10px] font-black text-[#8C7B70] bg-[#F2EEE6] px-3 py-1 rounded-full uppercase">Rascunho</span>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Desenvolvimento</label>
                    <textarea value={drafts[w]?.desenvolvimento || ''} onChange={(e) => setDrafts(prev => ({ ...prev, [w]: { ...prev[w], desenvolvimento: e.target.value } }))} className="w-full p-5 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-sm leading-relaxed text-[#1C1917] outline-none focus:border-[#C4622D] min-h-[300px] font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Adaptação AEE</label><textarea value={drafts[w]?.aee || ''} onChange={(e) => setDrafts(prev => ({ ...prev, [w]: { ...prev[w], aee: e.target.value } }))} className="w-full p-5 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-sm leading-relaxed text-[#1C1917] outline-none focus:border-[#C4622D] min-h-[150px] font-medium" /></div>
                    <div className="space-y-2.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Exercícios</label><textarea value={drafts[w]?.exercicios || ''} onChange={(e) => setDrafts(prev => ({ ...prev, [w]: { ...prev[w], exercicios: e.target.value } }))} className="w-full p-5 rounded-2xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-sm leading-relaxed text-[#1C1917] outline-none focus:border-[#C4622D] min-h-[150px] font-medium" /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-[#E8E0D4] p-4 md:p-6 flex justify-center z-50">
              <div className="max-w-3xl w-full flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={()=>setStep(4)} className="w-full md:w-auto px-8 py-3 rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:text-[#C4622D] transition-all">Refazer</button>
                {isFinished ? (
                  <button onClick={()=>saveAs(zipBlob!, 'planos.zip')} className="w-full md:w-auto px-10 py-4 bg-[#5A7A5A] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#5A7A5A]/20 flex items-center justify-center gap-2"><Download size={18}/> Baixar ZIP</button>
                ) : (
                  <button onClick={handleDownloadWords} disabled={isGenerating} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20 flex items-center justify-center gap-2">{isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />} Exportar Word</button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
