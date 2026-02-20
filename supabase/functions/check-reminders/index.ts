// check-reminders Edge Function
// 毎分実行され、reminder_atが近いプランをチェックして通知を生成

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface Plan {
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

    // 現在時刻の1分後までにリマインダーが設定されているプランを取得
    const now = new Date();
    const oneMinuteLater = new Date(now.getTime() + 60 * 1000);

    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, user_id, title, start_time, reminder_at, reminder_sent')
      .not('reminder_at', 'is', null)
      .eq('reminder_sent', false)
      .lte('reminder_at', oneMinuteLater.toISOString())
      .returns<Plan[]>();

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      throw plansError;
    }

    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 各プランに対して通知を作成
    const notificationsCreated = [];
    const plansUpdated = [];

    for (const plan of plans) {
      // 残り時間を計算
      const minutesUntilStart = Math.max(
        0,
        Math.round((new Date(plan.start_time).getTime() - now.getTime()) / (60 * 1000)),
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
          user_id: plan.user_id,
          type: 'reminder',
          priority: 'high',
          title: plan.title,
          message: `Starting ${timeLabel}`,
          related_plan_id: plan.id,
          is_read: false,
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        continue; // エラーが発生しても他のプランの処理は続行
      }

      notificationsCreated.push(notification);

      // プランのreminder_sentをtrueに更新
      const { error: updateError } = await supabase
        .from('plans')
        .update({ reminder_sent: true })
        .eq('id', plan.id);

      if (updateError) {
        console.error('Error updating plan:', updateError);
        continue;
      }

      plansUpdated.push(plan.id);
    }

    return new Response(
      JSON.stringify({
        message: 'Reminders processed successfully',
        notificationsCreated: notificationsCreated.length,
        plansUpdated: plansUpdated.length,
        planIds: plansUpdated,
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
