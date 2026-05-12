/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Quote, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';


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
    <div className="flex items-center">
      {value.split('').map((char, i) => (
        <RollingDigit key={i} digit={char} delay={i * 0.15} />
      ))}
    </div>
  );
};

const servicesData = [
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
  }
];

const FAQItem = ({ faq }: { faq: { q: string, a: string } }) => {
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

import { projects as fallbackProjects } from '../data/projects';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';
export default function Work() {
  const { t, language, toggleLanguage } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from Firestore
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbProjects(data);
      } catch (e) {
        console.error("Error fetching projects", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const projectsToDisplay = dbProjects.length > 0 ? dbProjects : fallbackProjects;

  const categories = ['All', ...Array.from(new Set(projectsToDisplay.map(p => p.projectType)))];
  
  const filteredProjects = activeFilter === 'All' 
    ? projectsToDisplay 
    : projectsToDisplay.filter(p => p.projectType === activeFilter);

  return (
    <div className={`min-h-screen bg-white selection:bg-brand-red selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Work Hero */}
      <section id="work" className="p-4 md:p-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-brand-dark min-h-[95vh] flex flex-col">
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src="/assets/generated-image (5).png" 
              alt="Work Hero" 
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
                <Badge text={t('our projects')} dark />
              </motion.div>
              <motion.h2 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-white text-6xl md:text-[80px] lg:text-[100px] leading-[1.05] font-medium mt-8 tracking-tight"
              >
                {t('crafting unforgettable experiences')}
              </motion.h2>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 lg:mt-16"
            >
              <Link to="/contact" className="bg-white text-[#1E1E1E] px-8 py-4 h-[52px] rounded-full font-normal flex items-center gap-3 hover:bg-gray-100 transition-all text-xl inline-flex">
                <FlipText>
                  {t('Book A Call')}
                  <div className={`w-5 h-5 bg-black rounded-full flex items-center justify-center -rotate-45 ${language === 'ar' ? 'scale-x-[-1]' : ''}`}>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </FlipText>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-24 lg:py-32 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-20">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-8 py-4 rounded-full text-xl transition-all duration-300 ${
                activeFilter === category 
                  ? 'bg-brand-red text-white' 
                  : 'bg-[#F2F2F2] text-brand-dark hover:bg-gray-200'
              }`}
            >
              {t(category)}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {filteredProjects.map((work, i) => (
            <motion.div 
              key={work.id || i}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex flex-col"
            >
              {i > 0 && <div className="w-full h-px bg-[#D7D7D7] my-16 lg:my-24" />}
              <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                <div className="flex-1 flex flex-col gap-12">
                  <h3 className="text-4xl md:text-5xl font-semibold text-[#1E1E1E]">
                    <Link to={`/project/${work.id}`} className="hover:text-brand-red transition-colors">
                      {work.title}
                    </Link>
                  </h3>
                  
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                      <span className="text-lg font-semibold text-[#6C6C6C] uppercase tracking-wider">{t('Project Type')}</span>
                      <span className="text-xl text-[#1E1E1E]">{t(work.projectType)}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-lg font-semibold text-[#6C6C6C] uppercase tracking-wider">{t('Description')}</span>
                      <p className="text-xl text-[#1E1E1E] leading-relaxed max-w-md">{work.description}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <span className="text-lg font-semibold text-[#6C6C6C] uppercase tracking-wider">{t('Client')}</span>
                      <span className="text-xl text-[#1E1E1E]">{work.client}</span>
                    </div>
                  </div>

                  <Link to={`/project/${work.id}`} className="bg-[#1E1E1E] text-white px-6 py-4 h-[52px] rounded-full font-normal flex items-center justify-center gap-3 w-max hover:opacity-90 transition-opacity text-xl mt-4">
                    <FlipText>
                      {t('View Project')}
                      <div className={`w-5 h-5 bg-white rounded-full flex items-center justify-center ${language === 'ar' ? 'scale-x-[-1]' : ''}`}>
                        <ArrowUpRight className="w-3 h-3 text-[#1E1E1E]" />
                      </div>
                    </FlipText>
                  </Link>
                </div>

                <div className="w-full lg:w-[500px] xl:w-[600px] shrink-0">
                  <Link to={`/project/${work.id}`} className="block aspect-square lg:aspect-auto lg:h-[500px] w-full rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center group">
                    <img 
                      src={work.image} 
                      alt={work.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      loading="lazy"
                      decoding="async"
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-2xl text-gray-500">
              {t('No projects found in this category.')}
            </div>
          )}
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
              <Link to="/" className="hover:text-brand-red transition-colors">{t('Home')}</Link>
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
