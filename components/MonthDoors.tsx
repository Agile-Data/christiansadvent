"use client";
import {useEffect,useState} from "react";
import {AdventMonthCalendar,type CalendarEntry} from "@agile-data/advent";
export default function MonthDoors({year,entries,busy,language,calendarId}:{calendarId:string;year:number;entries:CalendarEntry[];busy:boolean;language:string}){
 const [mealDates,setMealDates]=useState<string[]>([]);
 useEffect(()=>{const controller=new AbortController();setMealDates([]);async function load(){try{const responses=await Promise.all(['meals','occasions'].map(path=>fetch(`/api/v1/advent/calendars/${calendarId}/kitchen/${path}`,{cache:'no-store',signal:controller.signal})));if(responses.some(r=>!r.ok))return;const [meals,occasions]=await Promise.all(responses.map(r=>r.json()));if(!controller.signal.aborted)setMealDates(meals.map((m:{itemKey:string})=>occasions.find((o:{key:string;date:string})=>o.key===m.itemKey)?.date).filter(Boolean));}catch{}}void load();return()=>controller.abort();},[calendarId]);
 return <AdventMonthCalendar year={year} entries={entries} busy={busy} language={language} mealDates={mealDates}/>;
}
