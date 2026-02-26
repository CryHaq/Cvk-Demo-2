import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import type { Page } from '../App';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  ctaAction: Page;
  color: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Ambalajınızı\nTasarlayın',
    subtitle: 'Özel Ambalaj Çözümleri',
    description: 'Minimum sipariş limiti olmadan, 24 saatte teslimat. Markanıza özel ambalajlar.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    cta: 'Hemen Başla',
    ctaAction: 'configurator',
    color: '#0077be',
  },
  {
    id: 2,
    title: 'Sürdürülebilir\nGelecek',
    subtitle: 'Eco-Friendly Ambalaj',
    description: '%100 geri dönüştürülebilir malzemelerle çevre dostu ambalaj çözümleri.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
    cta: 'Keşfet',
    ctaAction: 'shop',
    color: '#28a745',
  },
  {
    id: 3,
    title: 'Kaliteli Baskı\nGarantisi',
    subtitle: 'Dijital Baskı Teknolojisi',
    description: 'Son teknoloji dijital baskı ile canlı renkler ve keskin detaylar.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    cta: 'İncele',
    ctaAction: 'design-help',
    color: '#f59e0b',
  },
];

interface HeroSliderProps {
  onNavigate: (page: Page) => void;
}

export default function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeInOut" as const,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.5,
        ease: "easeInOut" as const,
      },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 50 },
    center: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.6, ease: "easeOut" as const }
    },
    exit: { opacity: 0, y: -30, transition: { duration: 0.3 } },
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section 
      className="relative h-[640px] lg:h-[760px] overflow-hidden bg-[#0b1320]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlideData.image})` }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1320] via-[#0b1320]/85 to-[#0b1320]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(0,168,232,0.35),transparent_40%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1320] via-[#0b1320]/25 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-end"
          >
            <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-md p-6 sm:p-8 lg:p-10 max-w-2xl">
              {/* Subtitle */}
              <motion.span 
                className="inline-block px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5 tracking-wide"
                style={{ 
                  backgroundColor: `${currentSlideData.color}25`,
                  color: '#ffffff',
                  border: `1px solid ${currentSlideData.color}70`,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {currentSlideData.subtitle}
              </motion.span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.08] whitespace-pre-line tracking-tight">
                {currentSlideData.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-xl leading-relaxed">
                {currentSlideData.description}
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
                <motion.button
                  onClick={() => onNavigate(currentSlideData.ctaAction)}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-white transition-all shadow-lg"
                  style={{ backgroundColor: currentSlideData.color }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentSlideData.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => onNavigate('free-sample')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white border border-white/30 bg-white/10 hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Ücretsiz Numune
                </motion.button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2.5 text-white/90 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Minimum sipariş yok</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90 text-sm">
                  <Truck className="w-4 h-4 text-cyan-300" />
                  <span>24 saatte teslimat</span>
                </div>
                <div className="flex items-center gap-2.5 text-white/90 text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-300" />
                  <span>Kalite garantisi</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70 mb-2">Bu Ay</p>
                  <p className="text-3xl font-bold text-white">50.000+</p>
                  <p className="text-sm text-white/80 mt-1">tamamlanan özel ambalaj projesi</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70 mb-2">Öne Çıkan</p>
                  <p className="text-lg font-semibold text-white">Stand-Up, Flat Pouch, Roll Film</p>
                  <p className="text-sm text-white/80 mt-1">markanıza göre ölçü, materyal, baskı</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10 border border-white/20"
        aria-label="Önceki slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10 border border-white/20"
        aria-label="Sonraki slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className="group relative h-2 transition-all"
            aria-label={`Slide ${index + 1}`}
          >
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentSlide 
                  ? 'w-8' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
              style={{
                backgroundColor: index === currentSlide ? slide.color : undefined
              }}
            />
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full"
          style={{ backgroundColor: currentSlideData.color }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 6, ease: "linear" }}
          key={currentSlide}
        />
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 hidden lg:flex items-center gap-2 text-white/60 text-sm font-medium">
        <span className="text-white text-lg">{String(currentSlide + 1).padStart(2, '0')}</span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
