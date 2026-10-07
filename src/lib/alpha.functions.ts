import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getAlphaAccount = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, role] = await Promise.all([
    context.supabase.from('profiles').select('display_name, avatar_url').eq('id', context.userId).single(),
    context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
  ]);
  if (profile.error || role.error) throw new Error('Your account could not be loaded.');
  return { profile: profile.data, isAdmin: role.data === true };
});

export const saveAlphaProfile = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ display_name: z.string().trim().max(80), avatar_url: z.union([z.literal(''), z.string().url().startsWith('https://').max(1000)]) }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from('profiles').update(data).eq('id', context.userId);
    if (error) throw new Error('Your profile could not be saved.');
    return { success: true };
  });

export const getAlphaRequests = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || role.data !== true) throw new Error('Administrator access required.');
  const { data, error } = await context.supabase.from('waitlist_entries').select('id, email, created_at, status, notes, reviewed_at').order('created_at', { ascending: false });
  if (error) throw new Error('Requests could not be loaded.');
  return data;
});

export const reviewAlphaRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(['pending', 'approved', 'declined']), notes: z.string().trim().max(2000) }).parse(input))
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (role.error || role.data !== true) throw new Error('Administrator access required.');
    const { error, data: updated } = await context.supabase.from('waitlist_entries').update({ status: data.status, notes: data.notes, reviewed_at: data.status === 'pending' ? null : new Date().toISOString() }).eq('id', data.id).select('id').single();
    if (error || !updated) throw new Error('The review could not be saved.');
    return { success: true };
  });