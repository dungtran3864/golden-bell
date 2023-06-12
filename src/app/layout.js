import "./global.css";
export const metadata = {
  title: "Golden Bell",
  description:
    "A fun game for friends and family to compete intelligence against each other",
  openGraph: {
    title: "Golden Bell",
    description:
      "A fun game for friends and family to compete intelligence against each other",
    url: "https://golden-bell-d3q2.vercel.app/",
    siteName: "Golden Bell",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={"h-screen bg-yellow-300 mx-4"}>{children}</body>
    </html>
  );
}
