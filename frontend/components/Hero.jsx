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
      <Header onTryIt={onStartChat} />

      <div className="relative z-10 min-h-[100svh] max-w-5xl mx-auto px-6 pt-28 sm:pt-32 pb-24 sm:pb-32 flex flex-col items-center justify-center text-center">
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
        <div className="py-6">
          <p className="text-base sm:text-lg md:text-xl text-[#f3e8ff] max-w-2xl mx-auto leading-relaxed">
            The enterprise healthcare AI assistant that helps handle conversations across voice, text, and chat.
          </p>
        </div>

        <div className="flex flex-col items-center -mt-6 sm:-mt-8">
          <p className="text-xs tracking-[0.2em] font-semibold text-[#d8b4fe] uppercase">Meet Mia</p>
          <div className="relative mt-4 w-48 h-48 sm:w-56 sm:h-56 rounded-full">
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
            className="mt-6 mb-16 sm:mb-24 inline-flex items-center justify-center gap-2 bg-white text-[#6d28d9] px-8 sm:px-10 py-3.5 rounded-full text-base sm:text-lg font-semibold hover:bg-[#f3e8ff] transition-all shadow-[0_8px_35px_rgba(0,0,0,0.32)]"
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
