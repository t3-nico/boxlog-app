// check-reminders Edge Function
// 毎分実行され、reminder_atが近いチケットをチェックして通知を生成

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface Ticket {
  id: string
  user_id: string
  title: string
  reminder_at: string | null
  reminder_sent: boolean
}

Deno.serve(async (req) => {
  // CORSヘッダー設定
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabaseクライアント作成（service_role key使用でRLSをバイパス）
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 現在時刻の1分後までにリマインダーが設定されているチケットを取得
    const now = new Date()
    const oneMinuteLater = new Date(now.getTime() + 60 * 1000)

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, user_id, title, reminder_at, reminder_sent')
      .not('reminder_at', 'is', null)
      .eq('reminder_sent', false)
      .lte('reminder_at', oneMinuteLater.toISOString())
      .returns<Ticket[]>()

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      throw ticketsError
    }

    if (!tickets || tickets.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 各チケットに対して通知を作成
    const notificationsCreated = []
    const ticketsUpdated = []

    for (const ticket of tickets) {
      // 通知を作成
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: ticket.user_id,
          type: 'reminder',
          priority: 'high',
          title: 'リマインダー',
          message: `「${ticket.title}」のリマインダー時刻になりました`,
          related_ticket_id: ticket.id,
          is_read: false,
        })
        .select()
        .single()

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
        continue // エラーが発生しても他のチケットの処理は続行
      }

      notificationsCreated.push(notification)

      // チケットのreminder_sentをtrueに更新
      const { error: updateError } = await supabase.from('tickets').update({ reminder_sent: true }).eq('id', ticket.id)

      if (updateError) {
        console.error('Error updating ticket:', updateError)
        continue
      }

      ticketsUpdated.push(ticket.id)
    }

    return new Response(
      JSON.stringify({
        message: 'Reminders processed successfully',
        notificationsCreated: notificationsCreated.length,
        ticketsUpdated: ticketsUpdated.length,
        ticketIds: ticketsUpdated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in check-reminders function:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
