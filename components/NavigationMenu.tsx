"use client";
import {useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
export default function NavigationMenu(){
 const [open,setOpen]=useState(false);const path=usePathname();
 const drawer=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const links=[['/calendar','My calendars'],['/profile/recipes','My recipes & meals'],['/profile','Profile & preferences']];
 function close(){drawer.current?.close();}
 return <><button ref={trigger} type="button" className="navigation-toggle" aria-label="Open navigation menu" aria-expanded={open} aria-controls="advent-navigation" aria-haspopup="dialog" onClick={()=>{drawer.current?.showModal();setOpen(true);}}><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
 <dialog ref={drawer} className="navigation-drawer" aria-labelledby="navigation-title" onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}>
 <nav id="advent-navigation" aria-label="Main navigation"><div className="drawer-heading"><span id="navigation-title">Advent</span><button type="button" className="navigation-toggle" aria-label="Close navigation menu" onClick={close}>×</button></div>
 <ul className="navigation-links">{links.map(([href,label])=>{const active=href==='/calendar'?path.startsWith('/calendar'):path===href;return <li key={href}><a href={href} aria-current={active?'page':undefined} onClick={close}>{label}</a></li>;})}</ul></nav>
 </dialog></>;
}
