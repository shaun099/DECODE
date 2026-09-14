export default function DottedGridBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden bg-[#030604]"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.18) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Subtle atmospheric ambient lighting glows */}
      <div className="pointer-events-none fixed -top-48 left-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[150px]" />
      <div className="pointer-events-none fixed -bottom-48 right-1/4 -z-10 h-96 w-96 rounded-full bg-emerald-600/8 blur-[170px]" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[600px] w-[800px] rounded-full bg-emerald-950/20 blur-[180px]" />

      {children}
    </div>
  );
}