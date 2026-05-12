import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signInCustom: (u: string, p: string) => Promise<void>;
  updateAdminCredentials: (u: string, p: string) => void;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => {},
  signInCustom: async () => {},
  updateAdminCredentials: () => {},
  logOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// A unique key stored in sessionStorage to track if this anonymous session is admin
const ADMIN_SESSION_KEY = 'xzone_admin_session';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Restore admin session if the same user is still signed in
        const adminUid = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (adminUid && adminUid === firebaseUser.uid) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInCustom = async (username: string, loginPassword: string) => {
    // Validate against stored credentials (defaults: admin / 12345)
    const storedUsername = localStorage.getItem('admin_username') || 'admin';
    const storedPassword = localStorage.getItem('admin_password') || '12345';

    if (username !== storedUsername || loginPassword !== storedPassword) {
      throw new Error('Invalid username or password');
    }

    // Credentials match — sign in anonymously and mark session as admin
    const { user } = await signInAnonymously(auth);
    sessionStorage.setItem(ADMIN_SESSION_KEY, user.uid);
    setIsAdmin(true);
  };

  const updateAdminCredentials = (newUsername: string, newPassword: string) => {
    localStorage.setItem('admin_username', newUsername);
    localStorage.setItem('admin_password', newPassword);
  };

  const logOut = async () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signInCustom, updateAdminCredentials, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
