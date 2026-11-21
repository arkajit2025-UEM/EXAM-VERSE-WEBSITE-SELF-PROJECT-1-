import React, { useState } from 'react';

interface Logo3DProps {
  size?: 'sm' | 'lg';
}

export function Logo3D({ size = 'sm' }: Logo3DProps) {
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  const dim = size === 'sm' ? 32 : 76;
  const half = dim / 2;
  const depth = size === 'sm' ? 14 : 34;
  const halfDepth = depth / 2;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -ny * 36 - 12,
      y: nx * 48 - 18,
    });
  }

  function handleMouseLeave() {
    setTilt(null);
  }

  const cubeStyle: React.CSSProperties = tilt
    ? {
        width: `${dim}px`,
        height: `${dim}px`,
        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }
    : {
        width: `${dim}px`,
        height: `${dim}px`,
      };

  return (
    <div
      className="ev-scene select-none inline-flex items-center justify-center shrink-0"
      style={{ width: `${dim + 8}px`, height: `${dim + 8}px` }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-hidden="true"
    >
      <div
        className={`ev-cube relative ${tilt ? '' : 'ev-cube-idle'}`}
        style={cubeStyle}
      >
        {/* Front Hardcover Face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-[4px] border border-blue-300/40 bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0F172A] text-white shadow-inner"
          style={{
            transform: `translateZ(${halfDepth}px)`,
          }}
        >
          <span
            className="font-display font-bold tracking-tight leading-none"
            style={{ fontSize: size === 'sm' ? '12px' : '26px' }}
          >
            EV
          </span>
          {size === 'lg' && (
            <span className="mt-1 h-[2px] w-7 bg-amber-400/90 rounded-full" />
          )}
        </div>

        {/* Back Hardcover Face */}
        <div
          className="absolute inset-0 rounded-[4px] bg-[#0F172A] border border-slate-700"
          style={{
            transform: `rotateY(180deg) translateZ(${halfDepth}px)`,
          }}
        />

        {/* Right Page Block (Ivory Paper Stack) */}
        <div
          className="absolute top-[2px] bottom-[2px] bg-gradient-to-r from-[#F8FAFC] via-[#E2E8F0] to-[#CBD5E1] border-y border-slate-300"
          style={{
            width: `${depth}px`,
            left: `${half - halfDepth}px`,
            transform: `rotateY(90deg) translateZ(${half}px)`,
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(15,23,42,0.12) 0px, rgba(15,23,42,0.12) 1px, transparent 1px, transparent 3px)',
          }}
        />

        {/* Left Book Spine (Cobalt & Gold Rib) */}
        <div
          className="absolute top-0 bottom-0 bg-gradient-to-b from-[#172554] via-[#1E3A8A] to-[#0F172A] border-y border-blue-400/30 flex flex-col justify-between py-1 items-center"
          style={{
            width: `${depth}px`,
            left: `${half - halfDepth}px`,
            transform: `rotateY(-90deg) translateZ(${half}px)`,
          }}
        >
          <span className="w-2/3 h-[2px] bg-amber-400/85 rounded-full" />
          <span className="w-2/3 h-[2px] bg-amber-400/85 rounded-full" />
        </div>

        {/* Top Page Edge */}
        <div
          className="absolute left-[1px] right-[1px] bg-[#F1F5F9] border-x border-slate-300"
          style={{
            height: `${depth}px`,
            top: `${half - halfDepth}px`,
            transform: `rotateX(90deg) translateZ(${half}px)`,
          }}
        />

        {/* Bottom Hardcover Edge */}
        <div
          className="absolute left-0 right-0 bg-[#0F172A]"
          style={{
            height: `${depth}px`,
            top: `${half - halfDepth}px`,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
          }}
        />
      </div>
    </div>
  );
}
