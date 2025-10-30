import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider } from '@/integrations/firebase/client';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

interface FirebaseUserInfo {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface FirebaseAuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // Persist minimal profile to Firestore
        const profile: FirebaseUserInfo = {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: u.photoURL,
        };
        await setDoc(doc(db, 'users', u.uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutUser }), [user, loading]);
  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

export const useFirebaseAuth = () => {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  return ctx;
};
