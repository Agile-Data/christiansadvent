import { redirect } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import CalendarApp from "@/components/CalendarApp";
export const dynamic = "force-dynamic";
export default async function Page({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if (!(await auth0().getSession())?.user?.sub) redirect("/auth/login?returnTo="+encodeURIComponent(`/calendar/${encodeURIComponent(id)}`));
  return <CalendarApp />;
}
