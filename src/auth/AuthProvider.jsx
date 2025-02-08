import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // console.log(currentUser, profile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currentUser) {
      const profileRef = doc(db, "users", currentUser.uid);
      const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
        setProfile(docSnap.exists() ? docSnap.data() : null);
      });
      return unsubscribeProfile;
    } else {
      setProfile(null);
    }
  }, [currentUser]);

  const value = { currentUser, profile };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
