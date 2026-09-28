"use client";
import {ReactNode,useEffect,useRef} from "react";
export default function ReadingDialog({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const dialog=ref.current!;const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;const overflow=document.body.style.overflow;const x=window.scrollX,y=window.scrollY;document.body.style.overflow="hidden";dialog.showModal();return()=>{dialog.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus({preventScroll:true});window.scrollTo(x,y);};},[]);
 return <dialog ref={ref} className="reading-dialog" aria-labelledby="reading-title" onCancel={e=>{e.preventDefault();close.current();}} onClick={e=>{if(e.target===e.currentTarget){const b=e.currentTarget.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)close.current();}}}>
 <header className="reading-dialog-header"><h2 id="reading-title">{title}</h2><button autoFocus onClick={onClose} aria-label="Close reading">Close ×</button></header><div className="reading-dialog-body">{children}</div></dialog>;
}
