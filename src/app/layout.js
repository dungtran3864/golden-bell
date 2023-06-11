import "./global.css";
export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body className={"h-screen bg-yellow-300"}>{children}</body>
    </html>
  )
}
