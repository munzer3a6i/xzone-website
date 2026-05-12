import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { FlipText, Badge, servicesData } from './Home';

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../contexts/LanguageContext';

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image: string;
  order: number;
}

export default function About() {
  const { t, language, toggleLanguage } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeService, setActiveService] = useState<number | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const q = query(collection(db, 'teamMembers'), orderBy('order', 'asc'));
        const sn = await getDocs(q);
        setTeamMembers(sn.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember)));
      } catch (e) {
        console.error(e);
      }
    };
    fetchTeam();
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-white selection:bg-brand-red selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section id="about" className="p-4 md:p-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-brand-dark min-h-[95vh] flex flex-col">
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src="/assets/HeroSection.png" 
              alt="About Hero" 
              className="w-full h-full object-cover"
              loading="lazy"
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

          <div className="relative z-10 flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-20">
            <div className="max-w-5xl">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge text={t('About the company')} dark />
              </motion.div>
              <motion.h2 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-6xl md:text-7xl lg:text-[100px] leading-[1.08] font-normal mt-8 tracking-tight text-white"
              >
                {t('Digital Creative Agency')}
              </motion.h2>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 lg:py-32 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mb-24"
        >
          <Badge text={t('founded in 2024')} />
          <p className="text-xl md:text-2xl text-[#6C6C6C] leading-relaxed mt-8">
            {t('Breakpoint is a dynamic creative agency that transforms brands through innovative storytelling, cutting-edge technology, and data-driven strategies. Since 2020, we\'ve been crafting unforgettable experiences that resonate, inspire, and drive extraordinary results for businesses worldwide.')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="mb-24 lg:mb-32">
          <div className="mb-12">
            <Badge text={t('Numbers')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                value: '1%',
                title: t('Expert-Vetted'),
                desc: t('Recognized in the top 1% of freelancers for consistent quality, trust, and expertise.')
              },
              {
                value: '30+',
                title: t('Clients served'),
                desc: t('From startups to giants - each treated like our only one.')
              },
              {
                value: '100%',
                title: t('Success Score'),
                desc: t('All 5-star reviews. No compromises. No "just okay."')
              },
              {
                value: '8+',
                title: t('Years of expertise'),
                desc: t('Deep experience in UX, branding, and growth-driven design for real-world products.')
              }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex flex-col gap-8"
              >
                <div className="text-6xl md:text-7xl font-normal text-[#1E1E1E]">
                  {stat.value}
                </div>
                <div className="w-full h-0 border-t-2 border-dashed border-[#D7D7D7]"></div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-2xl text-[#1E1E1E] capitalize">{stat.title}</h4>
                  <p className="text-lg text-[#6C6C6C] leading-snug">
                    {stat.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section (Dark Background) */}
      <section className="p-4 md:p-6 mb-24 lg:mb-32">
        <div className="bg-[#0A0A0A] rounded-[2rem] pt-20 pb-32 px-8 md:px-12 lg:px-20">
          <div className="max-w-[1700px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
              {/* Left Column */}
              <div className="flex-1">
                <Badge text={t('Services')} dark />
                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <h2 className="text-6xl md:text-7xl font-normal text-white">{t('Our')}</h2>
                  <div className="w-24 h-[68px] rounded-lg overflow-hidden bg-gray-800 hidden md:block">
                    <img src="/assets/Service.png" alt="Service design" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-6xl md:text-7xl font-normal text-white">{t('Services')}</h2>
                </div>
                
                <div className="mt-16 flex flex-col w-full max-w-3xl" onMouseLeave={() => setActiveService(null)}>
                  {servicesData.map((service, i) => {
                    const isActive = activeService === i;
                    return (
                      <div 
                        key={i} 
                        onMouseEnter={() => setActiveService(i)}
                        className={`flex items-center justify-between py-12 border-b border-dashed ${isActive ? 'border-[#D34242]' : 'border-white/20'} group cursor-pointer transition-colors duration-300`}
                      >
                        <h3 className={`text-4xl md:text-5xl lg:text-6xl font-semibold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{t(service.title)}</h3>
                        <span className={`text-2xl md:text-3xl transition-colors duration-300 ${isActive ? 'text-[#D34242]' : 'text-white group-hover:text-[#D34242]'}`}>[{service.num}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:w-[450px] shrink-0 pt-16 lg:pt-32 flex flex-col gap-8">
                <p className="text-2xl text-white leading-snug mb-16 max-w-sm">
                  {t('We craft high-impact digital experiences through strategic design, seamless coding, and creative thinking.')}
                </p>

                <AnimatePresence mode="wait">
                  {activeService !== null && (
                    <motion.div
                      key="service-details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-8 w-full"
                    >
                      <div className="rounded-3xl overflow-hidden bg-[#D34242] relative aspect-[4/3]">
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
                        className="p-8"
                      >
                        <h4 className="text-xl text-white/70 mb-3">{t(servicesData[activeService].subtitle)}</h4>
                        <p className="text-2xl text-white leading-snug">
                          {t(servicesData[activeService].description)}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 lg:py-32 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <div className="mb-20">
          <Badge text={t('Creative Team')} />
          <h2 className="text-6xl md:text-7xl font-normal text-[#1E1E1E] mt-8 max-w-3xl leading-[1.1]">
            {t('Passionate professionals from diverse backgrounds')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-24">
          {teamMembers.length > 0 ? (
            teamMembers.map((member, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden mb-8">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span>{t('No image')}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-normal text-[#1E1E1E] mb-2">{member.name}</h3>
                <p className="text-lg text-[#6C6C6C] text-center">{member.occupation}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-lg col-span-3 text-center py-12">{t('Team members will be displayed here soon.')}</p>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="p-4 md:p-6">
        <div className="bg-[#0A0A0A] text-white pt-20 pb-12 px-8 md:px-12 lg:px-20 rounded-[1.5rem] relative overflow-hidden">
          {/* Top Bar (Newsletter + Nav) */}
          <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-32 relative z-10">
            {/* Newsletter */}
            <div className="flex flex-col gap-6 w-full lg:w-[435px]">
              <h3 className="text-3xl font-normal">{t('Stay updated with our news')}</h3>
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder={t('Enter your email address')} 
                  className="w-full bg-[#1F1F1F] text-white rounded-full px-8 py-4.5 h-[55px] outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-gray-500"
                />
                <button className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all -rotate-[30deg]`}>
                  <ArrowUpRight className={`w-4 h-4 text-black ${language === 'ar' ? 'rotate-[210deg]' : 'rotate-[30deg]'}`} />
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center gap-8 lg:gap-12 text-2xl font-normal">
              <Link to="/" className="hover:text-brand-red transition-colors">{t('Home')}</Link>
              <Link to="/work" className="hover:text-brand-red transition-colors">{t('Work')}</Link>
              <Link to="/about" className="hover:text-brand-red transition-colors">{t('About Us')}</Link>
              <Link to="/contact" className="hover:text-brand-red transition-colors">{t('Contact')}</Link>
            </nav>
          </div>

          {/* Big Brand Text */}
          <div className="text-center mb-16 overflow-hidden relative z-10">
            <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[170px] leading-[1.1] font-semibold uppercase tracking-tighter text-white inline-block">
              XZONE AGENCY
            </h1>
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block">
            <img src="/assets/generated-image (5).png" alt="" className="w-full h-full object-cover" />
          </div>

          {/* Bottom Bar */}
          <div className="max-w-[1700px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-white/50 text-lg relative z-10">
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
