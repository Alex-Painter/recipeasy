export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-[#F3F5F8] h-full overflow-auto">{children}</div>;
}
