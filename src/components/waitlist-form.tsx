import { useState } from 'react';
import { ArrowUpRight, Check, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { joinWaitlist } from '@/lib/waitlist.functions';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  return <div className="waitlist-wrap">{state === 'success' ? <div className="waitlist-success" role="status"><Check size={20}/><div><strong>You're on the list.</strong><p>We’ll email you when alpha access opens.</p></div></div> : <form className="waitlist-form" onSubmit={async (event) => {
    event.preventDefault(); setState('pending'); setError('');
    const website = String(new FormData(event.currentTarget).get('website') ?? '');
    try { await joinWaitlist({ data: { email, website } }); setState('success'); }
    catch { setState('error'); setError('Could not save your request. Please try again.'); }
  }}><Mail size={18} className="text-muted-foreground shrink-0"/><label htmlFor="waitlist-email" className="sr-only">Email address</label><input id="waitlist-email" type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} placeholder="Your email address" autoComplete="email" disabled={state === 'pending'}/><input name="website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/><Button type="submit" disabled={state === 'pending'} className="h-12 rounded-sm px-5">{state === 'pending' ? <Loader2 className="animate-spin"/> : <>Request Alpha Access <ArrowUpRight/></>}</Button></form>}{error && <p className="text-destructive mt-3 text-sm" role="alert">{error}</p>}<p className="waitlist-note"><span className="status-dot"/> Early access. No noise. Just the signal.</p><p className="consent-note">By joining, you agree to receive SybilShield access updates.</p></div>;
}