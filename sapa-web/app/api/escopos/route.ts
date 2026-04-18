import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cria cliente autenticado com o token do usuário (para RLS funcionar)
function getSupabase(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID necessário' }, { status: 400 })
    }

    const supabase = getSupabase(req)
    const { data: escopos, error } = await supabase
      .from('escopos')
      .select('id, nome, arquivo_original, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ escopos })
  } catch (error: any) {
    console.error('Erro ao listar escopos:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, nome, arquivoOriginal, aulas } = body

    if (!userId || !nome || !aulas) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const supabase = getSupabase(req)

    const { data: escopo, error: errorEscopo } = await supabase
      .from('escopos')
      .insert({
        user_id: userId,
        nome,
        arquivo_original: arquivoOriginal
      })
      .select()
      .single()

    if (errorEscopo) throw errorEscopo

    const aulasFlat: any[] = Array.isArray(aulas) ? aulas : []
    const aulasInsert = aulasFlat.map((a: any) => ({
      escopo_id: escopo.id,
      bimestre: a.bimestre ?? 1,
      semana: a.semana,
      componente: a.componente,
      titulo: a.titulo || '',
      objetivo: a.obj || a.objetivo || '',
      habilidades: a.hab || a.habilidades || '',
      tema: a.tema || ''
    }))

    if (aulasInsert.length > 0) {
      const { error: errorAulas } = await supabase
        .from('escopo_aulas')
        .insert(aulasInsert)

      if (errorAulas) throw errorAulas
    }

    return NextResponse.json({ escopo, totalAulas: aulasInsert.length })
  } catch (error: any) {
    console.error('Erro ao salvar escopo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const escopoId = searchParams.get('id')

    if (!escopoId) {
      return NextResponse.json({ error: 'ID do escopo necessário' }, { status: 400 })
    }

    const supabase = getSupabase(req)
    const { error } = await supabase
      .from('escopos')
      .delete()
      .eq('id', escopoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao excluir escopo:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
