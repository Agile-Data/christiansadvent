"use client";
import { useEffect, useState } from "react";
import ArtworkUpload from "./ArtworkUpload";
export type Artwork = { id: string; label: string; url: string; alt: string; uploaded?:boolean };
export type Tradition = { id: string; title: string; body: string; rule: string; monthDay: string; overrideDate: string; date: string; artworkId: string; image?: Artwork; published: boolean; version: number; enabled?:boolean; holidayKey?:string };
type API = <T>(path: string, method?: string, body?: unknown) => Promise<T>;
const rules: Record<string,string> = { THANKSGIVING: "U.S. Thanksgiving", BLACK_FRIDAY: "Day after Thanksgiving", FIRST_SUNDAY_DECEMBER: "First Sunday in December", SUNDAY_BEFORE_CHRISTMAS: "Sunday before Christmas", NEW_YEARS_DAY: "New Year’s Day · January 1 of the following year", MONTH_DAY: "Same month and day each year", CHOOSE_DATE: "Choose a date each year" };
export function ArtworkPicker({ value, items, onChange }: { value: string; items: Artwork[]; onChange: (id: string) => void }) {
  const selected = items.find(i => i.id === value);
  return <><label>Illustration<select aria-label="Illustration" value={value} onChange={e => onChange(e.target.value)}><option value="">No illustration</option>
    {value && !selected && <option value={value}>Assigned illustration (awaiting publication)</option>}
    {items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
  </select></label>{selected?.url && <img className="advent-illustration" src={selected.url} alt={selected.alt} referrerPolicy="no-referrer" />}
    {!items.length && <p className="fine">The illustration library is not available yet. You can still save your readings.</p>}</>;
}
export default function TraditionPlanner({ calendarId, year, api, onClose, onReuse, onSaved, canReuse = true }: { canReuse?: boolean; calendarId: string; year: number; api: API; onClose: () => void; onReuse: (id: string) => Promise<void>; onSaved: () => Promise<void> }) {
  const [items,setItems]=useState<Tradition[]>([]), [edit,setEdit]=useState<Tradition|null>(null), [art,setArt]=useState<Artwork[]>([]);
  const [error,setError]=useState(""), [notice,setNotice]=useState(""), [busy,setBusy]=useState(true), [nextYear,setNextYear]=useState(year+1);
  const path=`/${calendarId}`;
  useEffect(()=>{let cancelled=false; Promise.all([api<Tradition[]>(`${path}/traditions/editor`),api<Artwork[]>(`${path}/artwork`)])
    .then(([ts,images])=>{if(!cancelled){setItems(ts);setEdit(ts[0]||null);setArt(images);}}).catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setBusy(false);});return()=>{cancelled=true;};},[calendarId]); // api is the stable module function
  async function run(fn:()=>Promise<void>){setBusy(true);setError("");setNotice("");try{await fn();}catch(e){setError(e instanceof Error?e.message:"Please retry.");}finally{setBusy(false);}}
  return <section className="panel"><div className="page-heading"><h2>Family tradition planner</h2><button disabled={busy} onClick={onClose}>Close planner</button></div>
    <p>Keep the annual rule and optionally choose a different date for {year}. Confirm church event dates with your congregation. Multiple traditions can share a date.</p>
    {error&&<p role="alert" className="error">{error}</p>}{notice&&<p role="status">{notice}</p>}
    {busy&&<p role="status">Saving or loading traditions…</p>}
    {!busy&&!items.length&&<button onClick={()=>void run(async()=>{const ts=await api<Tradition[]>(`${path}/traditions/initialize`,"POST");setItems(ts);setEdit(ts[0]||null);await onSaved();})}>Add suggested traditions</button>}
    {edit&&<form onSubmit={e=>{e.preventDefault();void run(async()=>{const saved=await api<Tradition>(`${path}/traditions/${edit.id}`,"PUT",edit);setItems(items.map(t=>t.id===saved.id?saved:t));setEdit(saved);await onSaved();setNotice("Tradition saved.");});}}><fieldset disabled={busy}>
      <label>Tradition<select value={edit.id} onChange={e=>setEdit(items.find(t=>t.id===e.target.value)!)}>{items.map(t=><option key={t.id} value={t.id}>{t.title} · {t.date||"Choose date"}</option>)}</select></label>
      {canReuse&&<label className="check"><input type="checkbox" checked={edit.enabled!==false} onChange={e=>setEdit({...edit,enabled:e.target.checked})}/>Include this tradition in the calendar</label>}
      <label>Tradition title<input required maxLength={160} value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/></label>
      <label>Annual date rule<select value={edit.rule} onChange={e=>setEdit({...edit,rule:e.target.value,monthDay:e.target.value==="MONTH_DAY"?(edit.monthDay||"12-24"):""})}>{Object.entries(rules).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      {edit.rule==="MONTH_DAY"&&<label>Annual month and day<input type="date" required min={`${year}-11-01`} max={`${year}-12-31`} value={`${year}-${edit.monthDay}`} onChange={e=>setEdit({...edit,monthDay:e.target.value.slice(5)})}/></label>}
      <label>Date for this season (optional override)<input type="date" min={`${year}-11-01`} max={`${year+1}-01-01`} value={edit.overrideDate} onChange={e=>setEdit({...edit,overrideDate:e.target.value})}/></label>
      <p className="fine">Clear the override to use the annual rule. “Choose a date each year” stays unscheduled until you enter a date.</p>
      <label>Tradition reading and activity<textarea required maxLength={12000} rows={7} value={edit.body} onChange={e=>setEdit({...edit,body:e.target.value})}/></label>
      <ArtworkUpload key={edit.id} calendarId={calendarId} api={api} onUploaded={image=>{setArt(a=>[...a,image]);setEdit(current=>current?.id===edit.id?{...current,artworkId:image.id}:current);}}/>
      <ArtworkPicker value={edit.artworkId} items={art} onChange={artworkId=>setEdit({...edit,artworkId})}/>
      <label className="check"><input type="checkbox" checked={edit.published} onChange={e=>setEdit({...edit,published:e.target.checked})}/>Ready to reveal on its date</label>
      <button className="primary">Save tradition</button>
    </fieldset></form>}
    {canReuse && <><hr/><h3>Keep these traditions next year</h3><p>Copies saved readings, artwork, annual rules, family recipes, variations, and recipe stories into a new private calendar. Plan new meals and shopping lists for the new year. Choose new dates for parties and other one-year overrides. Invite your people to the new calendar.</p>
    <form onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);void run(async()=>{const result=await api<{id:string}>(`${path}/reuse`,"POST",{name:data.get("name"),year:nextYear});await onReuse(result.id);});}}><fieldset disabled={busy}>
      <label>New calendar name<input name="name" required maxLength={120} placeholder="Our family Christmas"/></label><label>New calendar year<input type="number" min={2020} max={2100} required value={nextYear} onChange={e=>setNextYear(Number(e.target.value))}/></label>
      <button>Reuse saved plan</button></fieldset></form></>}
  </section>;
}
