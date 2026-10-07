import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Loader2, Save, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAlphaAccount, getAlphaRequests, reviewAlphaRequest, saveAlphaProfile } from '@/lib/alpha.functions';
import { pageMeta } from '@/lib/page-meta';

export const Route = createFileRoute('/_authenticated/alpha')({ head: () => ({ meta: [...pageMeta('Alpha Workspace — SybilShield', 'Private alpha request review and account profile.').meta, { name: 'robots', content: 'noindex, nofollow' }] }), component: Alpha });
type Row = Awaited<ReturnType<typeof getAlphaRequests>>[number];
function Alpha() {
 const getAccount = useServerFn(getAlphaAccount), getRequests = useServerFn(getAlphaRequests);
 const account = useQuery({ queryKey: ['alpha-account'], queryFn: () => getAccount() });
 const requests = useQuery({ queryKey: ['alpha-requests'], queryFn: () => getRequests(), enabled: account.data?.isAdmin === true });
 const [tab, setTab] = useState('requests'), [filter, setFilter] = useState('pending'), [search, setSearch] = useState('');
 const rows = requests.data ?? [];
 const visible = rows.filter(r => (filter === 'all' || r.status === filter) && r.email.toLowerCase().includes(search.toLowerCase()));
 return <section className="max-w-6xl mx-auto px-6 py-12 min-h-[70vh]"><div className="flex justify-between mb-8"><div><p className="text-primary text-xs font-mono mb-3">SYBILSHIELD / PRIVATE ALPHA</p><h1 className="text-3xl">Alpha workspace</h1></div><ShieldCheck className="text-primary"/></div><div className="flex gap-3 border-b pb-4 mb-8"><Button variant={tab === 'requests' ? 'secondary' : 'ghost'} onClick={() => setTab('requests')}>Requests</Button><Button variant={tab === 'profile' ? 'secondary' : 'ghost'} onClick={() => setTab('profile')}>My profile</Button></div>
 {account.isPending ? <Loader2 className="animate-spin"/> : account.isError ? <p role="alert">Account could not be loaded. <Button onClick={() => account.refetch()}>Retry</Button></p> : tab === 'profile' && account.data ? <Profile profile={account.data.profile}/> : !account.data?.isAdmin ? <div className="py-12"><h2 className="text-2xl mb-4">Administrator permission required</h2><p className="text-muted-foreground">Your account is signed in. Only approved administrators can view the private waitlist.</p></div> : <>
 <div className="grid grid-cols-2 sm:grid-cols-4 border-y mb-8">{['all','pending','approved','declined'].map(s => <div className="py-5" key={s}><p className="uppercase font-mono text-xs text-muted-foreground">{s === 'all' ? 'Total requests' : s}</p><p className="text-3xl mt-2">{requests.isPending ? '—' : rows.filter(r => s === 'all' || r.status === s).length}</p></div>)}</div>
 <div className="flex flex-wrap justify-between gap-4 mb-6"><div className="flex flex-wrap gap-1">{['pending','approved','declined','all'].map(s => <Button key={s} className="capitalize" variant={filter === s ? 'secondary' : 'ghost'} onClick={() => setFilter(s)}>{s}</Button>)}</div><label className="flex items-center gap-2 border rounded px-3"><Search size={16}/><input aria-label="Search requests" placeholder="Search email" value={search} onChange={e => setSearch(e.target.value)} className="bg-transparent h-9 outline-none w-40 text-sm"/></label></div>
 {requests.isPending ? <Loader2 className="animate-spin"/> : requests.isError ? <p role="alert">Requests could not be loaded. <Button onClick={() => requests.refetch()}>Retry</Button></p> : !visible.length ? <div className="text-center py-16 border-y text-muted-foreground">{rows.length ? 'No matching requests.' : 'No alpha requests yet.'}</div> : <div className="space-y-0">{visible.map(row => <Review key={row.id} row={row}/>)}</div>}
 </>}
 </section>;
}
function Profile({ profile }: { profile: { display_name: string; avatar_url: string } }) {
 const [name,setName]=useState(profile.display_name),[avatar,setAvatar]=useState(profile.avatar_url),[message,setMessage]=useState(''),[pending,setPending]=useState(false);
 const save=useServerFn(saveAlphaProfile), qc=useQueryClient();
 return <form className="max-w-lg space-y-5" onSubmit={async e => { e.preventDefault();setPending(true);setMessage('');try { await save({data:{display_name:name,avatar_url:avatar}});await qc.invalidateQueries({queryKey:['alpha-account']});setMessage('Profile saved.'); }catch{setMessage('Profile could not be saved.');}finally{setPending(false);} }}><h2 className="text-xl">My profile</h2><label className="block text-sm">Display name<input value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="block w-full border rounded bg-background p-3 mt-2"/></label><label className="block text-sm">Avatar URL<input type="url" placeholder="https://" value={avatar} maxLength={1000} onChange={e=>setAvatar(e.target.value)} className="block w-full border rounded bg-background p-3 mt-2"/></label><Button disabled={pending}><Save/>Save profile</Button><p role="status">{message}</p></form>;
}
function Review({row}:{row:Row}) {
 const [open,setOpen]=useState(false),[status,setStatus]=useState(row.status),[notes,setNotes]=useState(row.notes),[pending,setPending]=useState(false),[error,setError]=useState('');
 const save=useServerFn(reviewAlphaRequest),qc=useQueryClient();
 return <article className="border-b py-5"><div className="flex flex-wrap justify-between items-center gap-4"><div className="min-w-0"><p className="break-all">{row.email}</p><p className="text-muted-foreground text-xs mt-2">{new Date(row.created_at).toLocaleString()}</p></div><div className="flex items-center gap-4"><span className={`capitalize text-sm ${row.status==='approved'?'text-primary':'text-muted-foreground'}`}>{row.status}</span><Button variant="outline" onClick={()=>setOpen(!open)}>{open?'Close':'Review'}</Button></div></div>{open&&<form className="max-w-xl mt-5 space-y-4" onSubmit={async e=>{e.preventDefault();if(status!=='pending'&&status!=='approved'&&status!=='declined')return;setPending(true);setError('');try{await save({data:{id:row.id,status,notes}});await qc.invalidateQueries({queryKey:['alpha-requests']});setOpen(false);}catch{setError('Review could not be saved.');}finally{setPending(false);}}}><label className="block text-sm">Status<select aria-label="Request status" value={status} onChange={e=>setStatus(e.target.value)} className="block w-full bg-background border rounded p-3 mt-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="declined">Declined</option></select></label><label className="block text-sm">Private notes<textarea value={notes} maxLength={2000} onChange={e=>setNotes(e.target.value)} className="block w-full bg-background border rounded p-3 mt-2 min-h-24"/></label><Button disabled={pending}><Save/>Save review</Button>{error&&<p role="alert" className="text-destructive">{error}</p>}</form>}</article>;
}
