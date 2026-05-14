import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ArrowDownRight, Loader2, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { FlipText, Badge } from './Home';
import { projects as fallbackProjects } from '../data/projects';
import { db } from '../firebase';
import Footer from '../components/Footer';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

export default function Project() {
  const { id } = useParams<{ id: string }>();
  const [projectIndex, setProjectIndex] = useState(-1);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language, toggleLanguage } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (data.length > 0) {
          setProjects(data);
        } else {
          setProjects(fallbackProjects);
        }
      } catch (e) {
        console.error("Error fetching projects", e);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      const index = projects.findIndex(p => p.id === id);
      setProjectIndex(index);
    }
  }, [id, projects]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-medium"><Loader2 className="w-8 h-8 animate-spin text-brand-dark" /></div>;
  }

  const project = projects.find(p => p.id === id);

  if (!project) {
    return <div className="min-h-screen flex items-center justify-center text-2xl font-medium">{t('Project not found')}</div>;
  }

  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : projects[projects.length - 1];
  const nextProject = projectIndex < projects.length - 1 ? projects[projectIndex + 1] : projects[0];

  return (
    <div className={`min-h-screen bg-white selection:bg-brand-red selection:text-white ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Hero Section */}
      <section className="p-4 md:p-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#0D0D0D] min-h-[95vh] flex flex-col">
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
            <div className="max-w-5xl flex flex-col gap-8">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge text={t(language === 'ar' && project.projectTypeAr ? project.projectTypeAr : project.projectType)} dark />
              </motion.div>
              <motion.h2 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-6xl md:text-7xl lg:text-[100px] leading-[1.08] font-normal tracking-tight text-white"
              >
                {language === 'ar' && project.titleAr ? project.titleAr : project.title}
              </motion.h2>
            </div>
          </div>
          

        </div>
      </section>

      {/* Project Details Section */}
      <section className="py-24 lg:py-32 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <div className="max-w-3xl flex flex-col gap-24">
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <Badge text={t('Description')} />
            <p className="text-xl md:text-2xl text-[#6C6C6C] leading-relaxed">
              {language === 'ar' && project.descriptionAr ? project.descriptionAr : project.description}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <Badge text={t('Services Provided')} />
            <p className="text-xl md:text-2xl text-[#6C6C6C] leading-relaxed">
              {language === 'ar' && project.servicesAr ? project.servicesAr : project.services}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32 px-4 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        <div className="columns-1 md:columns-2 gap-12 space-y-12">
          {project.images.map((img, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.8, delay: (i % 2) * 0.2 }}
               className="break-inside-avoid"
             >
               <img src={img} alt={`${language === 'ar' && project.titleAr ? project.titleAr : project.title} screenshot ${i+1}`} className="w-full rounded-[10px] bg-[#F2F2F2] object-fill hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
             </motion.div>
          ))}
        </div>
      </section>

      {/* Project Navigation */}
      <section className="px-4 md:px-8 lg:px-12 pb-24 max-w-[1700px] mx-auto">
        <div className="bg-[#F3F3F3] rounded-[70px] p-3 flex justify-between items-center max-w-[1348px] mx-auto">
          <Link to={`/project/${prevProject.id}`} className="bg-white text-[#1E1E1E] px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? '' : 'rotate-180'}`} />
            <span>{t('Previous Project')}</span>
          </Link>
          <Link to={`/project/${nextProject.id}`} className="bg-[#1E1E1E] text-white px-8 py-3 rounded-full font-medium hover:bg-black transition-colors flex items-center gap-2">
            <span>{t('Next Project')}</span>
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <Footer className="p-4 md:p-6 mt-12" showBackground={true} />
    </div>
  );
}
