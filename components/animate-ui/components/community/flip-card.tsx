'use client';

import { easeOut, motion } from 'motion/react';
import * as React from 'react';

export interface FlipCardData {
  name: string;
  
}

interface FlipCardProps {
  data: FlipCardData;
}

export function FlipCard({ data }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleClick = () => {
    if (isTouchDevice) setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsFlipped(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) setIsFlipped(false);
  };

  const cardVariants = {
    front: { rotateY: 0, transition: { duration: 1, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 1, ease: easeOut } },
  };

  return (
    <div className="relative mt-2 mx-auto w-40 h-60 md:w-60 md:h-60 ">
      {/* Background glow */}
      <motion.div
        className="absolute -inset-6 -z-10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="relative w-full h-full perspective-1000 cursor-pointer"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* FRONT: Profile */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl  px-4 py-6 flex flex-col items-center justify-center bg-white text-center"
          animate={isFlipped ? 'back' : 'front'}
          variants={cardVariants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          
          <h2 className="text-5xl font-bold text-foreground">{data.name}</h2>
          
        </motion.div>

        {/* BACK: Bio + Stats + Socials */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl border-2  px-4 py-6 flex flex-col justify-between items-center gap-y-4 bg-white"
          initial={{ rotateY: 180 }}
          animate={isFlipped ? 'front' : 'back'}
          variants={cardVariants}
          style={{ transformStyle: 'preserve-3d', rotateY: 180 }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full text-center">
  <p className="text-foreground text-sm">
    This is a sample flip card component. You can customize the content on the front and back sides as needed.
  </p>
</div>
        </motion.div>
      </div>
    </div>
  );
}