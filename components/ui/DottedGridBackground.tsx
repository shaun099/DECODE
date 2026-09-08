export default function DottedGridBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#000000",
        backgroundImage:
          "radial-gradient(circle, #0d401f 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {children}
    </div>
  );
}