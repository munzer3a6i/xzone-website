import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Edit2, Trash2, LogOut, Loader2, Image as ImageIcon, Briefcase, FileText, LayoutDashboard, Settings, Upload, X, MessageSquare, Mail, ArrowUp, ArrowDown } from 'lucide-react';
import { SERVICE_TAGS, normalizeServices } from '../data/serviceTags';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  projectType: string;
  description: string;
  client: string;
  image: string;
  images: string[];
  services: string | string[];
  titleAr?: string;
  projectTypeAr?: string;
  descriptionAr?: string;
  clientAr?: string;
  servicesAr?: string;
  order?: number;
}

interface TeamMember {
  id: string;
  name: string;
  occupation: string;
  image: string;
  order: number;
  nameAr?: string;
  occupationAr?: string;
}

interface Review {
  id: string;
  name: string;
  position: string;
  reviewText: string;
  userImage: string;
  companyLogo: string;
  order: number;
  nameAr?: string;
  positionAr?: string;
  reviewTextAr?: string;
}

interface CarouselImage {
  id: string;
  url: string;
  order: number;
}

export default function Admin() {
  const { user, isAdmin, loading, signInCustom, updateAdminCredentials, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'reviews' | 'carousel' | 'settings' | 'newsletter'>('projects');

  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    images: []
  });

  const [saving, setSaving] = useState(false);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [fetchingTeam, setFetchingTeam] = useState(true);
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({ order: 0 });
  const [savingMember, setSavingMember] = useState(false);
  const [uploadingMemberImage, setUploadingMemberImage] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fetchingReviews, setFetchingReviews] = useState(true);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({ order: 0 });
  const [savingReview, setSavingReview] = useState(false);
  const [uploadingUserImage, setUploadingUserImage] = useState(false);
  const [uploadingCompanyLogo, setUploadingCompanyLogo] = useState(false);

  // Settings state
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState({ type: '', text: '' });

  // Carousel state
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [fetchingCarousel, setFetchingCarousel] = useState(true);
  const [uploadingCarouselImage, setUploadingCarouselImage] = useState(false);

  // Newsletter state
  const [newsletterEmails, setNewsletterEmails] = useState<{id: string, email: string, createdAt: string}[]>([]);
  const [fetchingNewsletter, setFetchingNewsletter] = useState(true);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInCustom(loginUsername, loginPassword);
    } catch (e: any) {
      setLoginError(e.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'projects') {
        fetchProjects();
      } else if (activeTab === 'team') {
        fetchTeamMembers();
      } else if (activeTab === 'reviews') {
        fetchReviews();
      } else if (activeTab === 'carousel') {
        fetchCarouselImages();
      } else if (activeTab === 'newsletter') {
        fetchNewsletterEmails();
      }
    }
  }, [isAdmin, activeTab]);

  const fetchNewsletterEmails = async () => {
    try {
      const q = query(collection(db, 'newsletter'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, email: doc.data().email, createdAt: doc.data().createdAt }));
      setNewsletterEmails(data);
    } catch (e) {
      console.error(e);
      alert('Error fetching newsletter emails.');
    } finally {
      setFetchingNewsletter(false);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const q = query(collection(db, 'carousel'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CarouselImage));
      setCarouselImages(data);
    } catch (e) {
      console.error(e);
      alert('Error fetching carousel images.');
    } finally {
      setFetchingCarousel(false);
    }
  };

  const handleCarouselImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingCarouselImage(true);
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const imageRef = ref(storage, `carousel/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        // Add to collection
        const nextOrder = carouselImages.length > 0 ? Math.max(...carouselImages.map(c => c.order || 0)) + 1 : 0;
        await addDoc(collection(db, 'carousel'), { 
          url, 
          order: nextOrder,
          createdAt: serverTimestamp()
        });
      }
      fetchCarouselImages();
    } catch (error: any) {
      console.error(error);
      alert('Error uploading carousel image.');
    } finally {
      setUploadingCarouselImage(false);
    }
  };

  const handleDeleteCarouselImage = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteDoc(doc(db, 'carousel', id));
        fetchCarouselImages();
      } catch (e) {
        console.error(e);
        alert('Error deleting image');
      }
    }
  };

  const fetchProjects = async () => {
    try {
      // Fetch all projects without orderBy, so we don't exclude ones without an 'order' field
      const snapshot = await getDocs(collection(db, 'projects'));
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      
      // Sort in memory: projects with 'order' first (ascending), then fallback to createdAt (descending)
      data.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;
        
        // Both missing order, sort by createdAt descending
        const dateA = a.createdAt?.toMillis?.() || 0;
        const dateB = b.createdAt?.toMillis?.() || 0;
        return dateB - dateA;
      });
      
      setProjects(data);
    } catch (e) {
      console.error(e);
      alert('Error fetching projects. Check console.');
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const servicesArray = normalizeServices(currentProject.services);
      const projectData = {
        title: currentProject.title || '',
        titleAr: currentProject.titleAr || '',
        projectType: currentProject.projectType || '',
        projectTypeAr: currentProject.projectTypeAr || '',
        description: currentProject.description || '',
        descriptionAr: currentProject.descriptionAr || '',
        client: currentProject.client || '',
        clientAr: currentProject.clientAr || '',
        image: currentProject.image || '',
        images: currentProject.images || [],
        services: servicesArray,
        order: currentProject.order ?? projects.length,
      };

      if (currentProject.id) {
        // Update
        const docRef = doc(db, 'projects', currentProject.id);
        await updateDoc(docRef, { ...projectData, updatedAt: serverTimestamp() });
      } else {
        // Create
        await addDoc(collection(db, 'projects'), { 
          ...projectData, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditing(false);
      fetchProjects();
    } catch (e) {
      console.error(e);
      alert('Error saving project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        fetchProjects();
      } catch (e) {
        console.error(e);
        alert('Error deleting project');
      }
    }
  };

  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;
    
    const updated = [...projects];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setProjects(updated);

    // Batch update order fields
    try {
      for (let i = 0; i < updated.length; i++) {
        const docRef = doc(db, 'projects', updated[i].id);
        await updateDoc(docRef, { order: i });
      }
    } catch (e) {
      console.error('Error updating order:', e);
      fetchProjects(); // revert on error
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const q = query(collection(db, 'teamMembers'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setTeamMembers(data);
    } catch (e) {
      console.error(e);
      alert('Error fetching team members.');
    } finally {
      setFetchingTeam(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMember(true);
    try {
      const memberData = {
        name: currentMember.name || '',
        nameAr: currentMember.nameAr || '',
        occupation: currentMember.occupation || '',
        occupationAr: currentMember.occupationAr || '',
        image: currentMember.image || '',
        order: Number(currentMember.order) || 0,
      };

      if (currentMember.id) {
        // Update
        const docRef = doc(db, 'teamMembers', currentMember.id);
        await updateDoc(docRef, { ...memberData, updatedAt: serverTimestamp() });
      } else {
        // Create
        await addDoc(collection(db, 'teamMembers'), { 
          ...memberData, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditingTeam(false);
      fetchTeamMembers();
    } catch (e) {
      console.error(e);
      alert('Error saving team member.');
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this team member?")) {
      try {
        await deleteDoc(doc(db, 'teamMembers', id));
        fetchTeamMembers();
      } catch (e) {
        console.error(e);
        alert('Error deleting team member');
      }
    }
  };

  const handleMemberImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingMemberImage(true);
    setUploadError(null);
    try {
      const imageRef = ref(storage, `projects/teamMember_${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setCurrentMember(prev => ({ ...prev, image: url }));
    } catch (error: any) {
      console.error(error);
      setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
      alert('Error uploading member image.');
    } finally {
      setUploadingMemberImage(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(data);
    } catch (e) {
      console.error(e);
      alert('Error fetching reviews.');
    } finally {
      setFetchingReviews(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReview(true);
    try {
      const reviewData = {
        name: currentReview.name || '',
        nameAr: currentReview.nameAr || '',
        position: currentReview.position || '',
        positionAr: currentReview.positionAr || '',
        reviewText: currentReview.reviewText || '',
        reviewTextAr: currentReview.reviewTextAr || '',
        userImage: currentReview.userImage || '',
        companyLogo: currentReview.companyLogo || '',
        order: Number(currentReview.order) || 0,
      };

      if (currentReview.id) {
        await updateDoc(doc(db, 'reviews', currentReview.id), { ...reviewData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'reviews'), { 
          ...reviewData, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsEditingReview(false);
      fetchReviews();
    } catch (e) {
      console.error(e);
      alert('Error saving review.');
    } finally {
      setSavingReview(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        fetchReviews();
      } catch (e) {
        console.error(e);
        alert('Error deleting review');
      }
    }
  };

  const handleReviewUserImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingUserImage(true);
    setUploadError(null);
    try {
      const imageRef = ref(storage, `reviews/user_${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setCurrentReview(prev => ({ ...prev, userImage: url }));
    } catch (error: any) {
      console.error(error);
      setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingUserImage(false);
    }
  };

  const handleReviewCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingCompanyLogo(true);
    setUploadError(null);
    try {
      const imageRef = ref(storage, `reviews/company_${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setCurrentReview(prev => ({ ...prev, companyLogo: url }));
    } catch (error: any) {
      console.error(error);
      setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingCompanyLogo(false);
    }
  };

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingMain(true);
    setUploadError(null);
    try {
      const imageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setCurrentProject(prev => ({ ...prev, image: url }));
    } catch (error: any) {
      console.error(error);
      setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
      alert('Error uploading main image. Check console for details.');
    } finally {
      setUploadingMain(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingGallery(true);
    setUploadError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const imageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        newUrls.push(url);
      }
      setCurrentProject(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
    } catch (error: any) {
      console.error(error);
      setUploadError(`Upload failed: ${error.message || 'Unknown error'}`);
      alert('Error uploading gallery images.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setCurrentProject(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsUsername || !settingsPassword) {
      setSettingsMessage({ type: 'error', text: 'Please fill in both fields.' });
      return;
    }
    updateAdminCredentials(settingsUsername, settingsPassword);
    setSettingsMessage({ type: 'success', text: 'Credentials updated! Use new credentials on next login.' });
    setSettingsUsername('');
    setSettingsPassword('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 selection:bg-brand-red selection:text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-xl w-full max-w-md flex flex-col items-center text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center mb-8">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-medium text-brand-dark mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mb-8 text-lg">Sign in to manage your portfolio</p>
          
          {loginError && (
            <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                required
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                placeholder="Username"
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="mt-4 w-full bg-brand-dark text-white py-4 rounded-full font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 text-lg disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
          
          <Link to="/" className="mt-8 text-gray-400 hover:text-brand-dark transition-colors">Return to Home</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex selection:bg-brand-red selection:text-white font-sans text-[#1E1E1E]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col hidden lg:flex sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Admin</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'projects' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <Briefcase className="w-5 h-5" />
            Projects
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'team' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <FileText className="w-5 h-5" />
            Team Members
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'reviews' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <MessageSquare className="w-5 h-5" />
            Customer Reviews
          </button>
          <button 
            onClick={() => setActiveTab('carousel')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'carousel' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <ImageIcon className="w-5 h-5" />
            Carousel
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'settings' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button 
            onClick={() => setActiveTab('newsletter')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full ${activeTab === 'newsletter' ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'}`}
          >
            <Mail className="w-5 h-5" />
            Newsletter
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-10 h-10 rounded-full" alt="avatar" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.displayName}</span>
              <span className="text-xs text-gray-500 truncate">{user.email}</span>
            </div>
          </div>
          <button onClick={logOut} className="p-2 text-gray-400 hover:text-brand-red transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Admin</span>
          </div>
          <button onClick={logOut} className="p-2 text-gray-400 hover:text-brand-red transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="max-w-6xl mx-auto p-6 lg:p-12">
          {activeTab === 'projects' && (
            isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <h2 className="text-3xl font-medium tracking-tight">{currentProject.id ? 'Edit Project' : 'New Project'}</h2>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 hover:text-brand-dark px-4 py-2 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {uploadError && (
                  <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                    {uploadError}
                    <p className="mt-2 text-sm">Note: Firebase Storage must be enabled in your Firebase Console, and you must add appropriate Storage Security Rules.</p>
                  </div>
                )}

                <form onSubmit={handleSave} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Project Title (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentProject.title || ''} 
                        onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. Zadna"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Project Title (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentProject.titleAr || ''} 
                        onChange={e => setCurrentProject({...currentProject, titleAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: زادنا"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Project Type (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentProject.projectType || ''} 
                        onChange={e => setCurrentProject({...currentProject, projectType: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. Corporate Branding"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Project Type (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentProject.projectTypeAr || ''} 
                        onChange={e => setCurrentProject({...currentProject, projectTypeAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: هوية مؤسسية"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Client Name (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentProject.client || ''} 
                        onChange={e => setCurrentProject({...currentProject, client: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. TAG company LTD."
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Client Name (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentProject.clientAr || ''} 
                        onChange={e => setCurrentProject({...currentProject, clientAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: شركة تاج المحدودة"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Services Provided</label>
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_TAGS.map(tag => {
                          const currentTags = normalizeServices(currentProject.services);
                          const isSelected = currentTags.includes(tag.en);
                          return (
                            <button
                              key={tag.en}
                              type="button"
                              onClick={() => {
                                const tags = normalizeServices(currentProject.services);
                                const updated = isSelected 
                                  ? tags.filter(t => t !== tag.en)
                                  : [...tags, tag.en];
                                setCurrentProject({...currentProject, services: updated});
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                isSelected 
                                  ? 'bg-brand-dark text-white border-brand-dark' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-dark hover:text-brand-dark'
                              }`}
                            >
                              {tag.en}
                              <span className="text-xs opacity-60 ml-1.5">({tag.ar})</span>
                            </button>
                          );
                        })}
                      </div>
                      {normalizeServices(currentProject.services).length === 0 && (
                        <p className="text-xs text-gray-400 mt-1">Click tags above to select services for this project.</p>
                      )}
                    </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Main Display Image</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="text" 
                        required
                        value={currentProject.image || ''} 
                        onChange={e => setCurrentProject({...currentProject, image: e.target.value})}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="Image URL"
                      />
                      <label 
                        className={`bg-gray-100 hover:bg-gray-200 text-brand-dark px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${uploadingMain ? 'opacity-50 pointer-events-none' : ''}`}
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                          disabled={uploadingMain}
                        />
                        {uploadingMain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploadingMain ? 'Uploading...' : 'Upload'}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                    <span>Project Gallery Pictures</span>
                    <label 
                      className={`bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-black ${uploadingGallery ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                        disabled={uploadingGallery}
                      />
                      {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingGallery ? 'Uploading...' : 'Add Pictures'}
                    </label>
                  </label>
                  
                  {currentProject.images && currentProject.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {currentProject.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-opacity hover:bg-red-500"
                            title="Remove picture"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No pictures added to the gallery yet.</p>
                      <p className="text-xs mt-1 text-gray-400">Click "Add Pictures" to upload</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Full Description (English)</label>
                    <textarea 
                      required
                      rows={5}
                      value={currentProject.description || ''} 
                      onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"
                      placeholder="Project description..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Full Description (Arabic)</label>
                    <textarea 
                      rows={5}
                      value={currentProject.descriptionAr || ''} 
                      onChange={e => setCurrentProject({...currentProject, descriptionAr: e.target.value})}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none text-right font-arabic"
                      placeholder="وصف المشروع..."
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-brand-red text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-4xl font-medium tracking-tight">Projects Overview</h2>
                <button 
                  onClick={() => {
                    setCurrentProject({ images: [] });
                    setIsEditing(true);
                  }}
                  className="bg-brand-dark text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  New Project
                </button>
              </div>

              {fetching ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>
              ) : projects.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 mb-2">No projects yet</h3>
                  <p className="text-gray-500 max-w-md">Get started by creating your first project to display in your portfolio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden group flex flex-col"
                    >
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        {p.image ? (
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-sm font-medium">No Image URL</span>
                          </div>
                        )}
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-brand-dark">
                          {p.projectType}
                        </span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-medium mb-1 truncate">{p.title}</h3>
                        <p className="text-gray-500 text-sm mb-6 truncate">{p.client}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setCurrentProject(p);
                              setIsEditing(true);
                            }}
                            className="text-brand-dark hover:text-brand-red text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleMoveProject(projects.indexOf(p), 'up')}
                              disabled={projects.indexOf(p) === 0}
                              className="text-gray-400 hover:text-brand-dark transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleMoveProject(projects.indexOf(p), 'down')}
                              disabled={projects.indexOf(p) === projects.length - 1}
                              className="text-gray-400 hover:text-brand-dark transition-colors p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

          {activeTab === 'team' && (
            isEditingTeam ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <h2 className="text-3xl font-medium tracking-tight">{currentMember.id ? 'Edit Team Member' : 'New Team Member'}</h2>
                  <button 
                    onClick={() => setIsEditingTeam(false)}
                    className="text-gray-500 hover:text-brand-dark px-4 py-2 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveMember} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Full Name (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentMember.name || ''} 
                        onChange={e => setCurrentMember({...currentMember, name: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Full Name (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentMember.nameAr || ''} 
                        onChange={e => setCurrentMember({...currentMember, nameAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: أحمد محمد"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Occupation / Role (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentMember.occupation || ''} 
                        onChange={e => setCurrentMember({...currentMember, occupation: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. Lead Designer"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Occupation / Role (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentMember.occupationAr || ''} 
                        onChange={e => setCurrentMember({...currentMember, occupationAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: مصمم رئيسي"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Display Order</label>
                      <input 
                        type="number" 
                        required
                        value={currentMember.order === undefined ? '' : currentMember.order} 
                        onChange={e => setCurrentMember({...currentMember, order: parseInt(e.target.value) || 0})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. 1"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Team Member Image</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="text" 
                          required
                          value={currentMember.image || ''} 
                          onChange={e => setCurrentMember({...currentMember, image: e.target.value})}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                          placeholder="Image URL"
                        />
                        <label 
                          className={`bg-gray-100 hover:bg-gray-200 text-brand-dark px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${uploadingMemberImage ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleMemberImageUpload}
                            className="hidden"
                            disabled={uploadingMemberImage}
                          />
                          {uploadingMemberImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingMemberImage ? 'Uploading...' : 'Upload'}
                        </label>
                      </div>
                      {currentMember.image && (
                        <div className="mt-4 w-32 h-32 rounded-full overflow-hidden border-2 border-gray-100">
                          <img src={currentMember.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={savingMember}
                      className="bg-brand-red text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {savingMember && <Loader2 className="w-4 h-4 animate-spin" />}
                      {savingMember ? 'Saving...' : 'Save Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-4xl font-medium tracking-tight">Team Members</h2>
                  <button 
                    onClick={() => {
                      setCurrentMember({ order: teamMembers.length + 1 });
                      setIsEditingTeam(true);
                    }}
                    className="bg-brand-dark text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    Add Member
                  </button>
                </div>

                {fetchingTeam ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>
                ) : teamMembers.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-700 mb-2">No team members yet</h3>
                    <p className="text-gray-500 max-w-md">Get started by adding your first team member.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {teamMembers.map((m) => (
                      <motion.div 
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden group flex flex-col items-center p-6 text-center"
                      >
                        <div className="w-32 h-32 mb-4 bg-gray-100 rounded-full relative overflow-hidden">
                          {m.image ? (
                            <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-medium mb-1 w-full truncate text-[#1E1E1E]">{m.name}</h3>
                        <p className="text-gray-500 text-sm mb-6 w-full truncate">{m.occupation}</p>
                        
                        <div className="mt-auto w-full pt-4 border-t border-gray-100 flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setCurrentMember(m);
                              setIsEditingTeam(true);
                            }}
                            className="text-brand-dark hover:text-brand-red text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteMember(m.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === 'reviews' && (
            isEditingReview ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <h2 className="text-3xl font-medium tracking-tight">{currentReview.id ? 'Edit Review' : 'New Review'}</h2>
                  <button 
                    onClick={() => setIsEditingReview(false)}
                    className="text-gray-500 hover:text-brand-dark px-4 py-2 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveReview} className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Full Name (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentReview.name || ''} 
                        onChange={e => setCurrentReview({...currentReview, name: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. Jane Smith"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Full Name (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentReview.nameAr || ''} 
                        onChange={e => setCurrentReview({...currentReview, nameAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: سارة محمد"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Position / Title (English)</label>
                      <input 
                        type="text" 
                        required
                        value={currentReview.position || ''} 
                        onChange={e => setCurrentReview({...currentReview, position: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. CEO at Company"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Position / Title (Arabic)</label>
                      <input 
                        type="text" 
                        value={currentReview.positionAr || ''} 
                        onChange={e => setCurrentReview({...currentReview, positionAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all text-right font-arabic"
                        placeholder="مثال: المدير التنفيذي"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Review Text (English)</label>
                      <textarea 
                        required
                        rows={4}
                        value={currentReview.reviewText || ''} 
                        onChange={e => setCurrentReview({...currentReview, reviewText: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none"
                        placeholder="Enter the review text..."
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Review Text (Arabic)</label>
                      <textarea 
                        rows={4}
                        value={currentReview.reviewTextAr || ''} 
                        onChange={e => setCurrentReview({...currentReview, reviewTextAr: e.target.value})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all resize-none text-right font-arabic"
                        placeholder="أدخل نص التقييم..."
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Display Order</label>
                      <input 
                        type="number" 
                        required
                        value={currentReview.order === undefined ? '' : currentReview.order} 
                        onChange={e => setCurrentReview({...currentReview, order: parseInt(e.target.value) || 0})}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                        placeholder="e.g. 1"
                      />
                    </div>

                    <div className="flex flex-col gap-2"></div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">User Image</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="text" 
                          required
                          value={currentReview.userImage || ''} 
                          onChange={e => setCurrentReview({...currentReview, userImage: e.target.value})}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                          placeholder="Image URL"
                        />
                        <label 
                          className={`bg-gray-100 hover:bg-gray-200 text-brand-dark px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${uploadingUserImage ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleReviewUserImageUpload}
                            className="hidden"
                            disabled={uploadingUserImage}
                          />
                          {uploadingUserImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingUserImage ? 'Uploading...' : 'Upload'}
                        </label>
                      </div>
                      {currentReview.userImage && (
                        <div className="mt-4 w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100">
                          <img src={currentReview.userImage} alt="User" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Company Logo</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="text" 
                          required
                          value={currentReview.companyLogo || ''} 
                          onChange={e => setCurrentReview({...currentReview, companyLogo: e.target.value})}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                          placeholder="Logo URL"
                        />
                        <label 
                          className={`bg-gray-100 hover:bg-gray-200 text-brand-dark px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${uploadingCompanyLogo ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleReviewCompanyLogoUpload}
                            className="hidden"
                            disabled={uploadingCompanyLogo}
                          />
                          {uploadingCompanyLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingCompanyLogo ? 'Uploading...' : 'Upload'}
                        </label>
                      </div>
                      {currentReview.companyLogo && (
                        <div className="mt-4 h-12 w-auto object-contain">
                          <img src={currentReview.companyLogo} alt="Logo" className="h-full w-auto object-contain" />
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={savingReview}
                      className="bg-brand-red text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {savingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                      {savingReview ? 'Saving...' : 'Save Review'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-4xl font-medium tracking-tight">Customer Reviews</h2>
                  <button 
                    onClick={() => {
                      setCurrentReview({ order: reviews.length + 1 });
                      setIsEditingReview(true);
                    }}
                    className="bg-brand-dark text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                    Add Review
                  </button>
                </div>

                {fetchingReviews ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-medium text-gray-700 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 max-w-md">Get started by adding your first customer review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reviews.map((r) => (
                      <motion.div 
                        key={r.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <img src={r.userImage} alt={r.name} className="w-14 h-14 rounded-full object-cover" />
                            <div>
                              <h4 className="font-medium text-[#1E1E1E]">{r.name}</h4>
                              <p className="text-sm text-gray-500">{r.position}</p>
                            </div>
                          </div>
                          {r.companyLogo && (
                            <img src={r.companyLogo} alt="Company" className="h-8 max-w-24 object-contain opacity-70" />
                          )}
                        </div>
                        <p className="text-gray-700 flex-1 italic">"{r.reviewText}"</p>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setCurrentReview(r);
                              setIsEditingReview(true);
                            }}
                            className="text-brand-dark hover:text-brand-red text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteReview(r.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === 'carousel' && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-4xl font-medium tracking-tight">Homepage Carousel</h2>
                <label 
                  className={`bg-brand-dark text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors shrink-0 cursor-pointer ${uploadingCarouselImage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={handleCarouselImageUpload}
                    className="hidden"
                    disabled={uploadingCarouselImage}
                  />
                  {uploadingCarouselImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {uploadingCarouselImage ? 'Uploading...' : 'Add Images'}
                </label>
              </div>

              {fetchingCarousel ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-red" /></div>
              ) : carouselImages.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-200 p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 mb-2">No carousel images</h3>
                  <p className="text-gray-500 max-w-md">Upload images to display them in the scrolling gallery on the homepage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {carouselImages.map((img) => (
                    <motion.div 
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group aspect-[4/5]"
                    >
                      <img src={img.url} alt="Carousel item" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <button 
                          onClick={() => handleDeleteCarouselImage(img.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-8 max-w-2xl">
              <h2 className="text-4xl font-medium tracking-tight">Settings</h2>
              
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-medium mb-1">Update Credentials</h3>
                  <p className="text-gray-500 text-sm">Change your custom username and password used to access the admin panel.</p>
                </div>

                {settingsMessage.text && (
                  <div className={`p-4 rounded-xl border text-sm font-medium ${settingsMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                    {settingsMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">New Username</label>
                    <input 
                      type="text" 
                      required
                      value={settingsUsername}
                      onChange={e => setSettingsUsername(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                      placeholder="e.g. admin"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={settingsPassword}
                      onChange={e => setSettingsPassword(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={savingSettings}
                      className="bg-brand-dark text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                      Update Credentials
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === 'newsletter' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-2 text-brand-dark">Newsletter Subscribers</h2>
                  <p className="text-gray-500">Manage your newsletter subscription list</p>
                </div>
              </div>

              {fetchingNewsletter ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
                </div>
              ) : newsletterEmails.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No subscribers yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Emails from the footer newsletter form will appear here.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 font-medium text-gray-600">Email</th>
                        <th className="px-6 py-4 font-medium text-gray-600">Subscribed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletterEmails.map((subscriber) => (
                        <tr key={subscriber.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{subscriber.email}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {new Date(subscriber.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
