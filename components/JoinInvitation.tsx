"use client";
import {useEffect,useState} from "react";
export default function JoinInvitation(){
  const [ready,setReady]=useState(false),[error,setError]=useState("");
  useEffect(()=>{
    try {
      const code=new URLSearchParams(window.location.hash.slice(1)).get("invite")||sessionStorage.getItem("advent-invitation")||"";
      if(!/^[A-Za-z0-9_-]{32}$/.test(code)){setError("This invitation link is incomplete. Ask your host for a new link.");return;}
      sessionStorage.setItem("advent-invitation",code);history.replaceState(null,"","/join");setReady(true);
    }catch{setError("Enable session storage in this browser to continue with this invitation.");}
  },[]);
  return <main className="calendar-page"><h1>Someone saved you a place.</h1><p>Sign in, choose your name, and join a Christmas calendar with your friends and family.</p>{error&&<p role="alert">{error}</p>}{ready&&<a className="primary" href="/calendar">Continue to your invitation</a>}</main>;
}
