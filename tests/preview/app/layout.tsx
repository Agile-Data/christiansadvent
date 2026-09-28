import "../../../app/globals.css";
import ProfileMenu from "../../../components/ProfileMenu";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ProfileMenu />{children}</body></html>;
}
