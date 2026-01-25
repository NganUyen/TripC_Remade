import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flight Service Monitor",
};

export default function PingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "monospace" }}>
      {children}
    </div>
  );
}
