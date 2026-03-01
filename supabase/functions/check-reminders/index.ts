// check-reminders Edge Function
// 毎分実行され、reminder_atが近いエントリをチェックして通知を生成

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface Entry {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  reminder_at: string | null;
  reminder_sent: boolean;
}

Deno.serve(async (req) => {
  // CORSヘッダー設定
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabaseクライアント作成（service_role key使用でRLSをバイパス）
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 現在時刻の1分後までにリマインダーが設定されているエントリを取得
    const now = new Date();
    const oneMinuteLater = new Date(now.getTime() + 60 * 1000);

    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('id, user_id, title, start_time, reminder_at, reminder_sent')
      .not('reminder_at', 'is', null)
      .eq('reminder_sent', false)
      .lte('reminder_at', oneMinuteLater.toISOString())
      .returns<Entry[]>();

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      throw entriesError;
    }

    if (!entries || entries.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 各エントリに対して通知を作成
    const notificationsCreated = [];
    const entriesUpdated = [];

    for (const entry of entries) {
      // 残り時間を計算
      const minutesUntilStart = Math.max(
        0,
        Math.round((new Date(entry.start_time).getTime() - now.getTime()) / (60 * 1000)),
      );
      const timeLabel =
        minutesUntilStart <= 0
          ? 'now'
          : minutesUntilStart < 60
            ? `in ${minutesUntilStart} min`
            : `in ${Math.round(minutesUntilStart / 60)}h`;

      // 通知を作成
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: entry.user_id,
          type: 'reminder',
          entry_id: entry.id,
          is_read: false,
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        continue; // エラーが発生しても他のエントリの処理は続行
      }

      notificationsCreated.push(notification);

      // エントリのreminder_sentをtrueに更新
      const { error: updateError } = await supabase
        .from('entries')
        .update({ reminder_sent: true })
        .eq('id', entry.id);

      if (updateError) {
        console.error('Error updating entry:', updateError);
        continue;
      }

      entriesUpdated.push(entry.id);
    }

    return new Response(
      JSON.stringify({
        message: 'Reminders processed successfully',
        notificationsCreated: notificationsCreated.length,
        entriesUpdated: entriesUpdated.length,
        entryIds: entriesUpdated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in check-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
