/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Quote, Minus, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

interface Review {
  id: string;
  name: string;
  position: string;
  reviewText: string;
  userImage: string;
  companyLogo: string;
  order: number;
}

export const FlipText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="relative overflow-hidden whitespace-nowrap inline-flex items-center"
      initial="initial"
      whileHover="hover"
    >
      <motion.div 
        variants={{ initial: { y: 0 }, hover: { y: "-100%" } }} 
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2"
      >
        {children}
      </motion.div>
      <motion.div 
        className="absolute inset-0 flex items-center gap-2" 
        variants={{ initial: { y: "100%" }, hover: { y: 0 } }} 
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export const Badge = ({ text, dark = false }: { text: string, dark?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-brand-red flex items-center justify-center">
      <Plus className="w-4 h-4 text-white" />
    </div>
    <span className={`text-xl md:text-2xl capitalize ${dark ? 'text-white' : 'text-brand-dark'}`}>{text}</span>
  </div>
);

const RollingDigit = ({ digit, delay = 0 }: { digit: string; delay?: number; key?: number | string }) => {
  if (isNaN(Number(digit))) {
    return (
      <motion.span 
        initial={{ opacity: 0, scale: 0.5 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: delay + 0.5, type: "spring" }}
        className="inline-block"
      >
        {digit}
      </motion.span>
    );
  }
  
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const targetIndex = Number(digit) + 10;
  const targetY = `-${(targetIndex / numbers.length) * 100}%`;
  
  return (
    <div className="relative inline-flex flex-col overflow-hidden h-[1.1em] leading-[1.1em]">
      <motion.div
        initial={{ y: "0%" }}
        whileInView={{ y: targetY }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay }}
        className="flex flex-col"
      >
        {numbers.map((num, i) => (
          <span key={i} className="h-[1.1em] flex items-center justify-center">{num}</span>
        ))}
      </motion.div>
    </div>
  );
};

const RollingNumber = ({ value }: { value: string }) => {
  return (
    <div className="inline-flex items-center" dir="ltr">
      {value.split('').map((char, i) => (
        <RollingDigit key={i} digit={char} delay={i * 0.15} />
      ))}
    </div>
  );
};

export const servicesData = [
  {
    num: '01',
    title: 'UI/UX Design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop',
    subtitle: 'UX/UI Designer',
    description: 'We craft high-impact digital experiences through strategic design, seamless coding, and creative thinking.'
  },
  {
    num: '02',
    title: 'Mobile Design',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Mobile App Designer',
    description: 'Creating intuitive, responsive, and engaging mobile interfaces that users love to interact with every day.'
  },
  {
    num: '03',
    title: 'Development',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Full-Stack Engineering',
    description: 'Building robust, scalable, and high-performance applications using cutting-edge modern technologies.'
  },
  {
    num: '04',
    title: 'Branding Design',
    image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Brand Strategist',
    description: 'Developing cohesive visual identities that tell your unique story and resonate deeply with your audience.'
  },
  {
    num: '05',
    title: 'Printing Service',
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?q=80&w=800&auto=format&fit=crop',
    subtitle: 'Print & Packaging',
    description: 'High-quality print design and merchandising materials that make a tangible impact.'
  }
];

const FAQItem = ({ faq }: { faq: { q: string, a: string }; key?: number | string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div 
      className="bg-[#F2F2F2] rounded-[2rem] px-8 py-6 flex flex-col cursor-pointer hover:bg-gray-200 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <span className="text-xl font-medium text-brand-dark">{faq.q}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[#6C6C6C] text-lg leading-relaxed">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const { t, language, toggleLanguage } = useLanguage();
  const [pricingMode, setPricingMode] = useState<'monthly' | 'annually'>('monthly');
  const [activeService, setActiveService] = useState<number | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [carouselImages, setCarouselImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), orderBy('order', 'asc'));
        const sn = await getDocs(q);
        setReviews(sn.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      } catch (e) {
        console.error("Error fetching reviews:", e);
      }
    };
    const fetchCarouselImages = async () => {
      try {
        const q = query(collection(db, 'carousel'), orderBy('order', 'asc'));
        const sn = await getDocs(q);
        setCarouselImages(sn.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching carousel:", e);
      }
    };
    
    fetchReviews();
    fetchCarouselImages();
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-white selection:bg-brand-red selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* 1. Hero Section */}
      <section id="home" className="p-4 md:p-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-brand-dark min-h-[95vh] flex flex-col">
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
            style={{ willChange: 'transform' }}
          >
            <img 
              src="/assets/HeroSection.png" 
              alt="Background" 
              className="w-full h-full object-cover" 
              fetchpriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          {/* Navbar */}
          <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 flex items-center justify-between p-8 md:px-12 lg:px-20"
          >
            <Link to="/" className="flex items-center">
              <img src="/assets/xzone-logo.png" alt="XZONE Logo" className="h-10 object-contain" />
            </Link>
            <div className="hidden lg:flex items-center gap-12 text-white/90 text-lg">
              <Link to="/" className="hover:text-white transition-colors">{t('Home')}</Link>
              <Link to="/work" className="hover:text-white transition-colors">{t('Work')}</Link>
              <Link to="/about" className="hover:text-white transition-colors">{t('About Us')}</Link>
              <Link to="/contact" className="hover:text-white transition-colors">{t('Contact')}</Link>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleLanguage}
                className="text-white/90 hover:text-white transition-colors flex items-center gap-2 font-medium"
              >
                <Globe className="w-5 h-5" />
                {t('Language')}
              </button>
              <Link to="/contact" className="bg-white text-brand-dark px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors">
                <FlipText>
                  {t('Book A Call')}
                  <div className={`w-6 h-6 rounded-full bg-brand-dark flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  </div>
                </FlipText>
              </Link>
            </div>
          </motion.nav>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-20">
            <div className="max-w-5xl">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-8"
              >
                <Badge text={t('Next-Gen Design Agency')} dark />
              </motion.div>
              <motion.h1 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-white text-6xl md:text-[80px] lg:text-[100px] leading-[1.05] font-medium mb-12 tracking-tight"
              >
                {t('Next-Gen Design Agency For Growing Brands.')}
              </motion.h1>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 mt-auto pt-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap items-center gap-8 lg:gap-16 text-white/90 text-xl lg:text-2xl capitalize"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white flex items-center justify-center">
                    <Plus className="w-3 h-3 text-brand-dark" />
                  </div>
                  {t('define')}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white flex items-center justify-center">
                    <Plus className="w-3 h-3 text-brand-dark" />
                  </div>
                  {t('design')}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white flex items-center justify-center">
                    <Plus className="w-3 h-3 text-brand-dark" />
                  </div>
                  {t('development')}
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="max-w-md lg:text-right"
              >
                <p className="text-white text-2xl lg:text-[28px] leading-snug mb-8">
                  {t('Branding Mobile & Web App Design for Startups and Giants')}
                </p>
                <div className="flex flex-wrap items-center lg:justify-end gap-4">
                  <Link to="/work" className="bg-brand-red text-white px-8 py-4 rounded-full font-medium flex items-center gap-3 hover:bg-brand-red-dark transition-colors text-lg inline-flex">
                    <FlipText>
                      {t('View Projects')}
                      <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                        <ArrowUpRight className="w-3 h-3 text-brand-red" />
                      </div>
                    </FlipText>
                  </Link>
                  <Link to="/contact" className="bg-white text-brand-dark px-8 py-4 rounded-full font-medium flex items-center gap-3 hover:bg-gray-100 transition-colors text-lg inline-flex">
                    <FlipText>
                      {t('Reach Out')}
                      <div className={`w-6 h-6 rounded-full bg-brand-dark flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                        <ArrowUpRight className="w-3 h-3 text-white" />
                      </div>
                    </FlipText>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About & Stats */}
      <section id="about" className="py-24 lg:py-32 px-8 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <div className="mb-24 lg:mb-32">
          <Badge text={t('who are we')} />
          <h2 className="text-4xl md:text-5xl lg:text-[62px] leading-[1.1] font-medium mt-8 max-w-5xl text-brand-dark tracking-tight">
            {t('We build search-first digital systems to help category leaders lead their industries.')}
          </h2>
        </div>

        {/* 3. Image Grid (Moved up & Infinite Scroll) */}
        <div className="mb-24 lg:mb-32 overflow-hidden w-full relative -mx-8 md:-mx-12 lg:-mx-20 px-8 md:px-12 lg:px-20 w-[calc(100%+4rem)] md:w-[calc(100%+6rem)] lg:w-[calc(100%+10rem)]" dir="ltr">
          <div className="flex w-max animate-infinite-scroll gap-[20px]">
            {[...Array(2)].map((_, arrayIndex) => (
              <React.Fragment key={arrayIndex}>
                {(carouselImages.length > 0 ? carouselImages.map(img => img.url) : [
                  "/assets/whoarewe1.png",
                  "/assets/whoarewe2.png",
                  "/assets/whoarewe3.png",
                  "/assets/whoarewe4.png",
                  "/assets/whoarewe1.png",
                  "/assets/whoarewe2.png",
                  "/assets/whoarewe3.png",
                  "/assets/whoarewe4.png"
                ]).map((src, i) => (
                  <div key={i} className="w-[280px] md:w-[320px] lg:w-[380px] aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={src} 
                      alt="Work" 
                      className="w-full h-full object-cover transition-all duration-700 hover:scale-105" 
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {[
            { stat: '1%', title: t('Expert-Vetted'), desc: t('Recognized in the top 1% of freelancers for consistent quality, trust, and expertise.') },
            { stat: '30+', title: t('Clients served'), desc: t('From startups to giants - each treated like our only one.') },
            { stat: '100%', title: t('Success Score'), desc: t('All 5-star reviews. No compromises. No "just okay."') },
            { stat: '8+', title: t('Years of expertise'), desc: t('Deep experience in UX, branding, and growth-driven design for real-world products.') },
          ].map((item, i) => (
            <div key={i} className="flex flex-col gap-8">
              <div className="text-6xl lg:text-[62px] font-medium text-brand-dark">
                <RollingNumber value={item.stat} />
              </div>
              <div className="h-px w-full border-t-2 border-dashed border-gray-300" />
              <div>
                <h3 className="text-2xl font-medium mb-4 text-brand-dark">{item.title}</h3>
                <p className="text-[#6C6C6C] text-lg leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Services */}
      <section id="services" className="bg-brand-dark text-white py-24 lg:py-32 px-8 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-24 mb-24">
            <div className="max-w-3xl">
              <Badge text={t('Services')} dark />
              <h2 className="text-5xl md:text-6xl lg:text-[62px] font-medium mt-8 flex flex-wrap items-center gap-6 leading-[1.1] tracking-tight">
                {t('Our')} 
                <div className="w-24 h-16 rounded-xl overflow-hidden inline-block align-middle">
                  <img 
                    src="/assets/Service.png" 
                    alt="Service" 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {t('Services')}
              </h2>
            </div>
            <p className="text-2xl text-gray-400 max-w-xl leading-relaxed">
              {t('We craft high-impact digital experiences through strategic design, seamless coding, and creative thinking.')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24" onMouseLeave={() => setActiveService(null)}>
            <div className="flex-1 flex flex-col">
              {servicesData.map((service, i) => {
                const isActive = activeService === i;
                return (
                  <div 
                    key={i} 
                    onMouseEnter={() => setActiveService(i)}
                    className={`flex items-center justify-between py-12 border-b border-dashed ${isActive ? 'border-brand-red' : 'border-gray-700'} group cursor-pointer transition-colors duration-300`}
                  >
                    <h3 className={`text-4xl md:text-5xl lg:text-[62px] font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#656464] group-hover:text-white'}`}>
                      {t(service.title)}
                    </h3>
                    <span className={`text-3xl transition-colors duration-300 ${isActive ? 'text-brand-red' : 'text-white group-hover:text-brand-red'}`}>
                      [{service.num}]
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:w-[450px] flex flex-col gap-8">
              <AnimatePresence mode="wait">
                {activeService !== null && (
                  <motion.div
                    key="service-details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-8"
                  >
                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-brand-red relative">
                      <motion.img 
                        key={servicesData[activeService].image}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        src={servicesData[activeService].image} 
                        alt={servicesData[activeService].title} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    </div>
                    <motion.div
                      key={servicesData[activeService].title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <h4 className="text-xl text-[#6C6C6C] mb-4">{t(servicesData[activeService].subtitle)}</h4>
                      <p className="text-2xl leading-relaxed">
                        {t(servicesData[activeService].description)}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>


        </div>
      </section>

      {/* 6. Pricing */}
      <section className="bg-brand-light py-24 lg:py-32 px-8 md:px-12 lg:px-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
            <div>
              <Badge text={t('Pricing Plans')} />
              <h2 className="text-5xl md:text-6xl lg:text-[62px] font-medium mt-8 tracking-tight text-brand-dark">
                {t('Ready to scale your brand?')}
              </h2>
            </div>
            <div className="flex flex-col lg:items-end gap-8">
              <p className="text-xl text-[#6C6C6C] lg:text-right max-w-md leading-relaxed">
                {t('We craft high-impact digital experiences through strategic design, seamless coding, and creative thinking.')}
              </p>
              <div className="bg-white p-2 rounded-full flex items-center self-start lg:self-end">
                <button 
                  onClick={() => setPricingMode('monthly')}
                  className={`px-8 py-3 rounded-full font-medium transition-colors ${pricingMode === 'monthly' ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-gray-100'}`}
                >
                  {t('Monthly')}
                </button>
                <button 
                  onClick={() => setPricingMode('annually')}
                  className={`px-8 py-3 rounded-full font-medium transition-colors ${pricingMode === 'annually' ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-gray-100'}`}
                >
                  {t('Annually')}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-200 flex flex-col">
              <div className="mb-12">
                <h3 className="text-xl uppercase tracking-wider mb-8 font-medium text-brand-dark">{t('Focus')}</h3>
                <div className="text-4xl font-medium mb-4 text-brand-dark">$1,450 /mo</div>
                <p className="text-[#6C6C6C] text-xl">{t('Ideal for early-stage visionaries.')}</p>
              </div>
              <div className="flex-1 flex flex-col mb-12">
                {[t('One active design slot'), t('48-hour average delivery'), t('Direct dashboard collaboration'), t('Full source file ownership')].map((feature, i) => (
                  <div key={i} className="py-6 border-t border-gray-100 text-xl font-light text-brand-dark">
                    {feature}
                  </div>
                ))}
                <div className="border-t border-gray-100" />
              </div>
              <Link to="/work" className="w-full bg-brand-dark text-white py-5 rounded-full font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors text-xl">
                <FlipText>
                  {t('View Projects')}
                  <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                    <ArrowUpRight className="w-3 h-3 text-brand-dark" />
                  </div>
                </FlipText>
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border-2 border-brand-red flex flex-col relative">
              <div className="mb-12">
                <h3 className="text-xl uppercase tracking-wider mb-8 font-medium text-brand-dark">{t('Momentum')}</h3>
                <div className="text-4xl font-medium mb-4 text-brand-dark">$2,350 /mo</div>
                <p className="text-[#6C6C6C] text-xl">{t('Ideal for early-stage visionaries.')}</p>
              </div>
              <div className="flex-1 flex flex-col mb-12">
                {[t('One active design slot'), t('48-hour average delivery'), t('Direct dashboard collaboration'), t('Full source file ownership')].map((feature, i) => (
                  <div key={i} className="py-6 border-t border-gray-100 text-xl font-light text-brand-dark">
                    {feature}
                  </div>
                ))}
                <div className="border-t border-gray-100" />
              </div>
              <Link to="/work" className="w-full bg-brand-red text-white py-5 rounded-full font-medium flex items-center justify-center gap-3 hover:bg-brand-red-dark transition-colors text-xl">
                <FlipText>
                  {t('View Projects')}
                  <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                    <ArrowUpRight className="w-3 h-3 text-brand-red" />
                  </div>
                </FlipText>
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-200 flex flex-col">
              <div className="mb-12">
                <h3 className="text-xl uppercase tracking-wider mb-8 font-medium text-brand-dark">{t('Empire')}</h3>
                <div className="text-4xl font-medium mb-4 text-brand-dark">{t('Custom Pricing')}</div>
                <p className="text-[#6C6C6C] text-xl">{t('Ideal for early-stage visionaries.')}</p>
              </div>
              <div className="flex-1 flex flex-col mb-12">
                {[t('One active design slot'), t('48-hour average delivery'), t('Direct dashboard collaboration'), t('Full source file ownership')].map((feature, i) => (
                  <div key={i} className="py-6 border-t border-gray-100 text-xl font-light text-brand-dark">
                    {feature}
                  </div>
                ))}
                <div className="border-t border-gray-100" />
              </div>
              <Link to="/contact" className="w-full bg-brand-dark text-white py-5 rounded-full font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors text-xl">
                <FlipText>
                  {t('Reach Out')}
                  <div className={`w-6 h-6 rounded-full bg-white flex items-center justify-center ${language === 'ar' ? '-scale-x-100' : ''}`}>
                    <ArrowUpRight className="w-3 h-3 text-brand-dark" />
                  </div>
                </FlipText>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-24 lg:py-32 px-8 md:px-12 lg:px-20 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-32">
          <div className="lg:w-5/12">
            <Badge text={t('who are we')} />
            <h2 className="text-5xl md:text-6xl lg:text-[62px] font-medium mt-8 mb-8 leading-[1.1] tracking-tight text-brand-dark">
              {t('Got questions? We\'ve got answers')}
            </h2>
            <p className="text-xl text-[#6C6C6C] leading-relaxed">
              {t('Everything you need to know about our process, pricing, and how we work together')}
            </p>
          </div>

          <div className="lg:w-7/12 flex flex-col gap-6 w-full">
            {[
              {
                q: t('What services does your agency provide?'),
                a: t('We specialize in end-to-end digital product creation. This includes UI/UX design, mobile and web app development, brand identity, and strategic growth consulting. We build systems that help category leaders dominate their industries.')
              },
              {
                q: t('How do you approach a new project?'),
                a: t('Our process starts with a deep-dive discovery phase to understand your business goals and target audience. We then move into strategic planning, wireframing, high-fidelity design, and finally, robust development and testing.')
              },
              {
                q: t('What is the typical timeline for a project?'),
                a: t('Timelines vary based on scope and complexity. A standard branding or UI/UX project typically takes 4-8 weeks, while full-scale web or mobile app development can range from 3-6 months. We provide detailed roadmaps during discovery.')
              },
              {
                q: t('How much do your services cost?'),
                a: t('We offer flexible pricing models including monthly retainers (starting at $2,350/mo) for ongoing design needs, and custom project-based pricing for larger builds. Every engagement is tailored to deliver maximum ROI.')
              }
            ].map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="bg-brand-dark text-white py-24 lg:py-32 px-4 md:px-8 lg:px-12 m-4 rounded-[2rem]">
        <div className="max-w-[1700px] mx-auto p-8 md:p-12 lg:p-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-24">
            <div className="max-w-2xl">
              <Badge text={t('Collaborations')} dark />
              <h2 className="text-5xl md:text-6xl lg:text-[62px] font-medium mt-8 leading-[1.1] tracking-tight">
                {t('Why people love working with us')}
              </h2>
            </div>
            <p className="text-xl text-gray-300 max-w-md leading-relaxed">
              {t('We don\'t just finish projects; we build success together. Here is what they think of us')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(reviews.length > 0 ? reviews : [
              { name: 'Kira Volkov', position: 'Founder, NovaTech Solutions', userImage: '/assets/Client1.png', companyLogo: '/assets/Logo1.png', reviewText: 'Stripped away the noise and gave our brand a soul. Truly exceptional design thinking.' },
              { name: 'Amelia Chen', position: 'CEO, Vertex Media', userImage: '/assets/Client2.png', companyLogo: '/assets/Logo2.png', reviewText: 'Stripped away the noise and gave our brand a soul. Truly exceptional design thinking.' },
              { name: 'Julian Vance', position: 'CEO, Vertex Media', userImage: '/assets/Client3.png', companyLogo: '/assets/Logo3.png', reviewText: 'Stripped away the noise and gave our brand a soul. Truly exceptional design thinking.' },
            ]).map((testimonial: any, i: number) => (
              <div key={i} className="bg-brand-gray p-8 md:p-10 rounded-[2rem] flex flex-col justify-between min-h-[450px]">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-800">
                    <img 
                      src={testimonial.userImage || testimonial.client} 
                      alt="User" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="w-32 h-12 flex items-center justify-end">
                    {testimonial.companyLogo && (
                      <img 
                        src={testimonial.companyLogo || testimonial.logo} 
                        alt="Logo" 
                        className="h-full object-contain opacity-80" 
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 mb-12 flex-1">
                  <div className="w-8 h-8 bg-brand-red flex items-center justify-center shrink-0">
                    <Quote className="w-4 h-4 text-white rotate-180" />
                  </div>
                  <p className="text-2xl leading-snug font-light">
                    {testimonial.reviewText}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xl font-medium mb-2">{testimonial.name}</h4>
                  <p className="text-[#8F8F8F]">{testimonial.position || testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-12">
            <button className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700">
              <ArrowRight className="w-6 h-6 rotate-180" />
            </button>
            <button className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center hover:bg-gray-800 transition-colors border border-gray-700">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. CTA Section */}
      <section id="contact" className="py-24 px-4 md:px-8 lg:px-12 bg-white">
        <div className="max-w-[1700px] mx-auto flex flex-col items-center text-center">
          {/* Frame 11: Badge */}
          <div className="flex items-center gap-2 mb-8">
             <div className="w-6 h-6 bg-[#DF342C] flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
            <span className="text-2xl font-normal text-[#1E1E1E]">{t('Get Started')}</span>
          </div>

          {/* Transform Your Ideas Today */}
          <h2 className="text-5xl md:text-7xl lg:text-[100px] leading-[1] font-normal text-[#1E1E1E] mb-12 max-w-4xl tracking-tight">
            {t('Transform Your Ideas Today')}
          </h2>

          {/* Frame 7: Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Frame 5: View Projects */}
            <Link to="/work" className="bg-[#DF342C] text-white px-8 py-4 h-[52px] rounded-full font-normal flex items-center gap-3 hover:opacity-90 transition-all text-xl inline-flex">
              <FlipText>
                {t('View Projects')}
                <div className="w-5 h-5 flex items-center justify-center">
                  <ArrowUpRight className={`w-4 h-4 text-white ${language === 'ar' ? '-scale-x-100' : ''}`} />
                </div>
              </FlipText>
            </Link>
            {/* Frame 6: Reach Out */}
            <Link to="/contact" className="bg-[#F2F2F2] text-[#1E1E1E] px-8 py-4 h-[52px] rounded-full font-normal flex items-center gap-3 hover:bg-gray-200 transition-all text-xl inline-flex">
              <FlipText>
                {t('Reach Out')}
                <div className="w-5 h-5 flex items-center justify-center">
                  <ArrowUpRight className={`w-4 h-4 text-[#1E1E1E] ${language === 'ar' ? '-scale-x-100' : ''}`} />
                </div>
              </FlipText>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Redesigned Footer Section */}
      <footer className="p-4 md:p-6">
        <div className="bg-[#0A0A0A] text-white pt-20 pb-12 px-8 md:px-12 lg:px-20 rounded-[1.5rem] relative overflow-hidden">
          {/* Top Bar (Newsletter + Nav) */}
          <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-32">
            {/* Frame 75: Newsletter */}
            <div className="flex flex-col gap-6 w-full lg:w-[435px]">
              <h3 className="text-3xl font-normal">{t('Stay updated with our news')}</h3>
              {/* Frame 74: Input Wrapper */}
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder={t('Enter your email address')} 
                  className="w-full bg-[#1F1F1F] text-white rounded-full px-8 py-4.5 h-[55px] outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-gray-500"
                />
                {/* Rotated Submit Button */}
                <button className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all -rotate-[30deg]`}>
                  <ArrowUpRight className={`w-4 h-4 text-black ${language === 'ar' ? 'rotate-[210deg]' : 'rotate-[30deg]'}`} />
                </button>
              </div>
            </div>

            {/* Frame 76: Navigation Links */}
            <nav className="flex flex-wrap items-center gap-8 lg:gap-12 text-2xl font-normal">
              <a href="#home" onClick={scrollTo('home')} className="hover:text-brand-red transition-colors">{t('Home')}</a>
              <Link to="/work" className="hover:text-brand-red transition-colors">{t('Work')}</Link>
              <Link to="/about" className="hover:text-brand-red transition-colors">{t('About Us')}</Link>
              <Link to="/contact" className="hover:text-brand-red transition-colors">{t('Contact')}</Link>
            </nav>
          </div>

          {/* Big Brand Text */}
          <div className="text-center mb-16 overflow-hidden">
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[170px] leading-[1.1] font-semibold uppercase tracking-tighter text-white inline-block">
              XZONE AGENCY
            </h1>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white/50 text-lg">
            <p>{t('Copyright © XZONE AGENCY')}</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">{t('Privacy Policy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('Terms & Conditions')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
