/**
 * Hero - Hello Patient inspired landing hero
 */
import { Mic } from 'lucide-react';
import Header from './Header';

const Hero = ({ onStartChat }) => {
  return (
    <section className="relative min-h-[100svh] overflow-hidden text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#6d28d9_0%,#0f766e_100%)]" />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.10] mix-blend-soft-light bg-[radial-gradient(#ffffff_0.6px,transparent_0.6px)] [background-size:4px_4px]" />

      {/* Floating wave lines at bottom */}
      <div className="absolute inset-[40%_0_0_0] bottom-0 pointer-events-none z-[1]">
        <svg viewBox="0 0 1440 260" className="w-full h-[200px] md:h-[260px]">
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5b3cff" />
              <stop offset="50%" stopColor="#ff3cff" />
              <stop offset="100%" stopColor="#5b3cff" />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3c8cff" />
              <stop offset="50%" stopColor="#9a5bff" />
              <stop offset="100%" stopColor="#3c8cff" />
            </linearGradient>
          </defs>
          <path
            fill="none"
            stroke="url(#waveGradient1)"
            strokeLinecap="round"
            strokeWidth={2.5}
            d="M0,130 C240,50 360,210 540,130 C720,50 960,210 1440,130"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              values="M0,130 C240,50 360,210 540,130 C720,50 960,210 1440,130;M0,130 C240,110 360,150 540,130 C720,110 960,150 1440,130;M0,130 C240,55 360,205 540,130 C720,55 960,205 1440,130;M0,130 C240,110 360,150 540,130 C720,110 960,150 1440,130;M0,130 C240,50 360,210 540,130 C720,50 960,210 1440,130"
            />
          </path>
          <path
            fill="none"
            stroke="url(#waveGradient2)"
            strokeLinecap="round"
            strokeWidth={3}
            d="M0,130 C200,200 420,60 640,130 C860,200 1120,60 1440,130"
          >
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              values="M0,130 C200,200 420,60 640,130 C860,200 1120,60 1440,130;M0,130 C200,120 420,140 640,130 C860,120 1120,140 1440,130;M0,130 C200,195 420,65 640,130 C860,195 1120,65 1440,130;M0,130 C200,120 420,140 640,130 C860,120 1120,140 1440,130;M0,130 C200,200 420,60 640,130 C860,200 1120,60 1440,130"
            />
          </path>
          <path
            fill="none"
            stroke="url(#waveGradient1)"
            strokeLinecap="round"
            strokeWidth={2.5}
            strokeOpacity={0.7}
            d="M0,130 C260,200 420,60 640,130 C860,200 1120,60 1440,130"
          >
            <animate
              attributeName="d"
              dur="14s"
              repeatCount="indefinite"
              calcMode="spline"
              keyTimes="0; 0.25; 0.5; 0.75; 1"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              values="M0,130 C260,200 420,60 640,130 C860,200 1120,60 1440,130;M0,130 C260,120 420,140 640,130 C860,120 1120,140 1440,130;M0,130 C260,195 420,65 640,130 C860,195 1120,65 1440,130;M0,130 C260,120 420,140 640,130 C860,120 1120,140 1440,130;M0,130 C260,200 420,60 640,130 C860,200 1120,60 1440,130"
            />
          </path>
        </svg>
      </div>

      <Header onTryIt={onStartChat} />

      <div className="relative z-10 min-h-[100svh] max-w-3xl mx-auto px-6 pt-28 sm:pt-32 pb-24 sm:pb-32 flex flex-col items-center justify-center text-center">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.4] text-white"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Care that helps every elder
          <br />
          understand, remember, and feel
          <br />
          truly supported.
          <br />
          <span className="font-medium text-white/95">In any language.</span>
        </h1>
        <div className="mt-6 py-4">
          <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Voice-first AI assistant for seniors — medication reminders, health tips, and support in your language.
          </p>
        </div>

        <div className="flex flex-col items-center mt-2 sm:mt-4">
          <p className="text-[11px] tracking-[0.2em] font-semibold text-[#d8b4fe] uppercase">Meet Mia</p>
          <div className="relative mt-3 w-40 h-40 sm:w-44 sm:h-44 rounded-full">
            <div className="absolute inset-0 rounded-full bg-[#a78bfa]/25 blur-3xl shadow-[0_0_40px_rgba(109,40,217,0.2)]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.02)_50%,transparent_70%)]" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="relative flex items-end justify-center gap-[5px] sm:gap-[6px]">
                {[
                  { w: 4, h: 14 },
                  { w: 4, h: 24 },
                  { w: 4, h: 34 },
                  { w: 5, h: 42 },
                  { w: 4, h: 34 },
                  { w: 4, h: 24 },
                  { w: 4, h: 14 },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-full shrink-0"
                    style={{
                      width: `${bar.w}px`,
                      height: `${bar.h}px`,
                      boxShadow: '0 0 8px rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onStartChat}
            className="mt-5 mb-16 sm:mb-24 inline-flex items-center justify-center gap-2 bg-white text-[#6d28d9] px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold hover:bg-[#f3e8ff] transition-all shadow-lg"
          >
            <Mic className="w-5 h-5" />
            Start Talking
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
