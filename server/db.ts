import { createClient } from '@supabase/supabase-js';

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

export async function log(teamId: string, kind: string, cardId?: string, detail?: string) {
  await db.from('logs').insert({ team_id: teamId, kind, card_id: cardId ?? null, detail: detail ?? null });
}