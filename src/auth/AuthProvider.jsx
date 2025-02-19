import React, { useContext, useEffect, useState, useMemo } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState("not set");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setCurrentUser(user);
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const userRole = idTokenResult?.claims?.role || "not set";
          if (isMounted) setRole(userRole);
        } catch (error) {
          console.error("Error fetching token:", error);
          if (isMounted) setRole("not set");
        }
      } else {
        setRole("not set");
      }
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      const profileRef = doc(db, "users", currentUser.uid);
      const unsubscribeProfile = onSnapshot(
        profileRef,
        (docSnap) => {
          setProfile(docSnap.exists() ? docSnap.data() : null);
        },
        (error) => {
          console.error("Error fetching profile:", error);
          setProfile(null);
        }
      );
      return () => unsubscribeProfile();
    } else {
      setProfile(null);
    }
  }, [currentUser]);

  const value = useMemo(() => {
    const isAdmin = role === "admin";
    const isPrivileged = role === "admin" || role === "manager";
    const isUser = role !== "not set";
    return { currentUser, profile, role, isAdmin, isPrivileged, isUser };
  }, [currentUser, profile, role]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
