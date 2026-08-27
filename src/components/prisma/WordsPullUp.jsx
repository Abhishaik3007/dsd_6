import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const WordsPullUp = ({ text, className = '', showAsterisk = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const wordVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {words.map((word, index) => {
        const isLastWord = index === words.length - 1;

        return (
          <span key={index} className="inline-block overflow-hidden mr-[0.25em]">
            <motion.span variants={wordVariants} className="inline-block relative">
              {word}
              {showAsterisk && isLastWord && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none select-none">
                  *
                </span>
              )}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
};

export const WordsPullUpMultiStyle = ({ segments, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  // Prepare list of all words with their respective segment classNames
  const allWords = [];
  segments.forEach(seg => {
    const words = seg.text.split(' ');
    words.forEach(w => {
      if (w.length > 0) {
        allWords.push({ word: w, className: seg.className });
      }
    });
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const wordVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap justify-center ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {allWords.map((item, index) => (
        <span key={index} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span variants={wordVariants} className={`inline-block ${item.className}`}>
            {item.word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};
