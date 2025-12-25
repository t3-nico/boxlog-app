'use client';

import { useEffect, useRef, useState } from 'react';

export function useAnimationPerformance() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let animationId: number;

    const measureFPS = () => {
      frameCount.current++;
      const now = performance.now();

      if (now - lastTime.current >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setFps(currentFPS);
        frameCount.current = 0;
        lastTime.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return { fps };
}
