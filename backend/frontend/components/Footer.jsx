/**
 * Footer - Hello Patient style simple footer
 */
const Footer = () => {
  return (
    <footer id="company" className="bg-textmain text-surface/85 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-surface">Elderly Care AI</span>
            <span className="text-surface/50">|</span>
            <span className="text-sm">AI-powered healthcare assistant</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#how-it-works" className="hover:text-secondary transition-colors">How it works</a>
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
          </div>
        </div>
        <p className="mt-6 text-xs text-surface/60 text-center md:text-left">
          For informational support only. Always consult a healthcare professional for medical advice.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
