import React from 'react';
import { ArrowUpRight, ArrowRight, ArrowDownRight, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { FlipText, Badge } from './Home';
import { useLanguage } from '../contexts/LanguageContext';

export default function Contact() {
  const { t, language, toggleLanguage } = useLanguage();
  return (
    <div className={`min-h-screen bg-white selection:bg-brand-red selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section id="contact" className="p-4 md:p-6">
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
              alt="Contact Hero" 
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
                <Badge text={t('Contact us')} dark />
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

      {/* Contact Section */}
      <section className="py-24 lg:py-32 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 max-w-6xl mx-auto">
          {/* Form */}
          <motion.div 
            initial={{ x: language === 'ar' ? 40 : -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col gap-12"
          >
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl md:text-5xl font-normal text-[#1E1E1E]">{t('Send us a message')}</h2>
              <p className="text-xl md:text-2xl text-[#6C6C6C]">{t('Together can elevate your brand and bring your ideas to life')}</p>
            </div>

            <form className="flex flex-col gap-5">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder={t('Full Name')} 
                  className="w-full h-[55px] px-6 rounded-full border border-[#6C6C6C] bg-transparent text-[#1E1E1E] text-lg focus:outline-none focus:border-[#1E1E1E] transition-colors placeholder:text-[#6C6C6C]"
                />
              </div>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder={t('Email Address')} 
                  className="w-full h-[55px] px-6 rounded-full border border-[#6C6C6C] bg-transparent text-[#1E1E1E] text-lg focus:outline-none focus:border-[#1E1E1E] transition-colors placeholder:text-[#6C6C6C]"
                />
              </div>
              <div className="relative flex items-center">
                <input 
                  type="tel" 
                  placeholder={t('Phone Number')} 
                  className="w-full h-[55px] px-6 rounded-full border border-[#6C6C6C] bg-transparent text-[#1E1E1E] text-lg focus:outline-none focus:border-[#1E1E1E] transition-colors placeholder:text-[#6C6C6C]"
                />
              </div>
              <div className="relative flex items-start">
                <textarea 
                  placeholder={t('Message')} 
                  rows={4}
                  className="w-full py-5 px-6 rounded-[32px] border border-[#6C6C6C] bg-transparent text-[#1E1E1E] text-lg focus:outline-none focus:border-[#1E1E1E] transition-colors resize-none placeholder:text-[#6C6C6C]"
                />
              </div>
              <div className="mt-2">
                <button type="button" className="bg-[#1E1E1E] text-white px-8 h-[52px] rounded-full font-medium flex items-center gap-3 hover:bg-black transition-colors w-max text-xl">
                  <FlipText>
                    {t('Send us a message')}
                    <div className="mt-1">
                      <ArrowDownRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-90' : '-rotate-90'} text-white`} />
                    </div>
                  </FlipText>
                </button>
              </div>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ x: language === 'ar' ? -40 : 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-[350px] shrink-0 flex flex-col gap-12"
          >
            <h2 className="text-4xl font-normal text-[#1E1E1E]">{t('Contact Information')}</h2>
            
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <span className="text-xl capitalize text-[#1E1E1E] w-16">{t('Calls')}</span>
                <span className="text-xl text-[#1E1E1E]" dir="ltr" style={{ direction: 'ltr' }}>+249 995705751</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl capitalize text-[#1E1E1E] w-16">{t('Chats')}</span>
                <span className="text-xl text-[#1E1E1E]" dir="ltr" style={{ direction: 'ltr' }}>+249 995705751</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl capitalize text-[#1E1E1E] w-16">{t('email')}</span>
                <a href="mailto:x.zone.sd249@gmail.com" className="text-xl text-[#1E1E1E] hover:text-brand-red transition-colors">x.zone.sd249@gmail.com</a>
              </div>
              <div className="w-full h-px bg-[#D7D7D7]"></div>
              
              <div className="flex flex-col gap-2">
                <span className="text-xl capitalize text-[#1E1E1E]">{t('Address')}</span>
                <span className="text-xl text-[#1E1E1E]">{t('Alsoug, Portsudan, Sudan')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="p-4 md:p-6 mt-12">
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
