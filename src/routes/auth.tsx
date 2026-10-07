import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lovable } from '@/integrations/lovable';
import { useAccount } from '@/lib/auth-context';
import { pageMeta } from '@/lib/page-meta';

export const Route = createFileRoute('/auth')({ head: () => pageMeta('Private Alpha Sign-in — SybilShield', 'Sign in to your private SybilShield alpha account.'), component: Auth });
function Auth() {
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  useEffect(() => { if (ready && user) navigate({ to: '/alpha', replace: true }); }, [ready, user, navigate]);
  return <section className="max-w-lg mx-auto px-6 py-24 min-h-[65vh]"><LockKeyhole className="text-primary mb-6" size={32}/><p className="font-mono text-xs text-primary mb-4">SYBILSHIELD / PRIVATE</p><h1 className="text-4xl mb-4">Alpha workspace</h1><p className="text-muted-foreground mb-8">Administrator access is required to review requests.</p><Button disabled={pending || !ready} onClick={async () => { setPending(true); setError(''); try { const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: `${window.location.origin}/auth` }); if (result.error) throw result.error; } catch { setError('Sign-in could not be completed. Please try again.'); } finally { setPending(false); } }}>Continue with Google <ArrowUpRight/></Button>{error && <p role="alert" className="text-destructive mt-5">{error}</p>}</section>;
}