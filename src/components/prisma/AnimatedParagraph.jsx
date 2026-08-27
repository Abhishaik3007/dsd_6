import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const AnimatedLetter = ({ char, progress, range }) => {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{ opacity }}>{char}</motion.span>;
};

export const AnimatedParagraph = ({ text, className = '' }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const characters = text.split('');
  const totalChars = characters.length;

  return (
    <p ref={containerRef} className={className}>
      {characters.map((char, i) => {
        const charProgress = i / totalChars;
        const range = [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)];

        return (
          <AnimatedLetter
            key={i}
            char={char}
            progress={scrollYProgress}
            range={range}
          />
        );
      })}
    </p>
  );
};
