import Image from "next/image";
import {Card }from "@/components/ui/card";
import DottedGridBackground from "@/components/ui/DottedGridBackground";
export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center ">
     
      
      <div>
        <div className="grid grid-cols-4 gap-6">
           {Array.from({ length: 16 }).map((_, i) => (
               <Card key={i} title={`Card ${i + 1}`} description="Some content here" />
  ))}
      </div>
      </div>
      
    </div>
    
  );
}
