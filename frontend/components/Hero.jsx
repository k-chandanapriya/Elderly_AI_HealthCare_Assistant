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
      {/* Bottom wavy lines */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 180" className="w-full h-[140px] md:h-[180px]" preserveAspectRatio="none">
          <path d="M0,120 C180,80 300,160 470,130 C640,100 760,40 930,70 C1100,100 1250,150 1440,110" fill="none" stroke="rgba(99,102,241,0.34)" strokeWidth="1.2" />
          <path d="M0,145 C180,105 320,175 500,145 C680,115 810,55 980,85 C1150,115 1270,165 1440,135" fill="none" stroke="rgba(59,130,246,0.28)" strokeWidth="1.2" />
          <path d="M0,168 C200,138 340,186 520,164 C700,142 860,86 1040,112 C1210,137 1320,172 1440,158" fill="none" stroke="rgba(139,92,246,0.24)" strokeWidth="1" />
        </svg>
      </div>

      <Header onTryIt={onStartChat} />

      <div className="relative z-10 min-h-[100svh] max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.07]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Run leaner.
          <br />
          Grow faster.
          <br />
          Deliver better care.
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-[#f3e8ff] max-w-2xl mx-auto leading-relaxed">
          The enterprise healthcare AI assistant that helps handle conversations across voice, text, and chat.
        </p>

        <div className="mt-10 flex flex-col items-center">
          <p className="text-xs tracking-[0.2em] font-semibold text-[#d8b4fe] uppercase">Meet Mia</p>
          <div className="relative mt-5 w-48 h-48 sm:w-56 sm:h-56 rounded-full">
            <div className="absolute inset-0 rounded-full bg-[#a78bfa]/50 blur-3xl shadow-[0_0_65px_rgba(109,40,217,0.4)]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.04)_60%,transparent_72%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="84" height="28" viewBox="0 0 84 28" fill="none" aria-hidden="true">
                <path d="M2 14h6l4-8 6 16 6-20 6 24 6-16 6 10 6-6h6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <button
            onClick={onStartChat}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-white text-[#6d28d9] px-8 sm:px-10 py-3.5 rounded-full text-base sm:text-lg font-semibold hover:bg-[#f3e8ff] transition-all shadow-[0_8px_35px_rgba(0,0,0,0.32)]"
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
