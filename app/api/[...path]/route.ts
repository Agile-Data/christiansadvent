import { auth0 } from "@/lib/auth0";
async function proxy(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const out = { "Cache-Control": "no-store" };
  const { path } = await context.params;
  // Expose calendars and only the signed-in user’s avatar; never household records.
  if ((path.slice(0, 3).join("/") !== "v1/advent/calendars" && path.slice(0,3).join("/") !== "v1/profile/kitchen" && ! ["v1/profile/avatar", "v1/profile/preferences"].includes(path.join("/"))) || path.some(p => p === "." || p === ".."))
    return new Response(null, { status: 404, headers: out });
  if (request.method !== "GET" && request.headers.get("origin") !== new URL(process.env.APP_URL!).origin)
    return Response.json({ error: "Invalid request origin" }, { status: 403, headers: out });
  let token: string;
  try { token = (await auth0().getAccessToken()).token; }
  catch { return Response.json({ error: "Please sign in again" }, { status: 401, headers: out }); }
  if (!process.env.API_URL) return Response.json({ error: "Calendar service is not configured" }, { status: 503, headers: out });
  try {
    const upload = /^v1\/advent\/calendars\/[a-f0-9-]{36}\/artwork\/upload$/.test(path.join("/"));
    const limit=upload?4_300_000:64*1024;
    let body: Uint8Array | undefined;
    if(request.method!=="GET" && request.body){
      const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
      while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();return Response.json({error:"Request is too large"},{status:413,headers:out});}chunks.push(value);}
      body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
    }
    const upstream = new URL(path.map(encodeURIComponent).join("/"), process.env.API_URL.replace(/\/$/, "") + "/");
    const response = await fetch(upstream, {
      method: request.method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: body as BodyInit | undefined, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(upload?45000:15000),
    });
    return new Response(response.body, { status: response.status, headers: { ...out, "Content-Type": "application/json" } });
  } catch { return Response.json({ error: "The calendar service is unavailable. Please retry." }, { status: 502, headers: out }); }
}
export const GET = proxy, POST = proxy, PUT = proxy, DELETE = proxy;
