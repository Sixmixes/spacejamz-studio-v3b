"use client";

import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Zap, Crosshair, Crown, Skull, Loader2, ShieldCheck, CheckCircle2, Terminal, Radio, Mic, LayoutDashboard, Headphones, Flame, Lock, Archive, ShoppingBag, Fingerprint, ChevronLeft } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth, functions } from '@/lib/firebase/config';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { getPilotRank } from '@/lib/utils/rankings';

const CURRENT_SEASON = 1;

export default function TreasuryPage() {
    const router = useRouter();
    const { currentUser, userLoadState, isArchitect } = useUserStore();
    const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'armory' | 'blackmarket' | 'archives'>('armory');

    // Enforce Layout Security & Prevent DOM Hydration Leaks
    useEffect(() => {
        if (userLoadState === 'UNAUTHENTICATED' || (!currentUser && userLoadState === 'AUTHENTICATED')) {
            router.push('/login');
        }
    }, [userLoadState, currentUser, router]);

    // Payment Success Interceptor
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash.includes('success=true')) {
                setActiveModal({
                    type: 'success',
                    title: 'TRANSACTION VERIFIED',
                    message: 'Stripe Gateway confirms the Alpha Coin payload has been authenticated and delivered to your Matrix Vault.',
                    color: '#22c55e',
                    icon: CheckCircle2,
                    border: 'border-green-500/40',
                    shadow: 'shadow-[0_0_100px_rgba(34,197,94,0.3)]',
                    particles: 10,
                    particleIcon: CircleDollarSign,
                    text: 'text-green-400'
                });
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }, []);

    if (!currentUser) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
    }

    const currentCoins = currentUser?.coinsBalance || 0;
    const currentXp = currentUser?.xp || 0;

    // Determine user's origin season based on joinedAt
    const userJoinedDate = currentUser?.joinedAt?.toDate ? currentUser.joinedAt.toDate() : new Date();
    const season2Start = new Date('2026-06-01T00:00:00Z');
    const userOriginSeason = userJoinedDate < season2Start ? 1 : 2;

    const handlePurchase = async (pkg: any) => {
        setLoadingPkg(pkg.id);
        try {
            const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
            const response: any = await createCheckoutSession({ 
                priceId: pkg.stripePriceId,
                origin: window.location.origin
            });
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("Neural Session link generation failed.");
            }
        } catch (error) {
            console.error("Purchase matrix failure:", error);
            setActiveModal({ type: 'error', title: 'TRANSACTION FAILURE', message: 'The connection to the Neural Economy failed.' });
            setLoadingPkg(null);
        }
    };

    const handleInstallEnhancement = async (item: any) => {
        const isFree = item.currency === 'free';
        const isXpUnlock = item.currency === 'xp_unlock';
        
        let confirmMessage = "";
        let confirmAction = async () => {};

        // COIN PURCHASE REQUIRES FUNDS
        if (item.currency === 'coins') {
            if (currentCoins < item.cost) {
                setActiveModal({ type: 'error', title: 'INSUFFICIENT FUNDS', message: `YOU NEED ${(item.cost - currentCoins).toLocaleString()} MORE ALPHA COINS TO DEPLOY THIS LAYER.` });
                return;
            }
            confirmMessage = `Transact ${item.cost.toLocaleString()} Coins to acquire ${item.name}? This action is irreversible.`;
            confirmAction = async () => {
                if (!currentUser?.uid) return;
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    coinsBalance: currentCoins - item.cost,
                    enhancements: arrayUnion(item.id),
                    ownedEnhancements: arrayUnion(item.id)
                });
            };
        }

        // XP UNLOCK IS STRICTLY FREE FOR ACTIVE GRINDERS
        if (isXpUnlock) {
            const missedSeason = userOriginSeason > item.season;
            if (missedSeason) {
                // FALLBACK TO COIN PURCHASE IF THEY MISSED THE SEASON
                if (currentCoins < item.missedSeasonCost) {
                    setActiveModal({ type: 'error', title: 'SEASON MISSED', message: `You missed Pre-Season 1. To unlock this legacy card, you need ${(item.missedSeasonCost - currentCoins).toLocaleString()} more Alpha Coins.` });
                    return;
                }
                confirmMessage = `You missed Season ${item.season}. Transact ${item.missedSeasonCost.toLocaleString()} Coins to acquire ${item.name}?`;
                confirmAction = async () => {
                    if (!currentUser?.uid) return;
                    const userRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userRef, {
                        coinsBalance: currentCoins - item.missedSeasonCost,
                        enhancements: arrayUnion(item.id),
                        ownedEnhancements: arrayUnion(item.id)
                    });
                };
            } else {
                // THEY WERE HERE. FREE UNLOCK.
                confirmMessage = `You have reached the required XP threshold. Claim ${item.name} for 0 Coins?`;
                confirmAction = async () => {
                    const userRef = doc(db, 'users', currentUser.uid);
                    await updateDoc(userRef, {
                        enhancements: arrayUnion(item.id),
                        ownedEnhancements: arrayUnion(item.id)
                    });
                };
            }
        }

        // FREE TIER IS JUST FREE
        if (isFree) {
            confirmMessage = `Connect ${item.name} to your Identity Node?`;
            confirmAction = async () => {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    enhancements: arrayUnion(item.id),
                    ownedEnhancements: arrayUnion(item.id)
                });
            };
        }

        setActiveModal({
            type: 'confirm',
            title: isFree ? 'CONNECT SUBSTRATE' : (isXpUnlock && userOriginSeason <= item.season ? 'CLAIM REWARD' : 'VERIFY TRANSACTION'),
            message: confirmMessage,
            confirmText: 'AUTHORIZE INJECTION',
            onConfirm: async () => {
                setActiveModal(null);
                try {
                    await confirmAction();
                    setActiveModal({
                        type: 'success',
                        color: isFree ? '#ffffff' : (isXpUnlock ? '#06b6d4' : '#22c55e'),
                        icon: CheckCircle2,
                        title: "ENHANCEMENT INSTALLED",
                        message: `Neural pathway updated. ${item.name} has been fused to your Identity Node.`,
                        particles: 3,
                        particleIcon: Zap,
                        shadow: isFree ? 'shadow-[0_0_100px_rgba(255,255,255,0.2)]' : (isXpUnlock ? 'shadow-[0_0_100px_rgba(6,182,212,0.3)]' : 'shadow-[0_0_100px_rgba(34,197,94,0.3)]'),
                        border: isFree ? 'border-white/20' : (isXpUnlock ? 'border-cyan-500/40' : 'border-green-500/40'),
                        text: isFree ? 'text-white' : (isXpUnlock ? 'text-cyan-400' : 'text-green-400')
                    });
                } catch (error) {
                    console.error("Installation Error:", error);
                    setActiveModal({ type: 'error', title: 'SYSTEM REJECTED', message: "Network dropped the transaction." });
                }
            }
        });
    };

    const handleToggleEnhancement = async (item: any, isEquipped: boolean) => {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            if (isEquipped) {
                 await updateDoc(userRef, { enhancements: arrayRemove(item.id) });
                 return;
            }
            let newEnhancements = [...(currentUser.enhancements || [])];
            if (item.id.startsWith('card_')) {
                newEnhancements = newEnhancements.filter((e: string) => !e.startsWith('card_'));
                newEnhancements.push(item.id);
                await updateDoc(userRef, { enhancements: newEnhancements });
            } else if (item.id.startsWith('theme_')) {
                newEnhancements = newEnhancements.filter((e: string) => !e.startsWith('theme_'));
                newEnhancements.push(item.id);
                await updateDoc(userRef, { enhancements: newEnhancements });
            } else {
                await updateDoc(userRef, { enhancements: arrayUnion(item.id) });
            }
        } catch (error) {
            console.error("Toggle Error:", error);
        }
    };

    const coinPackages = [
        { id: 'pkg_stray', stripePriceId: 'price_1TDde1KEPMPxrCptqwNKLy0A', name: 'The Stray', coins: 500, price: '$4.99', icon: Zap, color: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/5 hover:bg-gray-500/10', glow: 'hover:shadow-[0_0_20px_rgba(156,163,175,0.3)]', popular: false },
        { id: 'pkg_operator', stripePriceId: 'price_1TDdeJKEPMPxrCpte1k4EpFg', name: 'The Operator', coins: 1200, price: '$9.99', icon: Crosshair, color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/5 hover:bg-primary/10', glow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]', popular: true },
        { id: 'pkg_architect', stripePriceId: 'price_1TDdeaKEPMPxrCptjfiThLO3', name: 'The Architect', coins: 3000, price: '$19.99', icon: Crown, color: 'text-warning', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5 hover:bg-yellow-500/10', glow: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]', popular: false },
        { id: 'pkg_syndicate', stripePriceId: 'price_1TDdevKEPMPxrCpt0dL9jmCW', name: 'The Syndicate', coins: 10000, price: '$49.99', icon: Skull, color: 'text-[#ff00ff]', border: 'border-[#ff00ff]/30', bg: 'bg-[#ff00ff]/5 hover:bg-[#ff00ff]/10', glow: 'hover:shadow-[0_0_40px_rgba(255,0,255,0.6)]', popular: false }
    ];

    const matrixEnhancements = [
        // ARCHIVES (FREE)
        { id: 'item_highlight', name: 'Matrix Highlight', description: 'Surround your Identity Pod with a permanent, glowing golden aura.', currency: 'free', cost: 0, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/5 hover:bg-yellow-400/10', border: 'border-yellow-400/20' },
        { id: 'card_blueprint', name: "Architect's Blueprint", description: 'A wireframe schematic of the SpaceJamz studio rotating in bright cyan vectors.', currency: 'free', cost: 0, icon: LayoutDashboard, color: 'text-cyan-300', bg: 'bg-cyan-300/5 hover:bg-cyan-300/10', border: 'border-cyan-300/20' },
        { id: 'card_silicon', name: 'The Silicon Grave', description: 'A dystopian motherboard covered in digital rust. Standard issue.', currency: 'free', cost: 0, icon: Crosshair, color: 'text-amber-700', bg: 'bg-amber-700/5 hover:bg-amber-700/10', border: 'border-amber-700/20' },
        { id: 'card_ghost', name: 'Ghost In The Machine', description: 'Faint spectral code silhouettes moving within deep black container layers.', currency: 'free', cost: 0, icon: Terminal, color: 'text-gray-300', bg: 'bg-gray-300/5 hover:bg-gray-300/10', border: 'border-gray-300/20' },

        // BLACK MARKET (XP GRINDERS + SEASONAL)
        { id: 'card_neural', name: 'Neural Overdrive', description: 'High-speed green binary code raining vertically down the background behind your avatar.', currency: 'xp_unlock', season: 1, requiredXp: 5000, missedSeasonCost: 3500, icon: Terminal, color: 'text-green-500', bg: 'bg-green-500/10 hover:bg-green-500/20', border: 'border-green-500/30' },
        { id: 'card_cyberdeck', name: 'Cyberdeck Proxy', description: 'A retro-futuristic synthwave sun setting over an animated neon wireframe grid.', currency: 'xp_unlock', season: 1, requiredXp: 15000, missedSeasonCost: 5000, icon: Radio, color: 'text-pink-500', bg: 'bg-pink-500/10 hover:bg-pink-500/20', border: 'border-pink-500/30' },
        { id: 'card_quantum', name: 'Quantum Lock', description: 'Animated hexagonal energy shields lighting up procedurally around your Identity Pod badge.', currency: 'xp_unlock', season: 1, requiredXp: 25000, missedSeasonCost: 8000, icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-400/10 hover:bg-sky-400/20', border: 'border-sky-400/30' },
        { id: 'item_glitch', name: 'Identity Glitch Engine', description: 'Apply a continuous erratic CSS corruption filter to your Nameplate and Avatar.', currency: 'xp_unlock', season: 1, requiredXp: 50000, missedSeasonCost: 15000, icon: Zap, color: 'text-gray-300', bg: 'bg-gray-400/10 hover:bg-gray-400/20', border: 'border-white/20' },
        { id: 'card_syndicate', name: 'Sector 7 Syndicate', description: 'Gritty cyberpunk alleyway neon signs flashing in digital rain.', currency: 'xp_unlock', season: 1, requiredXp: 100000, missedSeasonCost: 25000, icon: Flame, color: 'text-pink-600', bg: 'bg-pink-600/10 hover:bg-pink-600/20', border: 'border-pink-600/30' },
        { id: 'card_monolith', name: '[PRESTIGE 1] The Monolith', description: 'A pure obsidian card that absorbs all light, outlining your name in harsh gold physics.', currency: 'xp_unlock', season: 1, requiredXp: 0, requiredPrestige: 1, missedSeasonCost: 50000, icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/5 hover:bg-yellow-500/10', border: 'border-yellow-500/50' },
        { id: 'card_astral', name: '[PRESTIGE 2] Astral Projection', description: 'Your card is entirely transparent ultra-glass, floating above an infinite starfield.', currency: 'xp_unlock', season: 1, requiredXp: 0, requiredPrestige: 2, missedSeasonCost: 100000, icon: Crown, color: 'text-white', bg: 'bg-white/5 hover:bg-white/10', border: 'border-white/50' },

        // THE ARMORY (COINS)
        { id: 'theme_cyberdeck', name: 'Cyberdeck Quarters (Room)', description: 'A retro-futuristic synthwave living quarters dedicated to your Identity Pod.', currency: 'coins', cost: 15000, icon: LayoutDashboard, color: 'text-pink-500', bg: 'bg-pink-500/10 hover:bg-pink-500/20', border: 'border-pink-500/30' },
        { id: 'theme_moonbase', name: 'Lunar Sector 7 (Room)', description: 'A cold, desolate lunar outpost viewing window replacing your static background.', currency: 'coins', cost: 30000, icon: Radio, color: 'text-zinc-400', bg: 'bg-zinc-500/10 hover:bg-zinc-500/20', border: 'border-zinc-500/30' },
        { id: 'item_title', name: 'Custom Battle Tag', description: 'Forge your own neural classification. Replace your default Role with a custom tag.', currency: 'coins', cost: 1200, icon: Crosshair, color: 'text-primary', bg: 'bg-primary/10 hover:bg-primary/20', border: 'border-primary/30' },
        { id: 'card_singularity', name: 'The Singularity Horizon', description: 'A sleek black card with a violent event horizon slowly tearing the physical edge.', currency: 'coins', cost: 2500, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-900/10 hover:bg-purple-900/20', border: 'border-purple-500/30' },
        { id: 'item_halo', name: 'Animated Avatar Halo', description: 'A continuously rotating kinetic halo overlaying your profile picture. Physics-based.', currency: 'coins', cost: 4000, icon: Crown, color: 'text-[#ff00ff]', bg: 'bg-[#ff00ff]/10 hover:bg-[#ff00ff]/20', border: 'border-[#ff00ff]/30' },
        { id: 'card_phantom', name: 'Phantom Cipher', description: 'Pure static glitch art that violently stutters and shifts hex colors randomly.', currency: 'coins', cost: 5000, icon: Zap, color: 'text-cyan-500', bg: 'bg-cyan-500/10 hover:bg-cyan-500/20', border: 'border-cyan-500/30' },
        { id: 'card_zerog', name: 'Zero-G Anomaly', description: 'Floating monolithic debris violently colliding in a dark, silent viewport.', currency: 'coins', cost: 6500, icon: ShieldCheck, color: 'text-zinc-400', bg: 'bg-zinc-500/10 hover:bg-zinc-500/20', border: 'border-zinc-500/30' },
        { id: 'card_vocal', name: 'Vocal Prototype', description: 'A pulsing digital waveform representing an active vocal cord scanning sequence.', currency: 'coins', cost: 8000, icon: Mic, color: 'text-cyan-400', bg: 'bg-cyan-400/10 hover:bg-cyan-400/20', border: 'border-cyan-400/30' },
        { id: 'card_subbass', name: 'Sub-Bass Tremor', description: 'A dark background where the actual card physically vibrates with glowing red UI shockwaves.', currency: 'coins', cost: 12000, icon: Headphones, color: 'text-red-500', bg: 'bg-red-500/10 hover:bg-red-500/20', border: 'border-red-500/30' },
        { id: 'item_supernova', name: 'Solar Supernova Aura', description: 'A massive, violently pulsing orange/red fusion explosion that entirely swallows your pod.', currency: 'coins', cost: 25000, icon: Skull, color: 'text-red-500', bg: 'bg-red-500/10 hover:bg-red-500/20', border: 'border-red-500/40' },
        { id: 'card_hyperthread', name: 'Hyper-Thread Interpolation', description: 'Golden lines of generative AI processing vectors weaving together.', currency: 'coins', cost: 35000, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10 hover:bg-yellow-400/20', border: 'border-yellow-400/30' },
        { id: 'card_chrome', name: 'Liquid Chrome', description: 'A smooth, morphing metallic silver liquid that reflects ambient CSS lighting.', currency: 'coins', cost: 45000, icon: CircleDollarSign, color: 'text-slate-300', bg: 'bg-slate-300/10 hover:bg-slate-300/20', border: 'border-slate-300/30' },
        { id: 'card_neon', name: 'Neon Assassin', description: 'A slashed neon purple katana strike constantly burning through the center of the card.', currency: 'coins', cost: 60000, icon: Crosshair, color: 'text-purple-600', bg: 'bg-purple-600/10 hover:bg-purple-600/20', border: 'border-purple-600/30' },
        { id: 'card_override', name: 'System Override', description: 'A blazing red warning screen with ACCESS GRANTED flickering chaotically.', currency: 'coins', cost: 80000, icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-600/10 hover:bg-red-600/20', border: 'border-red-600/30' },
        { id: 'card_darkmatter', name: 'Dark Matter Core', description: 'Deep space void emitting aggressive purple hawking radiation.', currency: 'coins', cost: 90000, icon: Radio, color: 'text-[#4c1d95]', bg: 'bg-[#4c1d95]/10 hover:bg-[#4c1d95]/20', border: 'border-[#4c1d95]/30' },
        { id: 'card_glitchking', name: 'The Glitch King', description: 'A highly corrupted texture map ripping the CSS border-radius apart.', currency: 'coins', cost: 150000, icon: Crown, color: 'text-white', bg: 'bg-white/10 hover:bg-white/20', border: 'border-white/30' }
    ];

    const renderEnhancementGrid = (filterCurrency: string) => {
        const filteredItems = matrixEnhancements.filter(item => item.currency === filterCurrency);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 animate-in fade-in duration-500">
                {filteredItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isEquipped = (currentUser?.enhancements || []).includes(item.id);
                    const isOwned = (currentUser?.ownedEnhancements || []).includes(item.id) || isEquipped;
                    
                    // Specific Logic Checkers
                    const userPrestige = getPilotRank(currentXp).prestige;
                    const isPrestigeLocked = !!item.requiredPrestige && userPrestige < item.requiredPrestige;
                    const isXpLocked = !!item.requiredXp && currentXp < item.requiredXp;
                    const missedSeason = item.currency === 'xp_unlock' && item.season !== undefined && userOriginSeason > item.season;

                    return (
                        <div key={item.id} className={`group relative bg-black/80 backdrop-blur-xl border ${item.border} rounded-3xl p-6 transition-all duration-500 overflow-hidden`}>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-4 rounded-2xl bg-black/50 border ${item.border} backdrop-blur-md shadow-lg`}>
                                        <ItemIcon size={24} className={`${item.color}`} />
                                    </div>
                                    <div className={`bg-black/80 border px-3 py-1.5 rounded-xl flex items-center gap-2 ${item.currency === 'coins' || missedSeason ? 'border-yellow-500/30' : (item.currency === 'xp_unlock' ? 'border-cyan-500/30' : 'border-white/20')}`}>
                                        {item.currency === 'coins' || missedSeason ? (
                                            <><CircleDollarSign size={14} className="text-yellow-500" /><span className="font-bebas text-xl text-yellow-500 tracking-widest pt-1 leading-none">{(missedSeason ? (item.missedSeasonCost || 0) : (item.cost || 0)).toLocaleString()}</span></>
                                        ) : item.currency === 'xp_unlock' ? (
                                            <><Fingerprint size={14} className="text-cyan-500" /><span className="font-bebas text-xl text-cyan-500 tracking-widest pt-1 leading-none">{item.requiredPrestige ? `PRESTIGE ${item.requiredPrestige}` : `${(item.requiredXp || 0).toLocaleString()} XP`}</span></>
                                        ) : (
                                            <span className="font-bebas text-xl text-white tracking-widest pt-1 leading-none px-2">FREE</span>
                                        )}
                                    </div>
                                </div>
                                
                                <h3 className="font-bebas text-2xl text-white tracking-widest mb-2 uppercase">{item.name}</h3>
                                <p className="font-mono text-gray-400 text-[10px] leading-relaxed mb-6 uppercase flex-1">{item.description}</p>
                                
                                {isOwned ? (
                                    <button 
                                        onClick={() => handleToggleEnhancement(item, isEquipped)}
                                        className={`w-full py-3 rounded-xl font-bebas text-lg tracking-widest flex items-center justify-center gap-3 transition-all pt-4 ${isEquipped ? 'bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-black' : 'bg-white/5 text-white border border-white/20 hover:bg-white hover:text-black'}`}
                                    >
                                        {isEquipped && <CheckCircle2 size={18} />} {isEquipped ? 'UNEQUIP LAYER' : 'EQUIP LAYER'}
                                    </button>
                                ) : (
                                    <button 
                                        disabled={isPrestigeLocked || (!missedSeason && isXpLocked)}
                                        onClick={() => handleInstallEnhancement(item)}
                                        className={`w-full py-3 rounded-xl font-bebas text-lg tracking-widest transition-all flex items-center justify-center gap-3 pt-4 
                                            ${(isPrestigeLocked || (!missedSeason && isXpLocked)) ? 'bg-red-500/10 text-red-500 border border-red-500/30 opacity-60 cursor-not-allowed' : 
                                            item.currency === 'free' ? 'bg-white/10 text-white border border-white/30 hover:bg-white hover:text-black' :
                                            item.currency === 'xp_unlock' && !missedSeason ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black' :
                                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500 hover:text-black'}
                                        `}
                                    >
                                        {isPrestigeLocked ? `REQUIRES PRESTIGE ${item.requiredPrestige}` : 
                                         !missedSeason && isXpLocked ? `REQUIRES ${(item.requiredXp || 0).toLocaleString()} XP` :
                                         item.currency === 'free' ? 'CLAIM SECURE SUBSTRATE' :
                                         !missedSeason && item.currency === 'xp_unlock' ? 'CLAIM REWARD [FREE]' :
                                         `PURCHASE MODULE`}
                                    </button>
                                )}
                            </div>
                            
                            {/* Season Tag FOMO Visualizer */}
                            {item.season && !isOwned && missedSeason && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-black text-[9px] font-black tracking-widest px-3 py-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                    MISSED PRE-SEASON {item.season} (PAYWALL ACTIVE)
                                </div>
                            )}
                            {item.season && !isOwned && !missedSeason && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[9px] font-black tracking-widest px-3 py-1 rounded opacity-50">
                                    PRE-SEASON {item.season} EXCLUSIVE
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="relative flex flex-1 w-full flex-col justify-start overflow-visible bg-transparent group/main shrink-0 min-h-max pt-12 md:pt-20 pb-0 selection:bg-yellow-500/20">
            
            {/* CINEMATIC B-ROLL BACKGROUND LAYER */}
            <div className="fixed inset-0 z-[-1] flex items-center justify-center pointer-events-none overflow-hidden">
                <video 
                    src={`/api/neural-assets?node=TREASURY&pilot=${currentUser?.uid || 'anon'}`}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover opacity-15 mix-blend-screen scale-110 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505]/90 to-black z-10" />
            </div>

            {/* CRT Persistent Filter Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[40] opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(var(--color-primary),0.04),rgba(var(--color-primary),0.01),rgba(var(--color-primary),0.04))] bg-[length:100%_4px,4px_100%] animate-pulse" />
            
            <div className="absolute top-8 left-0 right-0 z-[100] pointer-events-none px-4 md:px-8">
                {/* NEURAL IDENTITY GATEWAY DELEGATED TO PERSISTENT LAYOUT ENGINE */}
            </div>



            {activeModal && activeModal.type === 'success' && (
                <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-500`}>
                    <div className={`max-w-xl w-full bg-[#050505] border rounded-3xl p-10 flex flex-col items-center text-center relative overflow-hidden transition-all ${activeModal.border} ${activeModal.shadow}`}>
                        <div className={`p-6 rounded-full relative z-10 transition-transform duration-500 mb-8 scale-125`} style={{ backgroundColor: `${activeModal.color}20` }}>
                            {activeModal.icon && <activeModal.icon size={80} className="relative z-10 animate-bounce" style={{ color: activeModal.color }} />}
                        </div>
                        <h2 className="font-bebas text-5xl tracking-widest text-white mb-4 uppercase drop-shadow-[0_0_10px_white] relative z-10">{activeModal.title}</h2>
                        <div className="bg-black/50 border border-white/5 p-6 rounded-xl mb-8 w-full relative z-10">
                            <p className={`font-mono text-sm leading-relaxed shadow-black drop-shadow-lg ${activeModal.text}`}>{activeModal.message}</p>
                        </div>
                        <button onClick={() => setActiveModal(null)} className="font-bebas text-2xl tracking-widest py-4 w-full rounded-xl hover:bg-white hover:text-black text-white transition-all bg-transparent border-2 border-green-500 shadow-[0_0_25px_rgba(34,197,94,0.4)]">RETURN TO THE MATRIX</button>
                    </div>
                </div>
            )}

            {activeModal && activeModal.type === 'error' && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
                    <div className="relative z-[10000] bg-[#050505] border border-red-500/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 text-center">
                        <ShieldCheck size={40} className="text-red-500 animate-pulse mb-4" />
                        <h3 className="font-bebas text-3xl uppercase tracking-widest text-white mb-2">{activeModal.title}</h3>
                        <p className="font-mono text-gray-300 text-xs tracking-wider uppercase mb-8">{activeModal.message}</p>
                        <button onClick={() => setActiveModal(null)} className="w-full font-bebas text-xl bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-black transition-all py-3 rounded-xl tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.2)]">ACKNOWLEDGE</button>
                    </div>
                </div>
            )}

            {activeModal && activeModal.type === 'confirm' && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setActiveModal(null)}></div>
                    <div className="relative z-[10000] bg-[#050505] border border-yellow-500/50 rounded-3xl p-10 max-w-lg w-full shadow-[0_0_100px_rgba(234,179,8,0.15)] flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 text-center">
                        <CircleDollarSign size={50} className="text-yellow-500 mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
                        <h3 className="font-bebas text-4xl uppercase tracking-widest text-white mb-2 shadow-black drop-shadow-md">{activeModal.title}</h3>
                        <p className="font-mono text-gray-300 text-xs tracking-widest uppercase mb-10 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{activeModal.message}</p>
                        <div className="flex w-full gap-4 relative z-10">
                            <button onClick={() => setActiveModal(null)} className="flex-1 font-bebas text-xl bg-transparent border border-white/20 hover:bg-white/10 text-white transition-all py-4 rounded-xl tracking-widest uppercase">ABORT</button>
                            <button onClick={activeModal.onConfirm} className="flex-[2] font-bebas text-xl bg-yellow-500 text-black hover:bg-white hover:text-black transition-all py-4 rounded-xl tracking-widest uppercase border border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)]">{activeModal.confirmText}</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="cyber-panel p-8 md:p-14 w-full flex-1 max-w-[1700px] mx-auto relative z-50 overflow-hidden bg-black/80 border-2 border-yellow-500/20 shadow-[0_40px_100px_rgba(0,0,0,1)] rounded-t-[40px] md:rounded-[40px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 50px), calc(100% - 50px) 100%, 0 100%)' }}>
                {/* Tactical Ledger Sync Overlay */}
                <div className="absolute top-6 left-8 flex flex-col gap-1 opacity-20">
                    <span className="font-mono text-[7px] text-yellow-500 tracking-[0.5em] font-black uppercase italic">Ledger_Sync: ACTIVE</span>
                    <div className="w-16 h-0.5 bg-yellow-500/40" />
                </div>
                
                {/* Treasury Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 shrink-0 mt-4 md:mt-8">
                <div className="flex flex-col">
                    <h1 className="font-bebas text-4xl md:text-5xl tracking-widest uppercase text-white leading-none flex items-center gap-3">
                        <CircleDollarSign className="text-yellow-500" size={36} />
                        Treasury Node
                    </h1>
                    <p className="font-mono text-xs text-gray-400 tracking-[0.2em] uppercase mt-2">
                        Official V3 Alpha Coin Stripe Exchange & Matrix Customization
                    </p>
                </div>
                
                <div className="mt-4 md:mt-0 flex gap-4">
                    <div className="bg-black/50 border border-cyan-500/20 rounded-2xl p-4 flex flex-col items-end justify-center min-w-[120px]">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Lifetime XP</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bebas text-2xl text-white tracking-widest">{currentXp.toLocaleString()}</span>
                            <span className="font-bebas text-sm text-cyan-500">XP</span>
                        </div>
                    </div>
                    <div className="bg-black/50 border border-yellow-500/20 rounded-2xl p-4 flex flex-col items-end justify-center min-w-[120px]">
                        <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest">Coin Balance</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bebas text-3xl text-white tracking-widest">{currentCoins.toLocaleString()}</span>
                            <span className="font-bebas text-lg text-yellow-500">C</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex w-full gap-2 mb-8 bg-black/40 p-2 rounded-2xl border border-white/10 shrink-0 overflow-x-auto custom-scrollbar">
                <button 
                    onClick={() => setActiveTab('armory')}
                    className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 rounded-xl font-bebas text-xl tracking-widest transition-all ${activeTab === 'armory' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                    <ShoppingBag size={20} /> THE ARMORY
                </button>
                <button 
                    onClick={() => setActiveTab('blackmarket')}
                    className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 rounded-xl font-bebas text-xl tracking-widest transition-all ${activeTab === 'blackmarket' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                    <Lock size={20} /> BLACK MARKET
                </button>
                <button 
                    onClick={() => setActiveTab('archives')}
                    className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 rounded-xl font-bebas text-xl tracking-widest transition-all ${activeTab === 'archives' ? 'bg-white/20 text-white border border-white/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                    <Archive size={20} /> THE ARCHIVES
                </button>
            </div>

            {/* ARMORY TAB: Displays Stripe Packages + Coin Items */}
            {activeTab === 'armory' && (
                <>
                    <h2 className="font-bebas text-3xl text-white tracking-widest uppercase flex gap-3 items-center mb-6">
                        <CircleDollarSign className="text-yellow-500" /> ALPHACOIN INJECTION VENDORS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 mb-12">
                        {coinPackages.map((pkg) => {
                            const Icon = pkg.icon;
                            const isPurchasing = loadingPkg === pkg.id;
                            return (
                                <div key={pkg.id} className={`group relative flex flex-col h-full bg-black/80 backdrop-blur-xl border ${pkg.border} rounded-[2rem] p-8 transition-all duration-300 ${pkg.bg} ${pkg.glow} overflow-hidden hover:-translate-y-2`}>
                                    {pkg.popular && <div className="absolute top-0 right-0 bg-primary text-black font-bebas text-sm px-4 py-1 rounded-bl-xl tracking-widest z-10 hidden md:block">MOST POPULAR</div>}
                                    <div className="flex-1 flex flex-col z-10">
                                        <Icon size={32} className={`${pkg.color} mb-6 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`} />
                                        <h3 className="font-bebas text-3xl text-white tracking-widest mb-2 uppercase">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-2 mb-6 border-b border-white/10 pb-6">
                                            <span className={`font-bebas text-5xl tracking-widest leading-none ${pkg.color}`}>{pkg.coins.toLocaleString()}</span>
                                            <span className="font-bebas text-xl text-gray-500">COINS</span>
                                        </div>
                                        <span className="font-mono text-xl text-white mt-auto">{pkg.price} <span className="text-[10px] text-gray-500 align-super">USD</span></span>
                                    </div>
                                    <button 
                                        disabled={loadingPkg !== null || !isArchitect}
                                        onClick={() => handlePurchase(pkg)}
                                        className={`w-full mt-6 py-4 rounded-xl font-bebas text-xl tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${isPurchasing ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.8)]' : `bg-white/5 text-white border border-white/20 hover:bg-white pt-5 hover:text-black ${(loadingPkg !== null || !isArchitect) ? 'opacity-50 cursor-not-allowed' : ''}`}`}
                                    >
                                        {isPurchasing ? <><Loader2 size={24} className="animate-spin" /> GENERATING...</> : <>{isArchitect ? 'SECURE PACKAGE' : 'CHECKOUT SUSPENDED'}</>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <h2 className="font-bebas text-3xl text-white tracking-widest uppercase flex gap-3 items-center mb-6">
                        <ShoppingBag className="text-yellow-500" /> PREMIUM MATRICES
                    </h2>
                    {renderEnhancementGrid('coins')}
                </>
            )}

            {/* BLACK MARKET TAB: Displays XP Items */}
            {activeTab === 'blackmarket' && (
                <>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex-1">
                            <h2 className="font-bebas text-3xl text-cyan-400 tracking-widest uppercase mb-2">SEASONAL GRINDERS ONLY</h2>
                            <p className="font-mono text-[10px] text-gray-300 uppercase leading-relaxed">
                                You are currently participating in <strong className="text-white">PRE-SEASON 1</strong>. Reach the required XP thresholds below to unlock these legacy cosmetics entirely for free. If you miss this season, they will be permanently locked behind a heavy Alpha Coin paywall for all future users.
                            </p>
                        </div>
                    </div>
                    {renderEnhancementGrid('xp_unlock')}
                </>
            )}

            {/* ARCHIVES TAB: Displays FREE Items */}
            {activeTab === 'archives' && (
                <>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8">
                        <h2 className="font-bebas text-3xl text-white tracking-widest uppercase mb-2">STANDARD ISSUE HARDWARE</h2>
                        <p className="font-mono text-[10px] text-gray-400 uppercase leading-relaxed">
                            These essential identity modifications have been unlocked for all authenticated pilots. No coins or XP required.
                        </p>
                    </div>
                    {renderEnhancementGrid('free')}
                </>
            )}
            </div>
        </div>
    );
}
