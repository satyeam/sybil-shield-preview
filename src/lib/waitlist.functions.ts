import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export const joinWaitlist = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ email: z.string().trim().email().max(254), website: z.string().max(100).default('') }).parse(data))
  .handler(async ({ data }) => {
    // This is deliberately public: only a validated email can be inserted,
    // and no private waitlist data or membership information is returned.
    if (data.website) return { success: true };
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('waitlist_entries').insert({ email: data.email.toLowerCase() });
    if (error && error.code !== '23505') throw new Error('Your request could not be saved. Please try again.');
    return { success: true };
  });