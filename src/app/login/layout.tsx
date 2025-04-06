import "../globals.css";


export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    {/* <Sidebar /> */}
    <section>{children}</section> 
    </>
  );
}