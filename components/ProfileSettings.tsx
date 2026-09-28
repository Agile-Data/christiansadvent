"use client";
import { FormEvent, useEffect, useState } from "react";
type Preferences = {displayName:string;timezone:string;language:string};
export default function ProfileSettings() {
  const [value,setValue]=useState<Preferences>({displayName:"",timezone:"UTC",language:"en"});
  const [zones,setZones]=useState<string[]>([]),[busy,setBusy]=useState(true),[error,setError]=useState(""),[notice,setNotice]=useState("");
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{let cancelled=false;setZones([...new Set(["UTC",Intl.DateTimeFormat().resolvedOptions().timeZone,...Intl.supportedValuesOf("timeZone")])]);
    Promise.all([fetch("/api/v1/profile/preferences",{cache:"no-store"}).then(async r=>{if(!r.ok)throw new Error("Could not load your profile. Refresh to retry.");return r.json();}),fetch("/auth/profile",{cache:"no-store"}).then(r=>r.ok?r.json():{name:"",nickname:""})])
      .then(([p,u])=>{if(!cancelled){setValue({displayName:p.displayName||u.name||u.nickname||"",timezone:p.timezone||Intl.DateTimeFormat().resolvedOptions().timeZone,language:p.language||"en"});setLoaded(true);}})
      .catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setBusy(false);});return()=>{cancelled=true;};},[]);
  async function save(e:FormEvent){e.preventDefault();setBusy(true);setError("");setNotice("");try{
    const r=await fetch("/api/v1/profile/preferences",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});
    const data=await r.json();if(!r.ok)throw new Error(data.error||"Could not save your profile.");setValue(data);setNotice("Profile saved.");window.dispatchEvent(new Event("profile-updated"));
  }catch(e){setError(e instanceof Error?e.message:"Please retry.");}finally{setBusy(false);}}
  return <main className="calendar-page"><a href="/calendar">← Your calendars</a><h1>Your profile</h1><p>Make Christian’s Advent feel at home, wherever you are.</p>
    {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
    <form className="panel" onSubmit={save}><fieldset disabled={busy||!loaded}>
      <label>Display name<input required maxLength={80} autoComplete="name" value={value.displayName} onChange={e=>setValue({...value,displayName:e.target.value})}/></label>
      <label>Default timezone<input required list="profile-timezones" maxLength={80} value={value.timezone} onChange={e=>setValue({...value,timezone:e.target.value})}/><datalist id="profile-timezones">{zones.map(z=><option key={z} value={z}/>)}</datalist></label>
      <p className="fine">Used when you create a calendar. Existing calendars keep their own timezone so everyone’s doors open together.</p>
      <label>Preferred language<select aria-label="Preferred language" value={value.language} onChange={e=>setValue({...value,language:e.target.value})}><option value="en">English</option><option value="es">Español</option></select></label>
      <p className="fine">Dates use your preferred language. Menus are currently in English; stories and readings stay in the language their author writes.</p>
      <button className="primary">{busy?"Loading or saving…":"Save profile"}</button>
    </fieldset></form><p>Use the profile menu to upload a photo or return to your sign-in photo.</p>
  </main>;
}
