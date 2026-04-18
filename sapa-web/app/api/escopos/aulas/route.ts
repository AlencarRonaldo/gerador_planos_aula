import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function getSupabase(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const escopoId = searchParams.get('escopoId')
    const componente = searchParams.get('componente')
    const bimestre = searchParams.get('bimestre')

    if (!escopoId) {
      return NextResponse.json({ error: 'Escopo ID necessário' }, { status: 400 })
    }

    const supabase = getSupabase(req)
    let query = supabase
      .from('escopo_aulas')
      .select('*')
      .eq('escopo_id', escopoId)

    if (componente) query = query.eq('componente', componente)
    if (bimestre) query = query.eq('bimestre', parseInt(bimestre))

    const { data: aulas, error } = await query.order('semana', { ascending: true })

    if (error) throw error

    return NextResponse.json({ aulas })
  } catch (error: any) {
    console.error('Erro ao buscar aulas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
