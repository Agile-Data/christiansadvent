"use client";
import {useRef,useState} from "react";
import type {Artwork} from "./TraditionPlanner";
type API=<T>(path:string,method?:string,body?:unknown)=>Promise<T>;
export default function ArtworkUpload({calendarId,api,onUploaded}:{calendarId:string;api:API;onUploaded:(image:Artwork)=>void}){
 const input=useRef<HTMLInputElement>(null),[alt,setAlt]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 async function upload(){setBusy(true);setMessage("");try{
 const file=input.current?.files?.[0];if(!file)throw new Error("Choose a JPEG or PNG image.");
 if(!["image/jpeg","image/png"].includes(file.type)||file.size>15_000_000)throw new Error("Choose a JPEG or PNG under 15 MB.");
 if(!alt.trim())throw new Error("Add a short description of your image.");
 const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw new Error("This browser could not prepare the image.");ctx.fillStyle="white";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const image=canvas.toDataURL("image/jpeg",0.86);const result=await api<{status:string;message:string;image?:Artwork}>(`/${calendarId}/artwork/upload`,"POST",{image,alt});setMessage(result.message);if(result.status==="APPROVED"&&result.image){onUploaded(result.image);if(input.current)input.current.value="";setAlt("");}
 }finally{bitmap.close();}
 }catch(e){setMessage(e instanceof Error?e.message:"Upload could not be completed.");}finally{setBusy(false);}}
 return <div className="upload-panel"><h3>Use your own image</h3><p className="fine">Private to this calendar. Images are checked before sharing with a strict family-safe filter, including swimwear, alcohol, tobacco and violence. Automated screening can make mistakes. Location metadata is removed.</p><label>Family image<input ref={input} type="file" accept="image/jpeg,image/png" disabled={busy}/></label><label>Image description<input value={alt} maxLength={500} disabled={busy} onChange={e=>setAlt(e.target.value)}/></label><button type="button" disabled={busy} onClick={()=>void upload()}>{busy?"Checking image…":"Upload and check image"}</button>{message&&<p role="status">{message}</p>}</div>;
}
