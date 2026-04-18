import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const PRODUCT_LABELS = [
  'Whole Chicken',
  'Boneless',
  'Kaleji',
  'Karahi Cut',
  'Wings',
  'Legs',
  'Breast',
  'Mince',
];

export default function Chicken3DScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyeRef = useRef<HTMLDivElement>(null);
  const [isWinking, setIsWinking] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const eyePos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);

  // Mouse tracking for eye
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    const animate = () => {
      if (eyeRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const eyeCenterX = rect.width / 2 + rect.width * 0.02;
        const eyeCenterY = rect.height / 2 - rect.height * 0.12;

        const maxRadius = 6;
        const dx = mousePos.current.x - eyeCenterX;
        const dy = mousePos.current.y - eyeCenterY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(maxRadius, Math.hypot(dx, dy) / 15);

        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        eyePos.current.x += (targetX - eyePos.current.x) * 0.15;
        eyePos.current.y += (targetY - eyePos.current.y) * 0.15;

        eyeRef.current.style.transform = `translate(${eyePos.current.x}px, ${eyePos.current.y}px)`;

        // Parallax tilt
        const tiltX = ((mousePos.current.y / rect.height) - 0.5) * -6;
        const tiltY = ((mousePos.current.x / rect.width) - 0.5) * 6;
        setTilt({ x: tiltX, y: tiltY });
      }
      animFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    animFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrame.current !== null) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  const handleChickenClick = useCallback(() => {
    if (isWinking) return;
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 300);
  }, [isWinking]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-wm-dark"
      style={{ perspective: '1000px' }}
    >
      {/* Rotating Starburst Ring */}
      <motion.div
        className="absolute"
        style={{
          width: 'min(640px, 80vw)',
          height: 'min(640px, 80vw)',
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'starburst-rotate 30s linear infinite',
          }}
        >
          {PRODUCT_LABELS.map((label, i) => {
            const angle = (i * 360) / 8;
            return (
              <div
                key={label}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(min(280px, 35vw)) translate(-50%, -50%)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="bg-gradient-to-b from-wm-orange to-[#E65000] rounded-lg flex flex-col items-center justify-center gap-1 p-2 shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer"
                  style={{
                    width: 'min(110px, 14vw)',
                    height: 'min(130px, 16vw)',
                    animation: `float 3s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.3}s`,
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <span className="material-icons text-white/80 text-2xl md:text-3xl">
                    {i % 2 === 0 ? 'restaurant_menu' : 'takeout_dining'}
                  </span>
                  <span className="text-white text-[9px] md:text-[10px] font-medium uppercase tracking-wider text-center leading-tight">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Chicken Container */}
      <motion.div
        className="relative z-10 cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
        onClick={handleChickenClick}
      >
        {/* Chicken Body Group with bounce animation */}
        <div
          style={{
            animation: isWinking ? 'none' : 'chicken-bounce 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate',
            width: 'min(320px, 45vw)',
            height: 'min(320px, 45vw)',
            position: 'relative',
          }}
        >
          {/* Tail Feathers */}
          <div
            className="absolute bg-gradient-to-t from-wm-gold to-wm-orange rounded-full"
            style={{
              width: '28%',
              height: '22%',
              right: '-8%',
              top: '18%',
              transform: 'rotate(-20deg)',
              borderRadius: '50% 50% 30% 30%',
            }}
          />
          <div
            className="absolute bg-gradient-to-t from-wm-orange to-wm-gold rounded-full"
            style={{
              width: '24%',
              height: '20%',
              right: '-4%',
              top: '12%',
              transform: 'rotate(-10deg)',
              borderRadius: '50% 50% 30% 30%',
            }}
          />

          {/* Main Body */}
          <div
            className="absolute bg-gradient-to-b from-wm-orange to-[#E65000] shadow-2xl"
            style={{
              width: '65%',
              height: '50%',
              left: '17.5%',
              top: '25%',
              borderRadius: '60% 60% 50% 50% / 70% 70% 40% 40%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 -10px 20px rgba(0,0,0,0.15), inset 0 10px 20px rgba(255,255,255,0.2)',
            }}
          />

          {/* Head */}
          <div
            className="absolute bg-gradient-to-b from-wm-orange to-wm-gold"
            style={{
              width: '32%',
              height: '32%',
              left: '50%',
              top: '8%',
              transform: 'translateX(-50%)',
              borderRadius: '50% 50% 45% 45%',
              boxShadow: '0 5px 15px rgba(0,0,0,0.2), inset 0 5px 10px rgba(255,255,255,0.2)',
            }}
          />

          {/* Comb */}
          <div
            className="absolute bg-wm-orange"
            style={{
              width: '18%',
              height: '10%',
              left: '50%',
              top: '2%',
              transform: 'translateX(-50%)',
              borderRadius: '50% 50% 30% 30%',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            }}
          />

          {/* Eye */}
          <div
            className="absolute bg-white rounded-full flex items-center justify-center overflow-hidden"
            style={{
              width: '10%',
              height: '10%',
              left: '58%',
              top: '16%',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <div
              ref={eyeRef}
              className="bg-black rounded-full relative"
              style={{
                width: '50%',
                height: '50%',
                transform: isWinking ? 'scaleY(0.1)' : 'translate(0, 0)',
                transition: isWinking ? 'transform 0.15s ease-in-out' : 'none',
              }}
            >
              <div
                className="absolute bg-white rounded-full"
                style={{
                  width: '35%',
                  height: '35%',
                  right: '10%',
                  top: '10%',
                }}
              />
            </div>
          </div>

          {/* Beak */}
          <div
            className="absolute bg-wm-gold"
            style={{
              width: '10%',
              height: '8%',
              right: '12%',
              top: '22%',
              clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
              borderRadius: '0 50% 50% 0',
            }}
          />

          {/* Wing Left */}
          <div
            className="absolute bg-gradient-to-b from-wm-orange to-[#E65000]"
            style={{
              width: '22%',
              height: '35%',
              left: '8%',
              top: '30%',
              borderRadius: '50% 20% 50% 20%',
              transform: 'rotate(-15deg)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}
          />

          {/* Wing Right */}
          <div
            className="absolute bg-gradient-to-b from-wm-orange to-[#E65000]"
            style={{
              width: '22%',
              height: '35%',
              right: '8%',
              top: '30%',
              borderRadius: '20% 50% 20% 50%',
              transform: 'rotate(15deg)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}
          />

          {/* Leg Left */}
          <div
            className="absolute bg-gradient-to-b from-wm-gold to-wm-orange"
            style={{
              width: '8%',
              height: '22%',
              left: '35%',
              bottom: '5%',
              borderRadius: '40% 40% 30% 30% / 60% 60% 40% 40%',
              transform: 'rotate(-10deg)',
            }}
          >
            <div
              className="absolute bg-wm-light rounded-full"
              style={{
                width: '140%',
                height: '20%',
                left: '-20%',
                bottom: '-5%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>

          {/* Leg Right */}
          <div
            className="absolute bg-gradient-to-b from-wm-gold to-wm-orange"
            style={{
              width: '8%',
              height: '22%',
              right: '35%',
              bottom: '5%',
              borderRadius: '40% 40% 30% 30% / 60% 60% 40% 40%',
              transform: 'rotate(10deg)',
            }}
          >
            <div
              className="absolute bg-wm-light rounded-full"
              style={{
                width: '140%',
                height: '20%',
                left: '-20%',
                bottom: '-5%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>

          {/* Hot Air Wisp */}
          <svg
            className="absolute"
            style={{
              width: '15%',
              height: '20%',
              left: '42.5%',
              top: '-12%',
            }}
            viewBox="0 0 30 40"
          >
            <path
              d="M15 40 Q 5 30, 15 20 Q 25 10, 15 0"
              fill="none"
              stroke="#FF9E00"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                strokeDasharray: '50',
                strokeDashoffset: '0',
                animation: 'hotAirWisp 3s linear infinite',
                opacity: 0.6,
              }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-light text-wm-light mb-2 tracking-wide">
          WhiteMeatShop
        </h1>
        <p className="text-sm md:text-base text-wm-light/60">
          Click the chicken to say hello!
        </p>
      </motion.div>
    </div>
  );
}
