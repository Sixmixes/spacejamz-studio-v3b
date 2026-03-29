'use client';

import React, { useState, useEffect } from 'react';
import { db, functions } from '@/lib/firebase/config';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Database, Play, Trash2, Activity, RefreshCw, Loader2, Music, CheckCircle2, AlertCircle } from 'lucide-react';
import { CyberButton } from '@/components/ui/CyberButton';
import { ArchitectReceptacle } from './ArchitectReceptacle';

export const IngestionLedger = () => {
    const [beats, setBeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'beats'), orderBy('timestamp', 'desc'), limit(50));
        const unsub = onSnapshot(q, (snap) => {
            setBeats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`CRITICAL: Permanent wipe of [${name}] from the Monolith?`)) return;
        setActionId(id);
        try {
            await deleteDoc(doc(db, 'beats', id));
        } catch (e) {
            console.error(e);
        }
        setActionId(null);
    };

    const handleSetHome = async (id: string, url: string, name: string) => {
        setActionId(id);
        try {
            const setHomepage = httpsCallable(functions, 'setHomepageBeat');
            await setHomepage({ beatUrl: url, beatName: name });
            alert(`GLOBAL: Homepage synchronization complete for [${name}]`);
        } catch (e) {
            console.error(e);
            alert("SYSTEM ERROR: Failed to broadcast homepage override.");
        }
        setActionId(null);
    };

    return (
        <ArchitectReceptacle 
            icon={Database} 
            title="Ingestion Ledger" 
            subtitle="Global Asset Management // Neural Sync"
            className="h-full flex flex-col"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span className="text-xs font-mono tracking-[0.4em] uppercase">ACCESSING_MONOLITH...</span>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[55vh]">
                    {beats.map((beat) => (
                        <div key={beat.id} className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/60 border border-white/5 rounded-xl hover:border-primary/40 transition-all gap-4 overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                            {/* BACKGROUND STATUS BAR */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${beat.status === 'optimized' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />

                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <Music className={`w-5 h-5 ${beat.status === 'optimized' ? 'text-primary' : 'text-yellow-500'}`} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{beat.name || 'NULL_TRACK'}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">UUID: {beat.id.slice(0, 8)}...</span>
                                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${beat.status === 'optimized' ? 'border-green-500/20 text-green-500 bg-green-500/5' : 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'}`}>
                                            {beat.status?.toUpperCase() || 'INGESTING'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <a 
                                    href={beat.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="p-2.5 bg-white/5 text-white rounded-lg hover:bg-primary hover:text-black transition-all flex items-center justify-center group/btn"
                                    title="Preview Engine"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                </a>
                                
                                <button 
                                    disabled={actionId === beat.id}
                                    onClick={() => handleSetHome(beat.id, beat.url, beat.name)}
                                    className="px-4 py-2 bg-white/5 text-primary rounded-lg hover:bg-primary hover:text-black transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-primary/20 disabled:opacity-50"
                                >
                                    {actionId === beat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                                    SET_HOME
                                </button>

                                <button 
                                    disabled={actionId === beat.id}
                                    onClick={() => handleDelete(beat.id, beat.name)}
                                    className="p-2.5 bg-red-500/5 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20 disabled:opacity-50"
                                    title="Wipe Asset"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {beats.length === 0 && (
                        <div className="text-center py-10 opacity-30 flex flex-col items-center gap-3">
                            <AlertCircle className="w-8 h-8" />
                            <span className="text-[10px] font-mono tracking-widest uppercase">LEDGER_EMPTY // ALL_ASSETS_PURGED</span>
                        </div>
                    )}
                </div>
            )}
        </ArchitectReceptacle>
    );
};
export default IngestionLedger;
