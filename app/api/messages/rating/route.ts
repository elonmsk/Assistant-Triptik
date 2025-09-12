import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { messageId, rating, feedback, userNumero, userType } = await request.json()

    console.log('📝 API Rating - Données reçues:', { messageId, rating, feedback, userNumero, userType })

    if (!messageId || !userNumero || !userType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Utiliser l'instance supabase importée

    // Vérifier si une évaluation existe déjà pour ce message
    const { data: existingEvaluation } = await supabase
      .from('message_evaluations')
      .select('id, rating, feedback')
      .eq('message_id', messageId)
      .eq('session_id', `${userNumero}_${userType}`)
      .single()

    let data, error

    if (existingEvaluation) {
      // Mettre à jour l'évaluation existante
      console.log('📝 Mise à jour évaluation existante:', existingEvaluation)
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      // Mettre à jour seulement les champs fournis
      if (rating !== undefined) {
        updateData.rating = rating === 'like' ? 'positive' : rating === 'dislike' ? 'negative' : null
      }
      if (feedback !== undefined) {
        updateData.feedback = feedback || null
      }
      
      console.log('📝 Données de mise à jour:', updateData)
      
      const result = await supabase
        .from('message_evaluations')
        .update(updateData)
        .eq('message_id', messageId)
        .eq('session_id', `${userNumero}_${userType}`)
        .select()
      
      data = result.data
      error = result.error
    } else {
      // Créer une nouvelle évaluation
      console.log('📝 Création nouvelle évaluation')
      const insertData: any = {
        message_id: messageId,
        session_id: `${userNumero}_${userType}`
      }
      
      // Ajouter seulement les champs fournis
      if (rating !== undefined) {
        insertData.rating = rating === 'like' ? 'positive' : rating === 'dislike' ? 'negative' : null
      }
      if (feedback !== undefined) {
        insertData.feedback = feedback || null
      }
      
      console.log('📝 Données d\'insertion:', insertData)
      
      const result = await supabase
        .from('message_evaluations')
        .insert(insertData)
        .select()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('Erreur lors de la sauvegarde de la notation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data?.[0] 
    })

  } catch (error) {
    console.error('Erreur API rating:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const userNumero = searchParams.get('userNumero')
    const userType = searchParams.get('userType')

    if (!messageId || !userNumero || !userType) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Utiliser l'instance supabase importée

    const { data, error } = await supabase
      .from('message_evaluations')
      .select('rating, feedback, created_at, updated_at')
      .eq('message_id', messageId)
      .eq('session_id', `${userNumero}_${userType}`)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la récupération de la notation:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: data ? {
        rating: data.rating === 'positive' ? 'like' : data.rating === 'negative' ? 'dislike' : null,
        feedback: data.feedback
      } : { rating: null, feedback: null }
    })

  } catch (error) {
    console.error('Erreur API rating GET:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
