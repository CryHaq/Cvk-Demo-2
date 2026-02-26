import { TrendingUp, Building2, Users, Store } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '2.108',
    label: 'Clienti',
    year: '2024',
    sublabel: "LET'S KEEP GROWING",
  },
  {
    icon: Building2,
    value: '9.866.900',
    label: 'Buste per',
    sublabel: 'Aziende',
    year: '2023',
    period: 'Giu 19 - Dic 22',
  },
  {
    icon: TrendingUp,
    value: '9.9500',
    label: 'Buste per',
    sublabel: 'Agenzie',
    year: '2023',
    period: 'Giu 19 - Dic 22',
  },
  {
    icon: Store,
    value: '343.500',
    label: 'Buste per',
    sublabel: 'Rivenditori',
    year: '2023',
    period: 'Giu 19 - Dic 22',
  },
];

export default function Statistics() {
  return (
    <section className="w-full bg-[#1a1a2e] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            CVK Dijital è in tutta Europa
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            CVK Dijital è evoluto insieme ai propri clienti crescendo ad un ritmo costante
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#7cb342]/20 flex items-center justify-center group-hover:bg-[#7cb342]/30 transition-colors">
                  <stat.icon className="w-6 h-6 text-[#7cb342]" />
                </div>
              </div>

              {/* Value */}
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-white/60 text-sm mb-1">
                {stat.label}
              </div>
              
              {stat.sublabel && (
                <div className="text-white font-medium mb-2">
                  {stat.sublabel}
                </div>
              )}

              {/* Year & Period */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-[#7cb342] font-semibold text-sm">
                  {stat.year}
                </span>
                {stat.period && (
                  <span className="text-white/40 text-xs">
                    {stat.period}
                  </span>
                )}
              </div>

              {/* Decorative glow */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-[#7cb342]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
