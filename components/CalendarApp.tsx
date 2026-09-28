"use client";
import {AdventDoorGrid} from "@agile-data/advent";
import { FormEvent, useEffect, useState } from "react";

import TraditionPlanner, { ArtworkPicker, type Artwork } from "./TraditionPlanner";

import {DayMeals} from "./DayMeals";
import FamilyKitchen from "./FamilyKitchen";
import IncludedHolidays from "./IncludedHolidays";
import MonthDoors from "./MonthDoors";
import ReadingDialog from "./ReadingDialog";
import DayMemories from "./DayMemories";
import ArtworkUpload from "./ArtworkUpload";
import CalendarPeople from "./CalendarPeople";

type Calendar = { id: string; name: string; year: number; timezone: string; role: "OWNER" | "EDITOR" | "MEMBER"; presentation: string; tradition: string; thanksgiving:boolean };
type Door = { number: number; date: string; state: "LOCKED" | "AVAILABLE" | "DRAFT"; opened: boolean };
type Content = { number: number; date: string; title: string; body: string; published: boolean; version: number; artworkId?: string; image?: Artwork };
type TraditionDoor = { id: string; date: string; state: string; holidayKey?:string; opened?:boolean };
const base = "/api/v1/advent/calendars";
async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const r = await fetch(base + path, { method, cache: "no-store", headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (r.status === 401) { window.location.assign("/auth/login?returnTo="+encodeURIComponent(window.location.pathname+window.location.search+window.location.hash)); throw new Error("Please sign in again."); }
  const result = await r.json().catch(() => ({ error: "The calendar service could not complete this request. Please retry or sign in again." }));
  if (!r.ok) throw new Error(result.error || "The request could not be completed.");
  return result as T;
}
function calendarFromUrl(url:URL){
  const match=url.pathname.match(/^\/calendar\/([^/]+)(?:\/settings)?\/?$/);
  return match&&match[1]!=="new"?decodeURIComponent(match[1]):url.searchParams.get("calendar");
}
function formatDate(date: string, language: string) {
  return new Intl.DateTimeFormat(language, { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(date + "T12:00:00Z"));
}
export default function CalendarApp({mode="calendar"}:{mode?:"calendar"|"new"|"settings"}) {
  const settings=mode==="settings";
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const [calendars, setCalendars] = useState<Calendar[]>([]), [selected, setSelected] = useState("");
  const [doors, setDoors] = useState<Door[]>([]), [content, setContent] = useState<Content | null>(null);
  const [readingItem,setReadingItem]=useState("");
  const [editor, setEditor] = useState<Content[] | null>(null), [edit, setEdit] = useState<Content | null>(null);
  const [calendarView,setCalendarView]=useState(true);
  const [kitchen,setKitchen]=useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [joinCode,setJoinCode]=useState(""),[displayName,setDisplayName]=useState(""),[language,setLanguage]=useState("en");
  const dateLabel=(date:string)=>formatDate(date,language);
  const [error, setError] = useState(""), [notice, setNotice] = useState(""), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(mode==="new"), [showJoin, setShowJoin] = useState(false), [revision, setRevision] = useState(0);
  const [timezone, setTimezone] = useState("America/Denver"), [year, setYear] = useState(2026);
  const [holidayRegion,setHolidayRegion]=useState("US"),[boxingChoice,setBoxingChoice]=useState<boolean|null>(null);
  const [artwork, setArtwork] = useState<Artwork[]>([]), [planner, setPlanner] = useState(false);
  const [traditions,setTraditions] = useState<TraditionDoor[]>([]);
  const [readingBusy,setReadingBusy]=useState(false),[readingError,setReadingError]=useState(""),[copied,setCopied]=useState(false);
  function navigate(calendarId:string,item="",replace=false){
    const url=new URL(window.location.href);url.pathname=`/calendar/${encodeURIComponent(calendarId)}${settings?"/settings":""}`;url.searchParams.delete("calendar");url.hash=item;
    window.history[replace?"replaceState":"pushState"]({...window.history.state,adventDoor:replace?!!window.history.state?.adventDoor:!!item},"",url);
    setSelected(calendarId);setReadingItem(item);
  }
  function closeReading(){
    if(window.history.state?.adventDoor){window.history.back();}
    else {const url=new URL(window.location.href);url.hash="";window.history.replaceState(window.history.state,"",url);setReadingItem("");}
  }
  useEffect(()=>{
    function sync(){const url=new URL(window.location.href),id=calendarFromUrl(url);
      if(id&&url.searchParams.has("calendar")){url.pathname=`/calendar/${encodeURIComponent(id)}`;url.searchParams.delete("calendar");window.history.replaceState(window.history.state,"",url);}
      if(id&&calendars.length&&!calendars.some(c=>c.id===id)){setSelected("");setReadingItem("");setError("This calendar is unavailable. Sign in with an invited account or choose one of your calendars.");return;}
      if(id)setSelected(id);setReadingItem(url.hash.slice(1));
    }
    sync();window.addEventListener("popstate",sync);window.addEventListener("hashchange",sync);
    return()=>{window.removeEventListener("popstate",sync);window.removeEventListener("hashchange",sync);};
  },[calendars]);
  useEffect(()=>{
    let cancelled=false;setContent(null);setReadingError("");setCopied(false);
    if(!selected||!readingItem)return;
    if(!/^day-(0|[1-9]|1[0-9]|2[0-5])$/.test(readingItem)&&!/^tradition-[A-Za-z0-9-]+$/.test(readingItem)){setReadingError("This door link is not valid.");setReadingBusy(false);return;}
    setReadingBusy(true);
    const path=readingItem.startsWith("day-")?`doors/${readingItem.slice(4)}`:`traditions/${readingItem.slice(10)}`;
    api<Content>(`/${selected}/${path}/open`,"POST").then(async result=>{if(cancelled)return;setContent(result);const [ds,ts]=await Promise.all([api<Door[]>(`/${selected}/doors`),api<TraditionDoor[]>(`/${selected}/traditions`)]);if(!cancelled){setDoors(ds);setTraditions(ts);}}).catch(e=>{if(!cancelled)setReadingError(e.message);}).finally(()=>{if(!cancelled)setReadingBusy(false);});
    return()=>{cancelled=true;};
  },[selected,readingItem]);
  const calendar = calendars.find(c => c.id === selected);
  const availableReadings=[...doors.filter(d=>d.state==="AVAILABLE").map(d=>({key:`day-${d.number}`,date:d.date})),...traditions.filter(t=>t.state==="AVAILABLE").map(t=>({key:`tradition-${t.id}`,date:t.date}))].sort((a,b)=>a.date.localeCompare(b.date)||a.key.localeCompare(b.key));
  const readingIndex=availableReadings.findIndex(d=>d.key===readingItem);

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setYear(new Date().getFullYear());
    let cancelled=false;
    fetch("/api/v1/profile/preferences",{cache:"no-store"}).then(async r=>{if(!r.ok)return null;return r.json();}).then(p=>{if(p&&!cancelled){if(p.timezone)setTimezone(p.timezone);if(p.language)setLanguage(p.language);if(p.displayName)setDisplayName(p.displayName);}}).catch(()=>{});
    try {const code=sessionStorage.getItem("advent-invitation");if(code&&/^[A-Za-z0-9_-]{32}$/.test(code)){setJoinCode(code);setShowJoin(true);}}catch{}
    return ()=>{cancelled=true;};
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    api<Calendar[]>("").then(list => {
      if (!cancelled) { setCalendars(list); setSelected(previous => {const requested=calendarFromUrl(new URL(window.location.href));return requested?(list.some(c=>c.id===requested)?requested:""):list.some(c => c.id === previous) ? previous : list[0]?.id || "";}); }
    }).catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);
  useEffect(() => {
    let cancelled = false;
    setKitchen(false);setDoors([]); setTraditions([]); setPlanner(false); setContent(null); setEditor(null); setEdit(null); setShowPeople(false); setNotice("");
    if (!selected) return;
    setLoading(true);
    Promise.all([api<Door[]>(`/${selected}/doors`), api<TraditionDoor[]>(`/${selected}/traditions`)]).then(([value, ts]) => { if (!cancelled) { setDoors(value); setTraditions(ts); } })
      .catch(e => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selected, revision]);
  async function action(fn: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Please retry."); }
    finally { setBusy(false); }
  }
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void action(async () => {
      const result = await api<{ id: string }>("", "POST", {
        name: form.get("name"), year: Number(form.get("year")), timezone: form.get("timezone"),
        presentation: form.get("presentation"), tradition: form.get("tradition"), thanksgiving: form.get("thanksgiving") === "on", holidayRegion:form.get("holidayRegion"), blackFriday:form.get("blackFriday")==="on", boxingDay:form.get("boxingDay")==="on", newYearsEve:form.get("newYearsEve")==="on", newYearsDay:form.get("newYearsDay")==="on",
      });
      window.location.assign(`/calendar/${encodeURIComponent(result.id)}/settings`);
    });
  }
  function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void action(async () => {
      const result = await api<{ id: string }>("/join", "POST", { code: String(form.get("code")).trim(), displayName: form.get("displayName") });
      setCalendars(await api<Calendar[]>("")); navigate(result.id); setShowJoin(false); setJoinCode(""); try {sessionStorage.removeItem("advent-invitation");}catch{}
    });
  }
  async function open(number:number){navigate(selected,`day-${number}`);}
  async function loadEditor() {
    setContent(null); setPlanner(false);
    setArtwork(await api<Artwork[]>(`/${selected}/artwork`));
    const value = await api<Content[]>(`/${selected}/editor`);
    setEditor(value); setEdit(value[0] || null); setShowPeople(false);
  }
  return <main className="calendar-page">
    <div className="page-heading"><div><p className="eyebrow">Your people. Your traditions.</p><h1>{mode==="new"?"Create your calendar":settings?"Calendar settings":"Christmas, together."}</h1></div></div>
    {error && <div role="alert" className="error">{error} <button disabled={busy} onClick={() => setRevision(r => r + 1)}>Reload calendars</button></div>}
    {notice && <p role="status" className="notice">{notice}</p>}
    {mode!=="new"&&<div className="toolbar">
      <label>Calendar<select value={selected} disabled={busy || loading || !calendars.length} onChange={e => { navigate(e.target.value); setError(""); }}>
        {!calendars.length && <option value="">No calendars yet</option>}
        {calendars.map(c => <option key={c.id} value={c.id}>{c.name} · {c.year}</option>)}
      </select></label>
      <a href="/calendar/new">New calendar</a>
      <button disabled={busy} onClick={() => { setShowJoin(v => !v); setShowCreate(false); }}>Join with a code</button>
      <button disabled={busy || loading} onClick={() => setRevision(r => r + 1)}>Refresh</button>
    </div>}
    {mode==="new"&&<p>Choose the season and included holidays first. Next, add your images and edit each day’s text. <a href="/calendar">Cancel and return to calendars</a></p>}
    {showCreate && ready && <form className="panel" onSubmit={create}><h2>A new tradition starts here.</h2>
      <div className="form-grid"><label>Calendar name<input name="name" required maxLength={120} placeholder="Christmas with our crew" /></label>
        <label>Year<input name="year" type="number" required min={2020} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} /></label>
        <label>Timezone<input name="timezone" required maxLength={80} value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="America/Denver" /></label>
        <label>Christmas presentation<select name="presentation"><option value="TRADITIONAL">Seasonal traditions</option><option value="NATIVITY">Nativity reflections</option><option value="BOTH">A little of both</option></select></label>
        <label>Holiday region<select name="holidayRegion" value={holidayRegion} onChange={e=>setHolidayRegion(e.target.value)}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="IE">Ireland</option><option value="OTHER">Elsewhere</option></select></label>
        <label>Faith tradition<select name="tradition"><option value="GENERAL">General Christian</option><option value="LDS">Latter-day Saint</option><option value="CATHOLIC">Catholic</option><option value="PROTESTANT">Protestant</option></select></label>
      </div><label className="check"><input type="checkbox" name="thanksgiving" defaultChecked /> Begin with a gratitude door on U.S. Thanksgiving</label>
      <label className="check"><input type="checkbox" name="blackFriday" defaultChecked /> Include Black Friday · day after U.S. Thanksgiving</label>
      <label className="check"><input type="checkbox" name="boxingDay" checked={boxingChoice??["CA","GB","IE"].includes(holidayRegion)} onChange={e=>setBoxingChoice(e.target.checked)}/> Include Boxing Day · December 26</label>
      <label className="check"><input type="checkbox" name="newYearsEve"/> Include New Year’s Eve · December 31, {year}</label>
      <label className="check"><input type="checkbox" name="newYearsDay"/> Include New Year’s Day · January 1, {year+1}</label>
      <p className="fine">Includes December 1–25 plus the holidays you select. Boxing Day is suggested for Canada, UK and Ireland; you can change that choice. The owner can remove or restore holiday doors in Calendar settings. Seasonal calendars use seasonal content; Nativity and Both include the selected faith tradition’s suggested gatherings. Confirm event dates in the planner.</p>
      <button className="primary" disabled={busy}>Create calendar</button>
    </form>}
    {showJoin && <form className="panel" onSubmit={join}><h2>Someone saved you a place.</h2><label>Your name in this calendar<input name="displayName" required maxLength={80} autoComplete="name" value={displayName} onChange={e=>setDisplayName(e.target.value)} /></label><label>Invitation code<input name="code" required autoComplete="off" minLength={32} maxLength={32} value={joinCode} onChange={e=>setJoinCode(e.target.value)} /></label>
      <p className="fine">Joining gives you access to this calendar only.</p><button className="primary" disabled={busy}>Join calendar</button></form>}
    {loading && <p role="status">Finding your calendars…</p>}
    {!loading && !calendars.length && !showCreate && <section className="empty"><h2>Your first Christmas is waiting.</h2><p>Create a calendar, or ask your host for an invitation code.</p></section>}
    {calendar && mode!=="new" && <><section className="calendar-heading"><div><h2>{calendar.name}</h2><p>{calendar.year} · {calendar.timezone}{calendar.tradition ? ` · ${calendar.tradition}` : ""}</p></div>
      {!settings&&calendar.role!=="MEMBER"&&<a className="primary" href={`/calendar/${selected}/settings`}>Calendar settings</a>}{settings&&calendar.role !== "MEMBER" && <div className="toolbar"><button disabled={busy || loading} onClick={() => { setPlanner(true); setEditor(null); setEdit(null); setShowPeople(false); }}>Plan traditions</button><button disabled={busy || loading} onClick={() => void action(loadEditor)}>Edit doors (includes future days)</button>{calendar.role === "OWNER" && <button disabled={busy || loading} onClick={() => { setShowPeople(true); setPlanner(false); setEditor(null); setEdit(null); }}>Friends and family</button>}</div>}
    </section>
    {settings&&<><p><a href={`/calendar/${selected}`}>Back to calendar</a></p>{calendar.role==="MEMBER"?<p>Only the owner and co-editors can edit this calendar.</p>:<><p>Choose included holidays, plan gatherings, and use Edit doors to add artwork and write each day’s message.</p>{calendar.role==="OWNER"&&<IncludedHolidays key={selected} calendarId={selected} thanksgiving={calendar.thanksgiving} api={api} onSaved={async()=>{setCalendars(await api<Calendar[]>(""));setDoors(await api<Door[]>(`/${selected}/doors`));setTraditions(await api<TraditionDoor[]>(`/${selected}/traditions`));setPlanner(false);setEditor(null);setEdit(null);}}/>}</>}</>}
    <div className="toolbar">{!settings&&<button onClick={()=>{setKitchen(v=>!v);setPlanner(false);setEditor(null);setEdit(null);}}>Recipes & meal plans</button>}{settings&&calendar.role!=="MEMBER"&&<button disabled={busy} onClick={()=>void action(async()=>{const result=await api<{updated:number;kept:number}>(`/${selected}/content-pack`,"POST");setEditor(null);setEdit(null);setPlanner(false);setNotice(`${result.updated} stock readings updated. Family-edited text and custom dates were kept.`);})}>Update untouched Christmas readings</button>}</div>
    {kitchen&&<FamilyKitchen key={selected} calendarId={selected} canPlan={calendar.role!=="MEMBER"} api={api} onClose={()=>setKitchen(false)}/>}
    {planner && <TraditionPlanner key={selected} calendarId={selected} year={calendar.year} canReuse={calendar.role === "OWNER"} api={api} onClose={() => setPlanner(false)} onSaved={async () => { setTraditions(await api<TraditionDoor[]>(`/${selected}/traditions`)); }} onReuse={async id => { setCalendars(await api<Calendar[]>("")); navigate(id); }} />}
    {editor && edit && <section className="panel"><div className="page-heading"><h2>Calendar editor</h2><button disabled={busy} onClick={() => { setEditor(null); setEdit(null); }}>Close editor</button></div>
      <p className="fine">Owners and co-editors can preview future content here. Members only see published messages once their dates arrive. Changes also affect previously opened doors.</p>
      <form onSubmit={e => { e.preventDefault(); void action(async () => {
        const saved = await api<Content>(`/${selected}/doors/${edit.number}`, "PUT", edit);
        setEdit(saved); setEditor(editor.map(d => d.number === saved.number ? saved : d));
        setDoors(await api<Door[]>(`/${selected}/doors`)); setNotice("Door saved.");
      }); }}><label>Door<select value={edit.number} disabled={busy} onChange={e => setEdit(editor.find(d => d.number === Number(e.target.value))!)}>{editor.map(d => <option key={d.number} value={d.number}>{dateLabel(d.date)} · {d.title}</option>)}</select></label>
      <label>Title<input value={edit.title} required maxLength={160} disabled={busy} onChange={e => setEdit({ ...edit, title: e.target.value })} /></label>
      <label>Message, reading references, or activity<textarea value={edit.body} required maxLength={12000} rows={7} disabled={busy} onChange={e => setEdit({ ...edit, body: e.target.value })} /></label>
      <ArtworkUpload key={`${selected}/${edit.number}`} calendarId={selected} api={api} onUploaded={image=>{setArtwork(a=>[...a,image]);setEdit(current=>current?.number===edit.number?{...current,artworkId:image.id}:current);}}/>
      <ArtworkPicker value={edit.artworkId || ""} items={artwork} onChange={artworkId => setEdit({ ...edit, artworkId })} />
      <label className="check"><input type="checkbox" checked={edit.published} disabled={busy} onChange={e => setEdit({ ...edit, published: e.target.checked })} /> Ready to reveal on {dateLabel(edit.date)}</label>
      <button className="primary" disabled={busy}>Save door</button> <button type="button" disabled={busy} onClick={() => void action(loadEditor)}>Discard edits / reload</button></form>
    </section>}
    {showPeople && <CalendarPeople key={selected} calendarId={selected} api={api} onClose={()=>setShowPeople(false)}/>}
    {!settings&&<>
    <p className="fine">Doors open by the date in {calendar.timezone}. Refresh when a new day begins. Your opened doors stay available online.</p>
    <div className="toolbar" role="group" aria-label="Calendar layout"><button aria-pressed={calendarView} onClick={()=>setCalendarView(true)}>Calendar</button><button aria-pressed={!calendarView} onClick={()=>setCalendarView(false)}>Doors</button></div>
    {calendarView?<MonthDoors calendarId={selected} year={calendar.year} busy={busy} language={language} entries={[
      ...doors.map(d=>({...d,key:`day-${d.number}`,label:d.number===0?"Thanksgiving":d.number===24?"Christmas Eve":d.number===25?"Christmas Day":"",open:()=>{void open(d.number);}})),
      ...traditions.filter(t=>t.date).map((t,i)=>({...t,key:`tradition-${t.id}`,label:({BLACK_FRIDAY:"Black Friday",BOXING_DAY:"Boxing Day",NEW_YEARS_EVE:"New Year’s Eve",NEW_YEARS_DAY:"New Year’s Day"} as Record<string,string>)[t.holidayKey||""]||`Gathering ${i+1}`,open:()=>navigate(selected,`tradition-${t.id}`)}))
    ]}/>:<>
    <AdventDoorGrid busy={busy} language={language} entries={[
      ...doors.map(d=>({...d,key:`day-${d.number}`,label:d.number===0?"Thanksgiving":d.number===24?"Christmas Eve":d.number===25?"Christmas Day":"",open:()=>open(d.number)})),
      ...traditions.filter(t=>t.holidayKey).map(t=>({...t,number:Number(t.date.slice(-2)),key:`tradition-${t.id}`,label:({BLACK_FRIDAY:"Black Friday",BOXING_DAY:"Boxing Day",NEW_YEARS_EVE:"New Year’s Eve",NEW_YEARS_DAY:"New Year’s Day"} as Record<string,string>)[t.holidayKey||""]||"Holiday",open:async()=>{navigate(selected,`tradition-${t.id}`);}}))
    ]}/>
    {traditions.some(t=>!t.holidayKey) && <section className="panel"><h2>Gatherings and family traditions</h2><p>Open each gathering on its date. Your host can set or adjust dates in the tradition planner.</p><div className="toolbar">{traditions.filter(t=>!t.holidayKey).sort((a,b)=>(a.date||"9999").localeCompare(b.date||"9999")).map((t,i) => <button key={t.id} disabled={busy || t.state !== "AVAILABLE"} onClick={() => navigate(selected,`tradition-${t.id}`)}>{t.date ? dateLabel(t.date) : "Date to be chosen"} · {t.state === "AVAILABLE" ? "Open tradition" : t.state === "UNSCHEDULED" ? "Not scheduled" : t.state === "DRAFT" ? "Not ready" : "Not yet"} {i+1}</button>)}</div></section>}
    </>}
    {calendarView&&traditions.some(t=>!t.date)&&<p className="fine">Some gatherings still need dates. Set them in Calendar settings → Plan traditions to place them on the calendar.</p>}
    {readingItem && <ReadingDialog title={content?.title||"Calendar reading"} onClose={closeReading}>
      {readingBusy&&!content&&<p role="status">Opening your door…</p>}{readingError&&<p role="alert" className="error">{readingError}</p>}
      {content&&<><p className="eyebrow">{dateLabel(content.date)} · {calendar.name}</p>{content.image?.url&&<img className="advent-illustration" src={content.image.url} alt={content.image.alt} referrerPolicy="no-referrer"/>}<p className="message">{content.body}</p>
      <div className="toolbar"><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);}catch{setReadingError("Could not copy the link. You can copy it from your browser’s address bar.");}}}>{copied?"Link copied":"Copy link to this day"}</button><span className="fine">Only invited calendar members can open this link.</span></div>
      <DayMeals calendarId={selected} item={readingItem} api={api}/>
      <DayMemories key={`${selected}/${readingItem}`} calendarId={selected} item={readingItem} api={api} uploaded={content.image?.uploaded} onImageHidden={()=>setContent({...content,image:undefined})}/></>}
      <nav className="toolbar" aria-label="Reading navigation"><button disabled={readingBusy||readingIndex<=0} onClick={()=>navigate(selected,availableReadings[readingIndex-1].key,true)}>Previous day</button><button onClick={closeReading}>Back to calendar</button><button disabled={readingBusy||readingIndex<0||readingIndex>=availableReadings.length-1} onClick={()=>navigate(selected,availableReadings[readingIndex+1].key,true)}>Next day</button></nav>
    </ReadingDialog>}
    </>}

    </>}
  </main>;
}
