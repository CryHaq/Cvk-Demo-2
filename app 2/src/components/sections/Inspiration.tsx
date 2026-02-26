import { Button } from '@/components/ui/button';
import { ArrowRight, Search, MessageSquare, BookOpen, Mail } from 'lucide-react';

export default function Inspiration() {
  return (
    <section className="w-full bg-[#16162a] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Inspiration CTA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Lasciati ispirare dai packaging di CVK Dijital{' '}
            <span className="text-[#7cb342]">#PackyourWay</span>
          </h2>
          <Button
            size="lg"
            className="bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold px-8"
          >
            <Search className="mr-2 w-5 h-5" />
            Cerca ispirazione
          </Button>
        </div>

        {/* Three CTAs Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {/* Custom Quote */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-[#7cb342]/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-[#7cb342]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Cerchi un packaging particolare? Richiedi un preventivo personalizzato
            </h3>
            <Button
              variant="ghost"
              className="text-[#7cb342] hover:text-[#9ccc65] hover:bg-[#7cb342]/10 p-0 h-auto font-medium group"
            >
              Invia la richiesta
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Testimonials */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-[#7c4dff]/20 flex items-center justify-center mb-6">
              <UsersIcon className="w-7 h-7 text-[#7c4dff]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Cerca l'ispirazione per il tuo pack, scopri le storie dei brand che ci hanno scelto
            </h3>
            <Button
              variant="ghost"
              className="text-[#7c4dff] hover:text-[#9575ff] hover:bg-[#7c4dff]/10 p-0 h-auto font-medium group"
            >
              Scopri i testimonial
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Blog */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-[#7cb342]/30 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-[#00bcd4]/20 flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-[#00bcd4]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              I consigli di CVK Dijital sul packaging flessibile personalizzato
            </h3>
            <Button
              variant="ghost"
              className="text-[#00bcd4] hover:text-[#26c6da] hover:bg-[#00bcd4]/10 p-0 h-auto font-medium group"
            >
              Leggi gli articoli
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Newsletter */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#7cb342]/20 to-[#7c4dff]/20 border border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                <Mail className="w-7 h-7 text-[#7cb342]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Iscriviti subito al nostro sito
                </h3>
                <p className="text-white/60">
                  Per te il <span className="text-[#7cb342] font-semibold">5%</span> sulla prossima fornitura di packaging flessibile personalizzato
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-[#7cb342] hover:bg-[#6a9e38] text-white font-semibold px-8 whitespace-nowrap"
            >
              Iscriviti e ottieni lo sconto
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}
