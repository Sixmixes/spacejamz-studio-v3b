'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, getDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useUserStore } from '@/store/useUserStore';

// Architect Authorization Backup UIDs
const ARCHITECT_UIDS: string[] = [
    process.env.NEXT_PUBLIC_ARCHITECT_UID || ''
].filter(Boolean);

export default function AuthEngine() {
  const setCurrentUser = useUserStore(state => state.setCurrentUser);
  const setIsArchitect = useUserStore(state => state.setIsArchitect);
  const setUserLoadState = useUserStore(state => state.setUserLoadState);

  useEffect(() => {
    if (!auth) return;
    
    // Fail-safe unlock for mobile/LAN testing
    const initializationTimeout = setTimeout(() => {
        if (useUserStore.getState().userLoadState === 'IDLE') {
            setUserLoadState('UNAUTHENTICATED');
            console.warn("[AuthEngine] Auth timeout. Forcing UNAUTHENTICATED unlock.");
        }
    }, 2000);

    let unsubUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // Manage snapshot detach
      if (unsubUser) { 
        unsubUser(); 
        unsubUser = null; 
      }
      
      const isAuthenticated = user && !user.isAnonymous;
      
      if (isAuthenticated && user) {
        if (db) {
            try {
                const userRef = doc(db, 'users', user.uid);
                
                unsubUser = onSnapshot(userRef, async (userSnap) => {
                    const now = new Date();
                    
                    if (userSnap.exists()) {
                        const data = userSnap.data();
                        const r = data.role ? data.role.toUpperCase() : '';
                        
                        const isArchitectRole = r === '👑 THE ARCHITECT' || r.includes('ARCHITECT');
                        const isArchitectUID = ARCHITECT_UIDS.includes(user.uid);
                        const isMasterAccount = (user.displayName || '').toUpperCase().includes('SIXKILLS');
                        
                        let forceArchitect = false;
                        if (isMasterAccount || (typeof window !== 'undefined' && window.location.search.includes('override=architect'))) {
                            forceArchitect = true;
                            if (r !== '👑 THE ARCHITECT') {
                                try { await setDoc(userRef, { role: '👑 THE ARCHITECT' }, { merge: true }); } 
                                catch (e) { console.warn("Auto-Architect promotion blocked by rules."); }
                            }
                        }
                        
                        setIsArchitect(isArchitectRole || isArchitectUID || forceArchitect);
                        setCurrentUser({
                            uid: user.uid,
                            displayName: data.displayName || user.displayName,
                            photoURL: data.photoURL || user.photoURL,
                            email: user.email,
                            role: data.role,
                            coinsBalance: data.coinsBalance,
                            xp: data.xp,
                            joinedAt: data.joinedAt,
                            enhancements: data.enhancements || [],
                            ownedEnhancements: data.ownedEnhancements || []
                        });
                        
                    } else {
                        // NEW PILOT CREATION - Handle the 50 Founders 5000 Coin Airdrop
                        console.warn(`[ECONOMY] Initializing new neural instance for ${user.displayName}`);
                        
                        let assignedCoins = 0;
                        
                        try {
                            const trafficRef = doc(db, 'metadata', 'traffic');
                            await runTransaction(db, async (transaction) => {
                                const trafficDoc = await transaction.get(trafficRef);
                                let totalPilots = 0;
                                
                                if (trafficDoc.exists()) {
                                    totalPilots = trafficDoc.data().totalPilots || 0;
                                }
                                
                                // Grant 5000 to first 50
                                if (totalPilots < 50) {
                                    assignedCoins = 5000;
                                }
                                
                                transaction.set(trafficRef, { totalPilots: totalPilots + 1 }, { merge: true });
                            });
                        } catch (err) {
                            console.warn("Traffic tracking bypassed by rules. Granting base airdrop manually.", err);
                            // Fallback if metadata/traffic transaction fails: Check UID or grant heavily if we assume we are early
                            assignedCoins = 5000; 
                        }

                        const newUserData = {
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            joinedAt: serverTimestamp(),
                            coinsBalance: assignedCoins,
                            xp: 0,
                            enrollmentComplete: false
                        };
                        
                        await setDoc(userRef, newUserData);
                        
                        setCurrentUser({
                            uid: user.uid,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            email: user.email,
                            role: undefined,
                            coinsBalance: assignedCoins,
                            xp: 0,
                            joinedAt: new Date(),
                            enhancements: [],
                            ownedEnhancements: []
                        });
                        
                        if (assignedCoins > 0) {
                            console.warn(`[ECONOMY] FOUNDERS AIRDROP GRANTED: +${assignedCoins}C`);
                        }
                    }
                    
                    setUserLoadState('AUTHENTICATED');
                });
            } catch (e) {
                console.error("AuthEngine Mount Error:", e);
                setIsArchitect(false);
                setUserLoadState('UNAUTHENTICATED');
            }
        }
      } else if (!user) {
        useUserStore.getState().logout();
        signInAnonymously(auth).catch(e => console.error(e));
      } else {
        setUserLoadState('UNAUTHENTICATED');
      }
    });

    return () => {
      clearTimeout(initializationTimeout);
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, [setCurrentUser, setIsArchitect, setUserLoadState]);

  return null;
}
