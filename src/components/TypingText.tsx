import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypingTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  pause?: number;
}

const TypingText = ({ texts, className = "", speed = 60, pause = 2000 }: TypingTextProps) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];

    if (!deleting && charIndex < current.length) {
      const timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
      return () => clearTimeout(timeout);
    }

    if (!deleting && charIndex === current.length) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex > 0) {
      const timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
      return () => clearTimeout(timeout);
    }

    if (deleting && charIndex === 0) {
      setDeleting(false);
      setTextIndex((i) => (i + 1) % texts.length);
    }
  }, [charIndex, deleting, textIndex, texts, speed, pause]);

  return (
    <span className={className}>
      {texts[textIndex].slice(0, charIndex)}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle"
      />
    </span>
  );
};

export default TypingText;
