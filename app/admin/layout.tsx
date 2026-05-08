export const dynamic = "force-dynamic";

import Chatbot from "../components/Chatbot";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Chatbot />
    </>
  );
}
