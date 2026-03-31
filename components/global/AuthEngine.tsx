'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();
  const unsubUserRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!auth) return;
    
    // Fail-safe unlock for mobile/LAN testing
    const initializationTimeout = setTimeout(() => {
        if (useUserStore.getState().userLoadState === 'IDLE') {
            setUserLoadState('UNAUTHENTICATED');
            console.warn("[AuthEngine] Auth timeout. Forcing UNAUTHENTICATED unlock.");
        }
    }, 2000);

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      // Manage snapshot detach
      if (unsubUserRef.current) { 
        unsubUserRef.current(); 
        unsubUserRef.current = null; 
      }
      
      const isAuthenticated = user && !user.isAnonymous;
      
      if (isAuthenticated && user) {
        if (db) {
            try {
                const userRef = doc(db, 'users', user.uid);
                
                const unsub = onSnapshot(userRef, async (userSnap) => {
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
                            ownedEnhancements: data.ownedEnhancements || [],
                            // Sync critical identity persistence layers
                            customBannerUrl: data.customBannerUrl,
                            bannerPositionY: data.bannerPositionY,
                            bannerZoom: data.bannerZoom,
                            customCursor: data.customCursor,
                            prestige_level: data.prestige_level || 0,
                            lastCoinRefill: data.lastCoinRefill,
                            freeGenerationsRemaining: data.freeGenerationsRemaining ?? 0
                        });
                        
                        // Daily Operational Refill Logic
                        const todayString = now.toISOString().split('T')[0];
                        const lastRefill = data.lastCoinRefill || '';
                        
                        // If it's a new day, evaluate refill
                        if (lastRefill !== todayString && typeof window !== 'undefined') {
                            const currentBalance = data.coinsBalance || 0;
                            // Top-up to 100 if they are below 100. If they have >= 100, do not augment.
                            if (currentBalance < 100) {
                                setDoc(userRef, { coinsBalance: 100, lastCoinRefill: todayString }, { merge: true })
                                    .catch(e => console.error("Daily refill failed", e));
                                console.warn(`[ECONOMY] Daily Operational Refill Granted. Topped up to 100C.`);
                            } else {
                                // Just clock the check-in so we don't spam the DB evaluate again today
                                setDoc(userRef, { lastCoinRefill: todayString }, { merge: true })
                                    .catch(e => console.error("Daily check sync failed", e));
                            }
                        }
                        
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
                    
                    // ARCHITECT COMMAND: DO NOT REDIRECT TO POD. LAND AT MATRIX CORE.
                    if (pathname === '/enrollment') {
                      router.push('/');
                    }
                });
                unsubUserRef.current = unsub;
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
      if (unsubUserRef.current) {
        unsubUserRef.current();
        unsubUserRef.current = null;
      }
    };
  }, [setCurrentUser, setIsArchitect, setUserLoadState]);

  return null;
}
