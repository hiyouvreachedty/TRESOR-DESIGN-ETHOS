/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';

const AnimatedFlame: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const preElement = preRef.current;
    if (!preElement) return;

    const width = 15;
    const height = 15;
    const chars = '.:*@#';
    
    // Generate points for a flame shape (like a teardrop)
    const points = [];
    const pointCount = 100;
    for (let i = 0; i < pointCount; i++) {
        const t = Math.random() * 2 * Math.PI; // angle for xz plane
        const r = Math.sqrt(Math.random()); // radius, sqrt for more points in center
        const y = r * r; // y goes from 0 to 1, squared to have more points at the bottom
        
        points.push({
            x: Math.cos(t) * (1 - y) * 0.8, // radius shrinks with height
            y: (y - 0.5) * 2, // map to -1 to 1 range
            z: Math.sin(t) * (1 - y) * 0.8,
        });
    }

    let angleY = 0;

    const animate = (time: number) => {
      // Further reduced multipliers to slow down the animation significantly
      angleY = time * 0.0001;

      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      
      const grid = Array.from({ length: height }, () => Array(width).fill(' '));
      const zBuffer = Array.from({ length: height }, () => Array(width).fill(-Infinity));

      points.forEach(p => {
        // Add flickering/upward motion - further reduced time multipliers
        const flickerY = Math.sin(time * 0.00134 + p.y * 5) * 0.1;
        const flickerX = Math.sin(time * 0.0008 + p.y * 3) * 0.1;

        const warpedY = p.y + flickerY;
        const warpedX = p.x + flickerX;

        // Rotate Y
        let rotY_x = warpedX * cosY - p.z * sinY;
        let rotY_z = warpedX * sinY + p.z * cosY;

        const z = rotY_z + 3;
        if (z <= 0) return;

        const scale = 8 / z; // perspective scaling
        const x = Math.round(rotY_x * scale + width / 2);
        const y = Math.round(-warpedY * scale * 1.2 + height * 0.8); // scale Y more, shift down

        if (x >= 0 && x < width && y >= 0 && y < height) {
          if (z > zBuffer[y][x]) {
            zBuffer[y][x] = z;
            grid[y][x] = chars[Math.floor(Math.random() * chars.length)];
          }
        }
      });
      
      const output = grid.map(row => row.join('')).join('\n');
      preElement.textContent = output;

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <pre ref={preRef} className="flame-icon" aria-label="Animated 3D ASCII flame icon"></pre>
  );
};

export default AnimatedFlame;