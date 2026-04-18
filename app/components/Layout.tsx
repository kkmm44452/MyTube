import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main style={{ marginLeft: 240, paddingTop: 60 }}>{children}</main>
      <BottomNav />
    </>
  );
}