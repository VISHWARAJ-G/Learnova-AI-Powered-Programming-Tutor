import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { RotatingTriangles } from "react-loader-spinner";
import { ensureLessonForUser } from "@/utils/EnsureLessonsForUser";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user) => {
    if (!user?.id) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      return { ...user, profile };
    }

    const avatar_number = Math.floor(Math.random() * 5) + 1;

    const full_name =
      user.user_metadata?.full_name || user.user_metadata?.name || null;

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        role: "student",
        avatar_number,
        full_name, 
      })
      .select()
      .single();

    if (error) {
      console.error("Profile creation error:", error.message);
      return { ...user, profile: {} };
    }

    return { ...user, profile: newProfile };
  };

  const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (!data?.user) throw new Error("Login failed. No user returned.");

    const userWithProfile = await fetchUserProfile(data.user);
    setUser(userWithProfile);
    setSession(data.session);

    await ensureLessonForUser(userWithProfile.id);

    return userWithProfile;
  };

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        const userWithProfile = await fetchUserProfile(session.user);
        setUser(userWithProfile);
        setSession(session);

        await ensureLessonForUser(userWithProfile.id);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const userWithProfile = await fetchUserProfile(session.user);
          setUser(userWithProfile);
          setSession(session);

          await ensureLessonForUser(userWithProfile.id);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    setUser,
    setSession,
    setLoading,
    loginWithEmail,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex flex-col h-screen items-center justify-center text-gray-500">
          <RotatingTriangles
            visible={true}
            height="80"
            width="80"
            color="#0284C7"
            ariaLabel="loading"
          />
          Loading Learnova...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
