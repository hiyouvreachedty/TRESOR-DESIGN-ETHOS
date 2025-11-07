/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';

const AnimatedLogo: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const preElement = preRef.current;
    if (!preElement) return;

    const width = 80;
    const height = 30;
    
    // 3D points for a cube
    const points = [
        { x: -1, y: -1, z: -1 },
        { x: 1, y: -1, z: -1 },
        { x: 1, y: 1, z: -1 },
        { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 },
        { x: 1, y: -1, z: 1 },
        { x: 1, y: 1, z: 1 },
        { x: -1, y: 1, z: 1 },
    ];

    // Edges connecting the vertices of the cube
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // back face
        [4, 5], [5, 6], [6, 7], [7, 4], // front face
        [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    ];
    
    const shadeChars = '.:-~=+*#%@';
    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    const animate = (time: number) => {
      angleX = time * 0.0003;
      angleY = time * 0.0002;
      angleZ = time * 0.0001;
      
      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      const sinZ = Math.sin(angleZ);
      const cosZ = Math.cos(angleZ);
      
      const projectedPoints = points.map(p => {
        // Rotate Y
        let rotY_x = p.x * cosY - p.z * sinY;
        let rotY_z = p.x * sinY + p.z * cosY;
        // Rotate X
        let rotX_y = p.y * cosX - rotY_z * sinX;
        let rotX_z = p.y * sinX + rotY_z * cosX;
        // Rotate Z
        let rotZ_x = rotY_x * cosZ - rotX_y * sinZ;
        let rotZ_y = rotY_x * sinZ + rotX_y * cosZ;

        const z = rotX_z + 5; // move away from camera
        if (z <= 0) return null;

        const scale = 10 / z; // perspective scaling
        const x = rotZ_x * scale + width / 2;
        const y = -rotZ_y * scale + height / 2;

        return { x, y, z };
      });
      
      const grid = Array.from({ length: height }, () => Array(width).fill(' '));

      edges.forEach(edge => {
        const p1 = projectedPoints[edge[0]];
        const p2 = projectedPoints[edge[1]];
        if (!p1 || !p2) return;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance);
        
        const avgZ = (p1.z + p2.z) / 2;
        // Map Z depth to a character for shading
        const shadeIndex = Math.floor(Math.max(0, Math.min(shadeChars.length - 1, (avgZ / 4) * shadeChars.length)));
        const char = shadeChars[shadeIndex];

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          const x = Math.round(p1.x + t * dx);
          const y = Math.round(p1.y + t * dy);
          if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = char;
          }
        }
      });
      
      const output = grid.map(row => row.join('')).join('\n');
      
      // Update with new, symmetrically spaced text
      preElement.textContent = `
          T R Ē S O R   D Ẽ S I G N

${output}
`;

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
    <pre ref={preRef} className="ascii-art" aria-label="Animated TRĒSOR DẼSIGN Logo"></pre>
  );
};

export default AnimatedLogo;