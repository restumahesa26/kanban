import "./globals.css";

export const metadata = {
  title: "Personal Kanban Board | Task Monitoring App",
  description: "A fast, interactive, and real-time Personal Kanban Board application built with Next.js, Tailwind CSS, and Firebase Firestore.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
