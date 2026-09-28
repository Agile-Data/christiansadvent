"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

export default function ProfileMenu() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ sub: string; name?: string; nickname?: string; email?: string; picture?: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/auth/profile", { cache: "no-store", signal: controller.signal })
      .then(async response => response.ok ? response.json() : null)
      .then(setUser).catch(() => {}).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setCustom("");
    if (!user?.sub) return;
    const controller = new AbortController();
    fetch("/api/v1/profile/avatar", { cache: "no-store", signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setCustom(data.avatar || ""))
      .catch(() => { /* Provider avatar remains usable when the API is unavailable. */ });
    return () => controller.abort();
  }, [user?.sub]);
  const [preferredName,setPreferredName]=useState("");
  useEffect(()=>{if(!user?.sub)return;let cancelled=false;
    const load=()=>fetch("/api/v1/profile/preferences",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(p=>{if(!cancelled&&p)setPreferredName(p.displayName||"");}).catch(()=>{});
    void load();window.addEventListener("profile-updated",load);return()=>{cancelled=true;window.removeEventListener("profile-updated",load);};
  },[user?.sub]);
  if (loading || !user) return <a href="/auth/login">Sign in</a>;
  const name = preferredName || user.name || user.nickname || "Your account";
  const picture = typeof user.picture === "string" && user.picture.startsWith("https://") ? user.picture : undefined;
  async function save(avatar?: string) {
    const response = await fetch("/api/v1/profile/avatar", {
      method: avatar ? "PUT" : "DELETE", headers: { "Content-Type": "application/json" },
      body: avatar ? JSON.stringify({ avatar }) : undefined,
    });
    if (!response.ok) throw new Error("Your photo could not be saved. Please try again.");
    const data = await response.json(); setCustom(data.avatar || "");
  }
  async function upload(file?: File) {
    if (!file) return;
    setError(""); setBusy(true);
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024)
        throw new Error("Choose a JPEG, PNG, or WebP photo smaller than 10 MB.");
      const bitmap = await createImageBitmap(file);
      try {
        const canvas = document.createElement("canvas"); canvas.width = canvas.height = 128;
        const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Unable to read this photo.");
        const side = Math.min(bitmap.width, bitmap.height);
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 128, 128);
        ctx.drawImage(bitmap, (bitmap.width-side)/2, (bitmap.height-side)/2, side, side, 0, 0, 128, 128);
        await save(canvas.toDataURL("image/jpeg", .85));
      } finally { bitmap.close(); }
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update your photo."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="profile-control">
    <Tooltip title="Your profile"><IconButton id="profile-trigger" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={Boolean(anchor)} aria-controls={anchor ? "profile-menu" : undefined} onClick={e => setAnchor(e.currentTarget)}>
      <Avatar src={custom || picture} alt={name} sx={{ width: 38, height: 38, bgcolor: "#173f35" }}>{name.slice(0, 1).toUpperCase()}</Avatar>
    </IconButton></Tooltip>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="Choose profile photo" onChange={e => void upload(e.target.files?.[0])} />
    <Menu id="profile-menu" anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
      <Box sx={{ px: 2, py: 1, maxWidth: 280 }}><Typography sx={{ fontWeight: 600 }}>{name}</Typography><Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{user.email}</Typography></Box>
      <Divider />
      <MenuItem component="a" href="/profile"><ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>Profile</MenuItem>
      <MenuItem component="a" href="/profile/recipes"><ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>My recipes &amp; meals</MenuItem>
      <MenuItem disabled={busy} onClick={() => { setAnchor(null); input.current?.click(); }}><ListItemIcon><AddAPhotoOutlinedIcon fontSize="small" /></ListItemIcon>{busy ? "Saving photo…" : "Upload profile photo"}</MenuItem>
      {custom && <MenuItem disabled={busy} onClick={async () => { setAnchor(null); setBusy(true); setError(""); try { await save(); } catch { setError("Your photo could not be removed. Please try again."); } finally { setBusy(false); } }}><ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>Use sign-in photo</MenuItem>}
      <Divider />
      <MenuItem component="a" href="/auth/logout"><ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>Sign out</MenuItem>
    </Menu>
    {error && <p role="alert" className="profile-error">{error}</p>}
  </div>;
}
