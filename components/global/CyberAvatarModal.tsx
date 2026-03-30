'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { auth, storage, db } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { X, UploadCloud, RefreshCw, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CyberButton } from '@/components/ui/CyberButton';
import CyberGlitchButton  from '@/components/ui/CyberGlitchButton';

export function CyberAvatarModal() {
    const { currentUser, setUser } = useUserStore();
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string>('');
    const [editBannerY, setEditBannerY] = useState<number>(50);
    const [editBannerZoom, setEditBannerZoom] = useState<number>(1);
    
    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [dragStartBannerY, setDragStartBannerY] = useState(50);

    useEffect(() => {
        const handleOpenCalib = (e: any) => {
            const url = e.detail?.url;
            if(url && currentUser) {
                setSelectedBannerFile(null);
                setBannerPreviewUrl(url);
                setEditBannerY(url === currentUser.customBannerUrl ? (currentUser.bannerPositionY ?? 50) : 50);
                setEditBannerZoom(url === currentUser.customBannerUrl ? (currentUser.bannerZoom ?? 1) : 1);
                const modal = document.getElementById('avatar-editor-modal') as HTMLElement | null;
                if (modal?.showPopover) modal.showPopover();
            }
        };
        window.addEventListener('OPEN_BANNER_CALIBRATION', handleOpenCalib);
        return () => window.removeEventListener('OPEN_BANNER_CALIBRATION', handleOpenCalib);
    }, [currentUser]);

    if (!currentUser) return null;

    const handleDiscordSync = async () => {
        try {
            setUploading(true);
            setErrorMsg("");
            
            // Search provider data for original discord payload
            const discordProfile = auth.currentUser?.providerData.find(p => p.providerId.includes('discord'));
            const avatarUrl = discordProfile?.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`;
            
            await updateDoc(doc(db, 'users', currentUser.uid), {
                photoURL: avatarUrl
            });
            setUser({ photoURL: avatarUrl });
            
            // Close modal natively
            const modal = document.getElementById('avatar-editor-modal') as HTMLElement | null;
            if (modal?.hidePopover) modal.hidePopover();
            
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to sync discord config.");
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Basic validation: must be image and reasonable size (<5MB)
        if (!file.type.startsWith('image/')) {
            setErrorMsg("INVALID_DATA: File must be an image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
             setErrorMsg("ERR_OVERFLOW: Matrix cap at 5MB.");
             return;
        }

        try {
            setUploading(true);
            setErrorMsg("");
            
            const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            
            await updateDoc(doc(db, 'users', currentUser.uid), {
                photoURL: downloadUrl
            });
            
            setUser({ photoURL: downloadUrl });
            
            // Close modal natively
            const modal = document.getElementById('avatar-editor-modal') as HTMLElement | null;
            if (modal?.hidePopover) modal.hidePopover();
            
        } catch (err: any) {
            setErrorMsg(err.message || "Storage link failed. Check rules or try again.");
        } finally {
             setUploading(false);
        }
    };

    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setErrorMsg("INVALID_DATA: Banner must be an image format.");
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setErrorMsg("ERR_OVERFLOW: Banner matrix cap at 8MB.");
            return;
        }
        setSelectedBannerFile(file);
        setBannerPreviewUrl(URL.createObjectURL(file));
        setEditBannerY(currentUser.bannerPositionY ?? 50);
        setEditBannerZoom(currentUser.bannerZoom ?? 1);
        setErrorMsg("");
    };

    const startEditingExistingBanner = () => {
        if (!currentUser.customBannerUrl) return;
        setSelectedBannerFile(null);
        setBannerPreviewUrl(currentUser.customBannerUrl);
        setEditBannerY(currentUser.bannerPositionY ?? 50);
        setEditBannerZoom(currentUser.bannerZoom ?? 1);
        setErrorMsg("");
    };

    const commitBannerConfig = async () => {
        try {
            setUploading(true);
            setErrorMsg("");
            
            // Critical Matrix Routing: prioritize the new blob URL or explicitly provided Firebase URL from Grid Context if File is null
            let downloadUrl = selectedBannerFile ? '' : bannerPreviewUrl || currentUser.customBannerUrl || '';
            
            if (selectedBannerFile) {
                const storageRef = ref(storage, `banners/${currentUser.uid}/${Date.now()}_${selectedBannerFile.name}`);
                const snapshot = await uploadBytes(storageRef, selectedBannerFile);
                downloadUrl = await getDownloadURL(snapshot.ref);
            }

            if (!downloadUrl) throw new Error("CRITICAL FLUSH: Missing Source Image.");

            await updateDoc(doc(db, 'users', currentUser.uid), {
                customBannerUrl: downloadUrl,
                bannerPositionY: editBannerY,
                bannerZoom: editBannerZoom
            });
            
            setUser({ 
                customBannerUrl: downloadUrl,
                bannerPositionY: editBannerY,
                bannerZoom: editBannerZoom
            });
            
            setSelectedBannerFile(null);
            setBannerPreviewUrl('');
            
            const modal = document.getElementById('avatar-editor-modal') as HTMLElement | null;
            if (modal?.hidePopover) modal.hidePopover();
            
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to finalize banner injection.");
        } finally {
            setUploading(false);
        }
    };

    const cancelBannerEdit = () => {
        setSelectedBannerFile(null);
        setBannerPreviewUrl('');
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setDragStartY(e.clientY);
        setDragStartBannerY(editBannerY);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const deltaY = e.clientY - dragStartY;
        // Sensitivity calibration: drag down (positive delta) = surface higher part of image (decrease Y%)
        const sensitivity = 0.35; 
        let newY = dragStartBannerY - (deltaY * sensitivity);
        newY = Math.max(0, Math.min(100, newY));
        setEditBannerY(newY);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div id="avatar-editor-modal" popover="auto" className="cyber-modal backdrop:bg-black/80 backdrop:backdrop-blur-sm bg-transparent !p-0 max-w-lg w-full rounded-none border border-[#00ffff]/30 shadow-[0_0_50px_rgba(0,255,255,0.1)] outline-none overflow-y-auto max-h-[90vh] scrollbar-none fixed inset-0 m-auto z-[99999] open:animate-in open:zoom-in-95 open:fade-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 md:p-6 bg-black/90 border-b border-[#00ffff]/20">
                <div className="flex items-center gap-3">
                    <ImageIcon className="text-[#00ffff] shrink-0" size={20} />
                    <h2 className="font-bebas text-2xl md:text-3xl tracking-widest text-[#00ffff] uppercase leading-none drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                        Identity Injector
                    </h2>
                </div>
                <button 
                   popoverTarget="avatar-editor-modal" 
                   popoverTargetAction="hide"
                   className="text-white/50 hover:text-red-500 hover:rotate-90 transition-all duration-300 focus:outline-none"
                >
                    <X size={24} />
                </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 md:p-8 bg-[#050505] relative z-10 flex flex-col items-center">
                
                {bannerPreviewUrl ? (
                    // BANNER CALIBRATION UI
                    <div className="w-full flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-500">
                        <h3 className="text-[#00ffff] font-bebas text-2xl mb-6 tracking-widest uppercase shadow-none text-center drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">Calibrate Visual Matrix</h3>
                        
                        <div 
                            className={`w-full h-32 md:h-48 overflow-hidden relative border-2 border-[#00ffff]/40 shadow-[0_0_30px_rgba(0,255,255,0.1)] mb-8 bg-black select-none touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                        >
                            {/* Miniature Navbar Mockup Overlay */}
                            <div className="absolute top-0 left-0 w-full h-[25%] bg-black/80 backdrop-blur-md border-b border-[#00ffff]/20 flex items-center px-3 z-20 pointer-events-none gap-3 overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                <div className="flex items-center gap-1 shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00ffff]/40 border border-[#00ffff]" />
                                    <span className="font-bebas text-[9px] text-white tracking-[0.2em] uppercase">SPACEJAMZ</span>
                                </div>
                                <div className="w-[1px] h-3 bg-white/20 shrink-0" />
                                <span className="font-bebas text-[7px] text-white/50 tracking-[0.2em] hidden sm:block shrink-0">ENTER THE ARENA</span>
                                <div className="w-[1px] h-3 bg-white/20 hidden sm:block shrink-0" />
                                <span className="font-bebas text-[7px] text-yellow-500/80 tracking-[0.2em] shrink-0">TREASURY</span>
                                <div className="flex-1" />
                                <div className="w-4 h-4 rounded-full bg-white/10 border border-white/20 shrink-0" />
                                <div className="w-4 h-4 rounded-md bg-white/10 border border-white/20 shrink-0" />
                            </div>

                            <img 
                                src={bannerPreviewUrl} 
                                style={{ objectPosition: `center ${editBannerY}%`, transform: `scale(${editBannerZoom})` }} 
                                className={`w-full h-full object-cover origin-center ${isDragging ? 'transition-none' : 'transition-all duration-300'} ${uploading ? 'opacity-30 blur-sm' : ''} pointer-events-none`}
                                draggable={false}
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                                    <Loader2 className="animate-spin text-[#00ffff]" size={36} />
                                </div>
                            )}
                            
                            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-[#00ffff]/60 uppercase tracking-widest z-20 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-[#00ffff]/20">
                                [ Drag Vertical ]
                            </div>
                        </div>
                        
                        <div className="w-full flex flex-col gap-6 mb-8 px-2 md:px-0">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="font-mono text-xs text-[#00ffff]/80 uppercase tracking-widest font-black flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-pulse" /> Y-Axis Offset</label>
                                    <span className="font-mono text-xs text-[#00ffff] px-2 bg-[#00ffff]/10 border border-[#00ffff]/30">{editBannerY}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" 
                                    value={editBannerY} 
                                    onChange={e => setEditBannerY(Number(e.target.value))} 
                                    className="w-full h-2 bg-[#00ffff]/20 appearance-none outline-none cursor-pointer accent-[#00ffff]" 
                                    disabled={uploading}
                                />
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="font-mono text-xs text-purple-400/80 uppercase tracking-widest font-black flex items-center gap-2"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" /> Optical Zoom</label>
                                    <span className="font-mono text-xs text-purple-400 px-2 bg-purple-500/10 border border-purple-500/30">{editBannerZoom.toFixed(2)}x</span>
                                </div>
                                <input 
                                    type="range" min="1" max="3" step="0.05" 
                                    value={editBannerZoom} 
                                    onChange={e => setEditBannerZoom(Number(e.target.value))} 
                                    className="w-full h-2 bg-purple-500/20 appearance-none outline-none cursor-pointer accent-purple-500" 
                                    disabled={uploading}
                                />
                            </div>
                        </div>

                        <div className="w-full flex gap-3">
                            <button onClick={cancelBannerEdit} disabled={uploading} className="flex-1 p-3 border border-red-500/30 text-red-500 font-bebas text-xl hover:bg-red-500/10 transition-colors uppercase cursor-pointer disabled:opacity-50">Abort</button>
                            <button onClick={commitBannerConfig} disabled={uploading} className="flex flex-[2] items-center justify-center p-3 bg-[#00ffff]/10 border border-[#00ffff]/40 text-[#00ffff] font-bebas text-xl hover:bg-[#00ffff]/20 transition-all uppercase cursor-pointer font-black tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] disabled:opacity-50">Lock Trajectory</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Current Avatar Preview */}
                        <div className="relative group w-32 h-32 md:w-48 md:h-48 mb-8 border-2 border-[#00ffff]/40 p-1 bg-black/60 overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.1)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
                            <img 
                                src={currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.uid}`} 
                                className={`w-full h-full object-cover transition-all duration-500 ${uploading ? 'opacity-30 blur-sm' : ''}`}
                                alt="Current Pilot Identity"
                            />
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-[#00ffff]" size={32} />
                                </div>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="w-full mb-6 p-3 border-l-2 border-red-500 bg-red-500/10 font-mono text-[9px] md:text-xs text-red-500 tracking-widest uppercase animate-in fade-in">
                                {errorMsg}
                            </div>
                        )}
                        
                        <input 
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <input 
                            type="file"
                            accept="image/*"
                            ref={bannerInputRef}
                            className="hidden"
                            onChange={handleBannerSelect}
                        />

                        <div className="w-full flex flex-col gap-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="group relative w-full flex items-center justify-center gap-3 p-4 bg-black/40 border border-[#00ffff]/30 hover:bg-[#00ffff]/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                            >
                                <div className="absolute inset-0 z-[1] bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.05)_50%,transparent_75%)] bg-[length:10px_10px] pointer-events-none" />
                                <UploadCloud size={20} className="text-[#00ffff] group-hover:-translate-y-1 transition-transform relative z-10" />
                                <span className="font-mono text-xs tracking-[0.2em] font-black uppercase text-[#00ffff] relative z-10">Upload Secure Visual</span>
                            </button>
                            
                            <button 
                                onClick={handleDiscordSync}
                                disabled={uploading}
                                className="group relative w-full flex items-center justify-center gap-3 p-4 bg-black/40 border border-purple-500/30 hover:bg-purple-500/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                            >
                                <RefreshCw size={18} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                                <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] font-black uppercase text-purple-400 relative z-10">Sync Root Discord Identity</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    const modal = document.getElementById('avatar-editor-modal') as HTMLElement | null;
                                    if (modal?.hidePopover) modal.hidePopover();
                                    router.push('/ai');
                                }}
                                disabled={uploading}
                                className="group relative w-full flex items-center justify-center gap-3 p-4 bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                            >
                                <Sparkles size={18} className="text-primary animate-pulse group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                                <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] font-black uppercase text-primary relative z-10">Generate via FlixSynth Art Foundry</span>
                            </button>

                            {/* BANNER INJECTION MODULE */}
                            <div className="w-full mt-4 pt-6 border-t border-[#00ffff]/20 flex flex-col gap-3 relative animate-in slide-in-from-top-4">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] bg-[#050505] px-2 text-[#00ffff]/50 tracking-[0.2em] uppercase">Banner Module</span>
                                
                                <button onClick={() => bannerInputRef.current?.click()} className="group relative w-full flex items-center justify-center gap-3 p-3 bg-black/40 border border-dashed border-[#00ffff]/30 hover:bg-[#00ffff]/10 transition-colors uppercase disabled:opacity-50" disabled={uploading}>
                                    <span className="font-mono text-[10px] md:text-xs text-[#00ffff]/80 tracking-widest font-black group-hover:text-[#00ffff] transition-colors">{currentUser.customBannerUrl ? 'Overwrite Visual Mesh' : 'Upload Banner Mesh'}</span>
                                </button>

                                {currentUser.customBannerUrl && (
                                    <button onClick={startEditingExistingBanner} className="group relative w-full flex flex-col items-center justify-center gap-1 p-2 bg-[#00ffff]/5 border border-[#00ffff]/20 hover:bg-[#00ffff]/10 transition-colors uppercase disabled:opacity-50" disabled={uploading}>
                                        <span className="font-mono text-[9px] text-[#00ffff] tracking-[0.3em] font-black uppercase">Calibrate Trajectory</span>
                                        <span className="font-mono text-[7px] text-[#00ffff]/60 uppercase tracking-[0.2em]">Y-Axis & Zoom Options</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <style jsx>{`
                .cyber-modal[popover]::backdrop {
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                }
            `}</style>
        </div>
    );
}
