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
import { gerarComTemplate, TEMPLATES_INFO, type TemplateId } from '../../lib/templates-docx'
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
  const [refFiles, setRefFiles] = useState<(File | null)[]>([null, null, null, null, null])
  const [templateSelecionado, setTemplateSelecionado] = useState<TemplateId | null>('classico')

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
  const [profileData, setProfileData] = useState<any>(null)

  // Escopos salvos
  const [escopos, setEscopos] = useState<any[]>([])
  const [escopoSel, setEscopoSel] = useState<any>(null)
  const [modoEscopo, setModoEscopo] = useState<'upload' | 'salvo'>('upload')

  // Debug de parsing
  const [debugInfo, setDebugInfo] = useState<{ cols: Record<string, string>, totalLinhas: number, semanasRaw: number[] } | null>(null)

  // ── EFEITOS ────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle()
        const { count: totalPlanos } = await supabase.from('planos_gerados').select('*', { count: 'exact', head: true }).eq('usuario_id', user.id)
        if (profile) {
          setProfileData({ ...profile, totalPlanos: totalPlanos ?? 0 })
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
    loadEscopos()
  }, [])

  const loadEscopos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!user) return
      const res = await fetch(`/api/escopos?userId=${user.id}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      })
      if (!res.ok) throw new Error('Falha ao carregar escopos')
      const data = await res.json()
      if (data.escopos) setEscopos(data.escopos)
    } catch (err) {
      console.error('Erro ao carregar escopos:', err)
      setEscopos([])
    }
  }

  const [salvandoEscopo, setSalvandoEscopo] = useState(false)
  const [nomeEscopo, setNomeEscopo] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const salvarEscopo = async () => {
    const nome = nomeEscopo.trim() || excelFile?.name?.replace('.xlsx', '') || 'Escopo'
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()
    if (!user || allLessons.length === 0) return
    setSalvandoEscopo(true)
    try {
      const res = await fetch('/api/escopos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          userId: user.id,
          nome,
          arquivoOriginal: excelFile?.name || 'Escopo Sequência',
          aulas: allLessons
        })
      })
      const result = await res.json()
      if (result.escopo) {
        await loadEscopos()
        setNomeEscopo('')
        showToast(`Escopo salvo com ${result.totalAulas} aulas!`)
      } else {
        showToast('Erro ao salvar: ' + (result.error || 'desconhecido'), false)
      }
    } finally {
      setSalvandoEscopo(false)
    }
  }

  const usarEscopoSalvo = async (escopo: any) => {
    setEscopoSel(escopo)
    setSelectedWeeks([])
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`/api/escopos/aulas?escopoId=${escopo.id}`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
    })
    const data = await res.json()
    if (data.aulas && data.aulas.length > 0) {
      setAllLessons(data.aulas)
      const comps = Array.from(new Set<string>(data.aulas.map((a: any) => a.componente).filter(Boolean))).sort()
      const bims = Array.from(new Set<number>(data.aulas.map((a: any) => a.bimestre).filter(Boolean))).sort((a, b) => a - b)
      setComponentes(comps)
      setBimestres(bims)
      if (comps.length > 0) setCompSel(comps[0])
      if (bims.length > 0) setBimSel(bims[0])
      setModoEscopo('salvo')
    } else {
      showToast('Erro ao carregar escopo. Tente novamente.', false)
    }
  }

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
    setSelectedWeeks([])
  }, [bimSel, compSel, abaSel])

  // Ao entrar no passo 2, se houver escopos salvos mostra-os por padrão
  useEffect(() => {
    if (step === 2 && escopos.length > 0) setModoEscopo('salvo')
    if (step === 2 && escopos.length === 0) setModoEscopo('upload')
  }, [step, escopos.length])

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
        const json = XLSX.utils.sheet_to_json(wb.Sheets[abaSel]) as any[]
        const comps = new Set<string>(); const bims = new Set<number>(); const lessons: any[] = []

        if (json.length === 0) return

        // Helper para extrair número de textos como "1º", "2ª semana", etc.
        const extrairNumero = (val: any) => {
          if (typeof val === 'number') return val
          if (!val) return NaN
          const match = String(val).match(/\d+/)
          return match ? parseInt(match[0]) : NaN
        }

        // Detecta a linha de cabeçalho real (pode não ser a linha 0 se houver títulos antes)
        const findHeaderRow = () => {
          for (let i = 0; i < Math.min(json.length, 10); i++) {
            const keys = Object.keys(json[i] || {})
            const hasSemanaBim = keys.some(k => k.toLowerCase().includes('semana') || k.toLowerCase().includes('bimestre'))
            if (hasSemanaBim) return json[i]
          }
          return json[0] || {}
        }
        const headers = findHeaderRow()
        const headerKeys = Object.keys(headers)
        const findCol = (patterns: string[]) => headerKeys.find(k => patterns.some(p => k.toLowerCase().includes(p))) || null

        const colBimestre = findCol(['bimestre', 'bim']) || 'Bimestre'
        const colComponente = findCol(['componente', 'unidade curricular', 'disciplina', 'matéria', 'materia']) || 'Nome do componente'
        // Usa word-boundary para não capturar "semanais" (qtd. de aulas/semana)
        const colSemana = headerKeys.find(k => /\bsemana\b/i.test(k)) || 'Semana'
        const colTema = findCol(['tema', 'conteúdo', 'conteudo', 'unidade']) || 'Tema da semana'
        const colTitulo = findCol(['título', 'titulo', 'nome da aula']) || 'Título da aula'
        const colObj = findCol(['objetivo']) || 'Objetivos da aula'
        const colHab = findCol(['habilidade']) || 'Habilidades técnicas'

        // Inicia lastBim como 1 (padrão) para evitar perda de linhas sem bimestre explícito
        let lastBim: number = 1
        let lastComp: string | null = null
        let lastSemana: number | null = null  // fill-forward para semana

        json.forEach((row: any) => {
          const bRaw = extrairNumero(row[colBimestre])
          const wRaw = extrairNumero(row[colSemana])

          // Fill-forward: bimestre e semana herdam o valor da linha anterior se vazio
          const b = !isNaN(bRaw) ? bRaw : lastBim
          lastBim = b

          const w = !isNaN(wRaw) ? wRaw : lastSemana
          if (w !== null) lastSemana = w

          let m = (row[colComponente] || row['Unidade curricular'] || row['Componente Curricular'] || '').toString().trim()
          if (m.length > 100) m = '' // Evita textos gigantes acidentais

          // Fill-forward: componente herda o valor da linha anterior se vazio
          const currentComp = m || lastComp
          if (currentComp) lastComp = currentComp

          // Linha inválida: sem semana ou sem componente
          if (w === null || !currentComp) return

          bims.add(b)
          comps.add(currentComp)

          lessons.push({
            bimestre: b,
            semana: w!,
            componente: currentComp,
            titulo: row[colTitulo] || '',
            obj: row[colObj] || '',
            hab: row[colHab] || '',
            tema: row[colTema] || ''
          })
        })
        const sortedComps = Array.from(comps).sort()
        const sortedBims = Array.from(bims).sort((a,b)=>a-b)
        setAllLessons(lessons)
        setComponentes(sortedComps)
        setBimestres(sortedBims)
        if (sortedComps.length > 0) setCompSel(sortedComps[0])
        if (sortedBims.length > 0) setBimSel(sortedBims[0])

        // Debug: salva info de parsing para diagnóstico
        const semanasRaw = json.map((r: any) => {
          const v = r[colSemana]
          if (typeof v === 'number') return v
          if (!v) return null
          const m = String(v).match(/\d+/)
          return m ? parseInt(m[0]) : null
        }).filter((v): v is number => v !== null)
        setDebugInfo({
          cols: { Bimestre: colBimestre, Componente: colComponente, Semana: colSemana, Tema: colTema },
          totalLinhas: json.length,
          semanasRaw: Array.from(new Set(semanasRaw)).sort((a,b)=>a-b)
        })
      }
      reader.readAsArrayBuffer(excelFile)
    }
  }, [excelFile, abaSel])

  const handleGenerateDrafts = async () => {
    // Verifica se usuário free precisa contratar
    if (!isFullPlan && profileData && profileData.plano_inicial_usado) {
      alert(`Você usou seus 3 planos gratuitos. Assine um plano para continuar!`)
      window.location.href = '/planos'
      return
    }

    if (!isFullPlan && creditosAtuais < selectedWeeks.length && !profileData?.plano_inicial_usado) {
      alert(`Saldo insuficiente. Você precisa de ${selectedWeeks.length} créditos, mas possui ${creditosAtuais}.`)
      return
    }

    let refBase64: string | undefined
    let refMimeType: string | undefined
    let refText: string | undefined

    setIsGenerating(true)

    const activeRefFiles = refFiles.filter(Boolean) as File[]
    if (activeRefFiles.length > 0) {
      try {
        const textParts: string[] = []
        let firstPdf: File | null = null
        for (let i = 0; i < activeRefFiles.length; i++) {
          const f = activeRefFiles[i]
          if (f.type === 'text/plain') {
            textParts.push(`[Material Aula ${i + 1}]\n` + await f.text())
          } else if (!firstPdf) {
            if (f.size > 15 * 1024 * 1024) {
              setIsGenerating(false)
              alert(`Arquivo de referência ${i + 1} muito grande. Limite: 15MB.`)
              return
            }
            firstPdf = f
          }
        }
        if (textParts.length > 0) refText = textParts.join('\n\n')
        if (firstPdf) {
          const buffer = await firstPdf.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
          refBase64 = btoa(binary)
          refMimeType = firstPdf.type
        }
      } catch (e) {
        setIsGenerating(false)
        alert("Erro ao ler os arquivos de referência.")
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
    const templateBuffer = wordFile ? await wordFile.arrayBuffer() : null
    const { data: { user } } = await supabase.auth.getUser()

    try {
      for (const w of selectedWeeks) {
        const weekLessons = allLessons.filter(l => l.semana === w && l.componente === compSel && l.bimestre === bimSel)
        if (weekLessons.length > 0) {
          const draft = drafts[w]
          const fullContent = `<DESENVOLVIMENTO>\n${draft.desenvolvimento}\n</DESENVOLVIMENTO>\n<AEE>\n${draft.aee}\n</AEE>\n<EXERCICIOS>\n${draft.exercicios}\n</EXERCICIOS>`
          const objetivosStr = weekLessons.map((l, i) => `Aula ${i+1}: ${l.obj || l.objetivo}`).join('\n')

          let docBlob: Blob

          if (templateBuffer) {
            // Usa template Word do usuário (fluxo original)
            docBlob = await fillWordTemplate(templateBuffer, {
              escola, professor, turma, componente: compSel, bimestre: bimSel, semana: w,
              tema: weekLessons[0].tema, objetivos: objetivosStr, natureza: weekLessons[0].natureza || 'Teórica/Prática',
              desenvolvimento: fullContent
            })
          } else {
            // Usa template premium embutido
            const { desenvolvimento, aee, exercicios } = draft
            docBlob = await gerarComTemplate(templateSelecionado!, {
              escola, professor, turma, componente: compSel, bimestre: bimSel, semana: w,
              tema: weekLessons[0].tema, objetivos: objetivosStr, natureza: weekLessons[0].natureza || 'Teórica/Prática',
              desenvolvimento, aee, exercicios
            })
          }
          
          const filename = gerarNomeArquivo(turma, w, compSel)
          zip.file(filename, docBlob)

          if (user) {
            if (!isFullPlan) {
              // Marca como usado se for o plano inicial free
              if (profileData && !profileData.plano_inicial_usado && creditosAtuais > 0) {
                await supabase.from('perfis').update({ plano_inicial_usado: true }).eq('id', user.id)
                setProfileData({ ...profileData, plano_inicial_usado: true })
              } else if (creditosAtuais > 0) {
                await supabase.rpc('descontar_creditos', { p_user_id: user.id, p_quantidade: 1 })
                setCreditosAtuais(prev => prev - 1)
              }
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

  const currentWeeks = Array.from(new Set(allLessons.filter(l => l.bimestre === bimSel).map(l => l.semana))).sort((a,b)=>a-b)
  const stepNames = ['Identificação', 'Arquivos Base', 'Configurações', 'Gerar Rascunhos', 'Revisão']
  const progressPercent = Math.round((step / 5) * 100)
  const stepLabel = stepNames[step - 1] ?? ''

  return (
    <div className="min-h-screen pb-12 bg-[#FAF8F3]">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E0D4]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-[#1C1917]">
            <div className="w-8 h-8 bg-[#C4622D] rounded-lg flex items-center justify-center text-white"><GraduationCap size={18} /></div>
            <h1 className="text-sm md:text-base font-black leading-none uppercase tracking-tighter text-[#1C1917]">ProsperAula <span className="text-[#C4622D] text-[9px] block">Inteligência Artificial</span></h1>
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

            {/* Seletor de Templates Premium */}
            <div className="bg-white rounded-[28px] border border-[#E8E0D4] p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest">Templates Premium</p>
                  <p className="text-sm font-black text-[#1C1917] mt-0.5">Escolha o layout do seu plano de aula</p>
                </div>
                {wordFile && (
                  <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase tracking-wide">Usando seu .docx</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {TEMPLATES_INFO.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { setTemplateSelecionado(t.id); setWordFile(null) }}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                      templateSelecionado === t.id && !wordFile
                        ? 'border-[#C4622D] bg-[#C4622D]/[0.03] shadow-md shadow-[#C4622D]/10'
                        : 'border-[#E8E0D4] bg-[#FAFAF8] hover:border-[#C4622D]/40'
                    }`}
                  >
                    {/* Preview de cor */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ background: t.preview }} />
                      <div className="w-3 h-3 rounded-full border-2 border-white shadow" style={{ background: t.previewAlt }} />
                      {templateSelecionado === t.id && !wordFile && (
                        <CheckCircle size={14} className="ml-auto text-[#C4622D]" strokeWidth={3} />
                      )}
                    </div>
                    {/* Preview visual miniaturo */}
                    <div className="w-full h-16 rounded-lg mb-3 overflow-hidden border border-[#E8E0D4]">
                      {t.id === 'classico' && (
                        <div className="h-full flex flex-col">
                          <div className="h-4 w-full" style={{ background: t.preview }} />
                          <div className="flex-1 p-1 space-y-1">
                            <div className="h-1.5 w-3/4 rounded" style={{ background: t.previewAlt, opacity: 0.6 }} />
                            <div className="h-1 w-full rounded bg-[#E8E0D4]" />
                            <div className="h-1 w-5/6 rounded bg-[#E8E0D4]" />
                            <div className="h-1 w-4/5 rounded bg-[#E8E0D4]" />
                          </div>
                        </div>
                      )}
                      {t.id === 'contemporaneo' && (
                        <div className="h-full flex flex-col">
                          <div className="h-3 w-full" style={{ background: t.preview }} />
                          <div className="flex-1 p-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-3 rounded" style={{ background: t.preview }} />
                              <div className="h-1.5 w-2/3 rounded" style={{ background: '#E8E0D4' }} />
                            </div>
                            <div className="h-1 w-full rounded" style={{ background: t.previewAlt }} />
                            <div className="h-1 w-5/6 rounded" style={{ background: t.previewAlt }} />
                          </div>
                        </div>
                      )}
                      {t.id === 'minimalista' && (
                        <div className="h-full p-1.5 space-y-1">
                          <div className="h-1.5 w-full rounded border-b border-[#DDDDDD]" style={{ background: t.previewAlt }} />
                          <div className="h-1 w-3/4 rounded bg-[#DDDDDD]" />
                          <div className="h-1 w-full rounded bg-[#EEEEEE]" />
                          <div className="h-1 w-5/6 rounded bg-[#EEEEEE]" />
                          <div className="h-1 w-4/5 rounded bg-[#EEEEEE]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-black text-[#1C1917] uppercase tracking-tight">{t.nome}</p>
                    <p className="text-[10px] text-[#8C7B70] mt-0.5 leading-snug font-medium">{t.descricao}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#8C7B70] font-medium">
                Ou faça upload do seu próprio modelo .docx abaixo — ele substituirá o template selecionado.
              </p>
            </div>

            {/* ── Escopos Salvos: aparece em destaque se existirem ── */}
            {escopos.length > 0 && (
              <div className="bg-white border-2 border-[#C4622D]/30 rounded-[28px] p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest">Escopos Salvos</p>
                    <p className="text-sm font-black text-[#1C1917] mt-0.5">Use um escopo anterior — sem precisar fazer upload</p>
                  </div>
                  <span className="text-[10px] font-black bg-[#C4622D]/10 text-[#C4622D] px-3 py-1 rounded-full uppercase tracking-widest">{escopos.length} salvo{escopos.length > 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {escopos.map(e => (
                    <div key={e.id} onClick={() => usarEscopoSalvo(e)}
                      className={`group p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 ${escopoSel?.id === e.id ? 'border-[#C4622D] bg-[#FDF9F6]' : 'border-[#E8E0D4] bg-white hover:border-[#C4622D] hover:bg-[#FDF9F6]'}`}>
                      <div>
                        <p className={`text-xs font-black transition-colors ${escopoSel?.id === e.id ? 'text-[#C4622D]' : 'text-[#1C1917] group-hover:text-[#C4622D]'}`}>{e.nome}</p>
                        <p className="text-[10px] text-[#8C7B70] mt-0.5">{new Date(e.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <ArrowRight size={16} className={`text-[#C4622D] flex-shrink-0 transition-opacity ${escopoSel?.id === e.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </div>
                  ))}
                </div>

                {/* Materiais por aula — aparece após selecionar um escopo */}
                {escopoSel && (
                  <div className="border-t border-[#E8E0D4] pt-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#5A7A5A] tracking-widest">Materiais de Aula</p>
                      <p className="text-xs text-[#8C7B70] font-medium mt-0.5">Adicione até 5 materiais (PDF ou TXT) — um por aula da semana</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[0, 1, 2, 3, 4].map(i => (
                        <FileUpload
                          key={i}
                          label={`Material Aula ${i + 1}`}
                          description="PDF ou TXT · opcional"
                          accept={{'application/pdf':['.pdf'],'text/plain':['.txt']}}
                          file={refFiles[i]}
                          onFileSelect={(f) => {
                            const next = [...refFiles]
                            next[i] = f
                            setRefFiles(next)
                          }}
                          color="sage"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setModoEscopo('upload')}
                  className="w-full text-center text-[10px] font-black text-[#8C7B70] uppercase tracking-widest hover:text-[#C4622D] transition-colors pt-1">
                  + Usar um escopo diferente (upload)
                </button>

                {/* Botões de navegação no modo salvo */}
                {escopoSel && (
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
                    <button onClick={() => setStep(1)} className="w-full md:w-auto px-8 py-3 border-2 border-[#E8E0D4] rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:bg-[#F2EEE6] transition-all">Voltar</button>
                    <button onClick={() => setStep(3)} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20">Continuar</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Upload: aparece sempre se não tem escopos, ou se o usuário clicou em "upload" ── */}
            {(escopos.length === 0 || modoEscopo === 'upload') && (
              <>
                {escopos.length > 0 && (
                  <button onClick={() => setModoEscopo('salvo')}
                    className="text-[10px] font-black text-[#8C7B70] uppercase tracking-widest hover:text-[#C4622D] transition-colors flex items-center gap-1">
                    ← Voltar aos escopos salvos
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                  <FileUpload label={"Escopo\nSequência"} description=".xlsx" accept={{'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}} file={excelFile} onFileSelect={setExcelFile} color="terra" />
                  <FileUpload
                    label="Seu Modelo .docx"
                    description="opcional · substitui template"
                    accept={{'application/vnd.openxmlformats-officedocument.wordprocessingml.document':['.docx']}}
                    file={wordFile}
                    onFileSelect={(f) => { setWordFile(f); if (f) setTemplateSelecionado(null) }}
                    color="gold"
                  />
                  <FileUpload label="Material Aula 1" description="PDF ou TXT · opcional" accept={{'application/pdf':['.pdf'],'text/plain':['.txt']}} file={refFiles[0]} onFileSelect={(f) => { const next = [...refFiles]; next[0] = f; setRefFiles(next) }} color="sage" />
                </div>
                {/* Materiais adicionais aulas 2-5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <FileUpload
                      key={i}
                      label={`Material Aula ${i + 1}`}
                      description="PDF ou TXT · opcional"
                      accept={{'application/pdf':['.pdf'],'text/plain':['.txt']}}
                      file={refFiles[i]}
                      onFileSelect={(f) => { const next = [...refFiles]; next[i] = f; setRefFiles(next) }}
                      color="sage"
                    />
                  ))}
                </div>
                <div className="bg-[#F2EEE6] border border-[#E8E0D4] rounded-2xl p-4 text-sm text-[#8C7B70] leading-relaxed space-y-1">
                  <p><span className="font-black text-[#1C1917]">Escopo:</span> planilha .xlsx com componentes curriculares e semanas</p>
                  <p><span className="font-black text-[#1C1917]">Template:</span> escolha um premium acima ou faça upload do .docx da escola</p>
                  <p><span className="font-black text-[#8C7B70]">Materiais:</span> até 5 PDFs ou TXTs — um por aula da semana, todos opcionais</p>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 md:mt-10">
                  <button onClick={()=>setStep(1)} className="w-full md:w-auto px-8 py-3 border-2 border-[#E8E0D4] rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:bg-[#F2EEE6] transition-all">Voltar</button>
                  <button onClick={()=>setStep(3)} disabled={!excelFile || (!wordFile && !templateSelecionado)} className="w-full md:w-auto px-10 py-4 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-[#C4622D]/20 disabled:opacity-40">Continuar</button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <header className="mb-6">
              <span className="text-[10px] font-black uppercase text-[#C4622D] tracking-widest bg-[#C4622D]/10 px-2 py-0.5 rounded">Passo 03</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#1C1917] tracking-tight">Configurações</h2>
            </header>
            <div className="bg-white rounded-[32px] border border-[#E8E0D4] p-5 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 shadow-sm">
              {modoEscopo === 'upload' && <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Aba do Excel</label><select value={abaSel} onChange={e=>setAbaSel(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{abas.map(a=><option key={a}>{a}</option>)}</select></div>}
              {modoEscopo === 'salvo' && <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Escopo</label><div className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] truncate">{escopoSel?.nome || '—'}</div></div>}
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Bimestre</label><select value={bimSel} onChange={e=>setBimSel(Number(e.target.value))} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{bimestres.map(b=><option key={b} value={b}>{b}º Bimestre</option>)}</select></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest ml-1">Matéria</label><select value={compSel} onChange={e=>setCompSel(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E8E0D4] bg-[#F2EEE6] text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]">{componentes.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="md:col-span-3 pt-6 border-t border-[#E8E0D4] mt-2">
                {debugInfo && (
                  <details className="mb-4 text-[10px] bg-[#F2EEE6] rounded-xl p-3 cursor-pointer">
                    <summary className="font-black text-[#8C7B70] uppercase tracking-widest">Diagnóstico do Excel ({debugInfo.totalLinhas} linhas lidas)</summary>
                    <div className="mt-2 space-y-1 text-[#5A5A5A]">
                      <p><b>Col. Bimestre:</b> "{debugInfo.cols.Bimestre}" · <b>Col. Semana:</b> "{debugInfo.cols.Semana}"</p>
                      <p><b>Col. Componente:</b> "{debugInfo.cols.Componente}" · <b>Col. Tema:</b> "{debugInfo.cols.Tema}"</p>
                      <p><b>Semanas encontradas na coluna:</b> {debugInfo.semanasRaw.length > 0 ? debugInfo.semanasRaw.join(', ') : '— nenhuma'}</p>
                      <p><b>Aulas parseadas (total):</b> {allLessons.length} · <b>Neste bimestre:</b> {allLessons.filter(l=>l.bimestre===bimSel).length}</p>
                    </div>
                  </details>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentWeeks.map(w=><div key={w} onClick={()=>setSelectedWeeks(prev=>prev.includes(w)?prev.filter(x=>x!==w):[...prev,w])} className={`p-4 border-2 rounded-2xl cursor-pointer text-xs font-black transition-all text-center flex flex-col items-center gap-1 ${selectedWeeks.includes(w)?'border-[#C4622D] bg-[#C4622D] text-white':'border-[#E8E0D4] bg-white text-[#8C7B70]'}`}><span className="text-[9px] opacity-60 uppercase tracking-tighter">Semana</span><span className="text-lg leading-none">{w}</span></div>)}
                </div>
              </div>
            </div>
            {/* Salvar Escopo — só mostra se veio de upload (não de escopo já salvo) */}
            {modoEscopo === 'upload' && allLessons.length > 0 && (
              <div className="bg-[#F2EEE6] border border-[#E8E0D4] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex-1 space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-[#8C7B70] tracking-widest">Salvar Escopo para uso futuro</p>
                  <p className="text-[10px] text-[#B5A89A]">{allLessons.length} aulas carregadas · apenas você verá este escopo</p>
                </div>
                <input
                  value={nomeEscopo}
                  onChange={e => setNomeEscopo(e.target.value)}
                  placeholder={excelFile?.name?.replace('.xlsx','') || 'Nome do escopo'}
                  className="flex-1 p-2.5 rounded-xl border-2 border-[#E8E0D4] bg-white text-xs font-bold text-[#1C1917] outline-none focus:border-[#C4622D]"
                />
                <button
                  onClick={salvarEscopo}
                  disabled={salvandoEscopo}
                  className="px-5 py-2.5 bg-[#1C1917] text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-40 flex items-center gap-2"
                >
                  {salvandoEscopo ? <Loader2 size={14} className="animate-spin" /> : null}
                  Salvar
                </button>
              </div>
            )}
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
            {refFiles.filter(Boolean).length > 0 && (
              <div className="flex items-center gap-3 bg-[#5A7A5A]/10 border border-[#5A7A5A]/20 rounded-2xl px-6 py-3 mb-10 text-[11px] font-black text-[#5A7A5A] uppercase tracking-widest">
                {refFiles.filter(Boolean).length} material{refFiles.filter(Boolean).length > 1 ? 'is' : ''} ativo{refFiles.filter(Boolean).length > 1 ? 's' : ''}
              </div>
            )}
            <button onClick={handleGenerateDrafts} disabled={isGenerating} className="w-full max-w-sm py-5 bg-[#C4622D] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#C4622D]/20 flex items-center justify-center gap-3">
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : (profileData?.totalPlanos === 0 ? "Iniciar Geração Grátis" : "Gerar Plano de Aula")}
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
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <button onClick={()=>setStep(4)} className="w-full md:w-auto px-8 py-3 rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:text-[#C4622D] transition-all">Refazer</button>
                  <Link href="/" className="w-full md:w-auto">
                    <button className="w-full px-8 py-3 border-2 border-[#E8E0D4] rounded-xl text-xs font-black text-[#8C7B70] uppercase tracking-widest hover:bg-[#F2EEE6] transition-all flex items-center justify-center gap-2">
                      <ArrowLeft size={14} /> Início
                    </button>
                  </Link>
                </div>
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

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all animate-fade-up ${toast.ok ? 'bg-[#5A7A5A]' : 'bg-red-600'}`}>
          {toast.ok ? <CheckCircle size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}
