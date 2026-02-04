import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: 'circle' | 'ring' | 'dot';
  color: 'blue' | 'gold';
}

const FloatingElements = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const generated: FloatingElement[] = [];
    
    for (let i = 0; i < 20; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 60 + 20,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
        type: ['circle', 'ring', 'dot'][Math.floor(Math.random() * 3)] as FloatingElement['type'],
        color: Math.random() > 0.5 ? 'blue' : 'gold',
      });
    }
    
    setElements(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        >
          {el.type === 'circle' && (
            <div
              className="w-full h-full rounded-full"
              style={{
                background: el.color === 'blue' 
                  ? 'radial-gradient(circle, hsl(217 91% 60% / 0.1) 0%, transparent 70%)'
                  : 'radial-gradient(circle, hsl(45 93% 58% / 0.1) 0%, transparent 70%)',
              }}
            />
          )}
          {el.type === 'ring' && (
            <div
              className="w-full h-full rounded-full border"
              style={{
                borderColor: el.color === 'blue' 
                  ? 'hsl(217 91% 60% / 0.15)'
                  : 'hsl(45 93% 58% / 0.15)',
              }}
            />
          )}
          {el.type === 'dot' && (
            <div
              className="w-2 h-2 rounded-full mx-auto my-auto"
              style={{
                background: el.color === 'blue' 
                  ? 'hsl(217 91% 60% / 0.4)'
                  : 'hsl(45 93% 58% / 0.4)',
                boxShadow: el.color === 'blue'
                  ? '0 0 20px hsl(217 91% 60% / 0.3)'
                  : '0 0 20px hsl(45 93% 58% / 0.3)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
