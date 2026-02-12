/**
 * Landing page - Hello Patient style
 * Hero, value props, and embedded chat section
 */
import { useRef } from 'react';
import Hero from './Hero';
import ValueProps from './ValueProps';
import Chat from './Chat';
import Footer from './Footer';

const Landing = () => {
  const chatSectionRef = useRef(null);

  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <main className="flex-1">
        <Hero onStartChat={scrollToChat} />
        <ValueProps />
        {/* Chat section - "Meet your assistant" style */}
        <section
          id="chat"
          ref={chatSectionRef}
          className="py-16 md:py-24 bg-gradient-to-b from-surface to-secondary/30 scroll-mt-20"
        >
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Have a conversation
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-textmain">
              Meet your AI assistant
            </h2>
            <p className="mt-3 text-textmain/75 max-w-xl">
              Ask about health, medications, wellness tips, or reminders. Designed to be clear and supportive.
            </p>
            <div className="mt-8">
              <Chat embedded />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
