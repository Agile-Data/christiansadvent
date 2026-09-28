"use client";
import {useEffect,useState} from 'react';
import type {API} from './FamilyKitchen';
const choices=[['THANKSGIVING','U.S. Thanksgiving'],['BLACK_FRIDAY','Black Friday'],['BOXING_DAY','Boxing Day'],['NEW_YEARS_EVE','New Year’s Eve'],['NEW_YEARS_DAY','New Year’s Day · January 1 of the following year']];
export default function IncludedHolidays({calendarId,api,onSaved}:{calendarId:string;thanksgiving:boolean;api:API;onSaved:()=>Promise<void>}){
 const [values,setValues]=useState<Record<string,boolean>>({}),[busy,setBusy]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let active=true;api<Record<string,boolean>>(`/${calendarId}/holidays`).then(v=>{if(active)setValues(v);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[calendarId]);
 return <section className="panel"><h2>Included holidays</h2><p>Show or hide holiday doors without deleting their saved text or images.</p>{error&&<p role="alert">{error}</p>}{choices.map(([key,label])=><label className="check" key={key}><input type="checkbox" disabled={busy||values[key]===undefined} checked={values[key]||false} onChange={async e=>{const included=e.target.checked;setBusy(true);setError('');try{await api(`/${calendarId}/holidays/${key}`,'PUT',{included});setValues(await api<Record<string,boolean>>(`/${calendarId}/holidays`));await onSaved();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}/>{label}</label>)}</section>;
}
