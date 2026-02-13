/**
 * Value props - Hello Patient style “Run leaner / Grow faster / Improve care”
 */
import { MessageCircle, TrendingUp, Heart } from 'lucide-react';

const cards = [
  {
    icon: MessageCircle,
    title: 'Run leaner',
    subtitle: 'Relieve the pressure to do more with less',
    stat: '24/7',
    statLabel: 'support for health questions and reminders',
  },
  {
    icon: TrendingUp,
    title: 'Grow stronger',
    subtitle: 'Better engagement with simple, friendly AI',
    stat: 'Clear',
    statLabel: 'answers about medications and wellness',
  },
  {
    icon: Heart,
    title: 'Improve care',
    subtitle: 'Make wellbeing your north star',
    stat: 'Gentle',
    statLabel: 'tips and reminders designed for seniors',
  },
];

const ValueProps = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">Built for elderly care</p>
        <h2 className="mt-2 text-3xl md:text-4xl font-bold text-textmain">
          You know the chaos. So do we.
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {cards.map(({ icon: Icon, title, subtitle, stat, statLabel }) => (
            <div
              key={title}
              className="p-8 rounded-2xl border border-secondary bg-white/80 hover:border-accent/40 hover:bg-white transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-textmain">{title}</h3>
              <p className="mt-2 text-textmain/75">{subtitle}</p>
              <p className="mt-4 text-2xl font-bold text-primary">{stat}</p>
              <p className="text-sm text-textmain/65">{statLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
