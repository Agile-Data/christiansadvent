import {redirect} from 'next/navigation';
import {auth0} from '@/lib/auth0';
import PersonalRecipeLibrary from '@/components/PersonalRecipeLibrary';
export const dynamic='force-dynamic';
export default async function Page(){if(!(await auth0().getSession())?.user?.sub)redirect('/auth/login?returnTo=%2Fprofile%2Frecipes');return <PersonalRecipeLibrary/>;}
