export const dynamic = "force-dynamic";

import Chatbot from "../components/Chatbot";
import PaperBackground from "../components/PaperBackground";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PaperBackground />
      {children}
      <Chatbot />
    </>
  );
}
