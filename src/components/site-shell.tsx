import { Link, useRouterState } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShieldLogo } from './brand';

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: state => state.location.pathname });
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);
  const nav = <><Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'nav-active' }}>Overview</Link><Link to="/vision" activeProps={{ className: 'nav-active' }}>The Vision</Link><Link to="/developers" activeProps={{ className: 'nav-active' }}>Developer API <span className="nav-draft">PREVIEW</span></Link><Link to="/roadmap" activeProps={{ className: 'nav-active' }}>Roadmap</Link></>;
  return <><header className="site-header"><div className="header-inner"><Link to="/" className="brand"><ShieldLogo className="brand-icon"/><span>SybilShield<span className="text-primary">.</span></span></Link><nav className="desktop-nav" aria-label="Main navigation">{nav}</nav><Button asChild variant="outline" className="header-access rounded-sm"><Link to="/" hash="access">Join the Waitlist <ArrowUpRight/></Link></Button><Button variant="ghost" size="icon" className="mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</Button></div>{open && <nav className="mobile-nav" aria-label="Mobile navigation">{nav}<Link to="/" hash="access" onClick={() => setOpen(false)}>Request Alpha Access <ArrowUpRight size={16}/></Link></nav>}</header><main key={pathname} className="page-enter">{children}</main><footer className="site-footer"><div className="footer-top"><Link to="/" className="brand"><ShieldLogo className="brand-icon"/><span>SybilShield<span className="text-primary">.</span></span></Link><p>Precision On-Chain Attribution.<br className="sm:hidden"/> Zero Bots. Pure Growth.</p><Link to="/vision" className="footer-vision">Read the manifesto <ArrowUpRight size={15}/></Link></div><div className="footer-bottom"><span>© {new Date().getUTCFullYear()} SybilShield. All rights reserved.</span><span className="font-mono flex items-center gap-2"><span className="status-dot"/> Built in the open. Launching with intention.</span><a href="https://x.com/intent/post?text=Building%20a%20more%20human%20Web3%20with%20SybilShield" target="_blank" rel="noreferrer" aria-label="Share SybilShield on X" title="Share on X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l7.3-8.4L.8 2h6.5l4.5 6.8L18.9 2ZM17.8 20h1.7L6.3 3.9H4.5L17.8 20Z"/></svg></a></div></footer></>;
}