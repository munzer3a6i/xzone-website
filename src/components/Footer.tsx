import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface FooterProps {
  className?: string;
  showBackground?: boolean;
}

export default function Footer({ className = 'p-4 md:p-6', showBackground = false }: FooterProps) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'exists'>('idle');

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('loading');
    try {
      // Use email as document ID to naturally prevent duplicates
      // And we can safely check if it exists using getDoc because we allowed get in rules
      const docRef = doc(db, 'newsletter', email.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStatus('exists');
      } else {
        await setDoc(docRef, {
          email: email.toLowerCase(),
          createdAt: new Date().toISOString()
        });
        setStatus('success');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setStatus('error');
    }
    
    // Reset status after a few seconds
    setTimeout(() => {
      setStatus('idle');
    }, 4000);
  };

  return (
    <footer className={className}>
      <div className="bg-[#0A0A0A] text-white pt-20 pb-12 px-8 md:px-12 lg:px-20 rounded-[1.5rem] relative overflow-hidden">
        {/* Top Bar (Newsletter + Nav) */}
        <div className={`max-w-[1700px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-32 relative z-10`}>
          {/* Frame 75: Newsletter */}
          <div className="flex flex-col gap-6 w-full lg:w-[435px]">
            <h3 className="text-3xl font-normal">{t('Stay updated with our news')}</h3>
            {/* Frame 74: Input Wrapper */}
            <form onSubmit={handleSubscribe} className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Enter your email address')} 
                className="w-full bg-[#1F1F1F] text-white rounded-full px-8 py-4.5 h-[55px] outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-gray-500"
                disabled={status === 'loading'}
                required
              />
              {/* Rotated Submit Button */}
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all -rotate-[30deg] disabled:opacity-50`}
              >
                <ArrowUpRight className={`w-4 h-4 text-black ${language === 'ar' ? 'rotate-[210deg]' : 'rotate-[30deg]'}`} />
              </button>
              
              {/* Status Messages */}
              {status === 'success' && <p className="text-green-400 text-sm mt-2 absolute -bottom-6">Subscribed successfully!</p>}
              {status === 'exists' && <p className="text-brand-red text-sm mt-2 absolute -bottom-6">You are already subscribed.</p>}
              {status === 'error' && <p className="text-brand-red text-sm mt-2 absolute -bottom-6">Something went wrong. Try again.</p>}
            </form>
          </div>

          {/* Frame 76: Navigation Links */}
          <nav className="flex flex-wrap items-center gap-8 lg:gap-12 text-2xl font-normal">
            <Link to="/" onClick={scrollTo('home')} className="hover:text-brand-red transition-colors">{t('Home')}</Link>
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

        {showBackground && (
          <div className="absolute inset-0 pointer-events-none opacity-20 hidden lg:block">
            <img src="/assets/HeroSection.png" alt="" className="w-full h-full object-cover" />
          </div>
        )}

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
  );
}
