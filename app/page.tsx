import DottedGridBackground from "./components/ui/DottedGridBackground";

export default function Home() {
  return (
    <DottedGridBackground>
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen font-sans">
        <h1 className="text-white text-9xl font-bold">DECODE</h1>
      </div>
    </DottedGridBackground>
  );
}