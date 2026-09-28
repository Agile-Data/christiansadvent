"use client";
import {useEffect,useState} from "react";
type API=<T>(path:string,method?:string,body?:unknown)=>Promise<T>;
type Memory={id:string;author:string;body:string;createdAt:string;version:number;mine:boolean;canRemove:boolean};
export default function DayMemories({calendarId,item,api,uploaded,onImageHidden}:{calendarId:string;item:string;api:API;uploaded?:boolean;onImageHidden:()=>void}){
 const [memories,setMemories]=useState<Memory[]>([]),[body,setBody]=useState(""),[busy,setBusy]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState(""),[report,setReport]=useState(false);
 const path=`/${calendarId}/items/${item}`;
 const mine=memories.find(m=>m.mine);
 async function load(){const rows=await api<Memory[]>(`${path}/memories`);setMemories(rows);setBody(rows.find(m=>m.mine)?.body||"");}
 useEffect(()=>{let active=true;api<Memory[]>(`${path}/memories`).then(rows=>{if(active){setMemories(rows);setBody(rows.find(m=>m.mine)?.body||"");}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[path]);
 async function run(fn:()=>Promise<void>){setBusy(true);setError("");setNotice("");try{await fn();}catch(e){setError(e instanceof Error?e.message:"Please retry.");}finally{setBusy(false);}}
 return <section className="day-memories"><h3>Our memories of this day</h3><p className="fine">Shared with everyone in this calendar. Each person can save and update a memory. The host can remove a memory.</p>
 {error&&<p role="alert" className="error">{error} <button disabled={busy} onClick={()=>void run(load)}>Reload memories</button></p>}{notice&&<p role="status">{notice}</p>}
 {memories.map(m=><article key={m.id} className="memory"><strong>{m.author}</strong><p className="message">{m.body}</p>{m.canRemove&&<button disabled={busy} onClick={()=>void run(async()=>{await api(`${path}/memories/${m.id}`,"DELETE");await load();setNotice("Memory removed.");})}>Remove {m.mine?"my":"this"} memory</button>}</article>)}
 <form onSubmit={e=>{e.preventDefault();void run(async()=>{await api(`${path}/memories`,"PUT",{body,version:mine?.version||0});await load();setNotice("Your memory is shared.");});}}><label>Your memory<textarea required maxLength={2000} rows={3} value={body} disabled={busy} onChange={e=>setBody(e.target.value)}/></label><button disabled={busy}>{mine?"Update":"Share"} my memory</button></form>
 {uploaded&&<><button disabled={busy} onClick={()=>setReport(v=>!v)}>Report this image</button>{report&&<form onSubmit={e=>{e.preventDefault();const reason=new FormData(e.currentTarget).get("reason");void run(async()=>{await api(`${path}/report-image`,"POST",{reason});onImageHidden();setReport(false);setNotice("The reported image is hidden from the calendar.");});}}><label>What concerns you?<textarea name="reason" required maxLength={500}/></label><p className="fine">Reporting hides this family upload. Previously loaded images may remain visible briefly.</p><button disabled={busy}>Report and hide image</button></form>}</>}
 </section>;
}
