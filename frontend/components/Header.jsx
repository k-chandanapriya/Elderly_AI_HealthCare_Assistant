import { Heart } from 'lucide-react';

const Header = ({ onTryIt }) => {
  return (
    <header className="absolute top-0 inset-x-0 z-30 bg-[#6d28d9] border-b border-white/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <a href="/" className="flex items-center gap-2 text-white no-underline">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/25 backdrop-blur flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-base sm:text-lg text-white">Elderly Care AI</span>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-white/85 hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#company" className="text-sm font-medium text-white/85 hover:text-white transition-colors">
              Company
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onTryIt}
            className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-transparent border border-white/70 hover:bg-white/10 transition-colors"
          >
            Try It
          </button>
          <button
            onClick={onTryIt}
            className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-[#6d28d9] bg-white hover:bg-[#f3e8ff] transition-colors shadow-lg"
          >
            Book a Call
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
