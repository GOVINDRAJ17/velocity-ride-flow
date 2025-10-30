import { motion } from 'framer-motion';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const { user, loading, signInWithGoogle, signOutUser } = useFirebaseAuth();

  if (loading) return <div className="p-4">Loading…</div>;

  if (!user) {
    return (
      <div className="p-4 pb-24 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Sign in with Google to continue.</p>
        <Button className="w-full" onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="p-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3">
        {user.photoURL && <img src={user.photoURL} className="w-12 h-12 rounded-full" />}
        <div>
          <div className="font-semibold">{user.displayName}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>
      <Button variant="secondary" className="mt-6 w-full" onClick={signOutUser}>Sign out</Button>
    </motion.div>
  );
};

export default Profile;
