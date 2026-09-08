import Image from "next/image";
import {Card }from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      
      <div className="grid grid-cols-4 gap-6">
  {Array.from({ length: 16 }).map((_, i) => (
    <Card key={i} title={`Card ${i + 1}`} description="Some content here" />
  ))}
</div>
    </div>
  );
}
