import React, { useState } from 'react';
import { Play, Zap, Trash2, Upload, X, Link as LinkIcon } from 'lucide-react';

export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  producer: string;
  streamUrl?: string;
}

interface BattleDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  beats?: Beat[];
}

export default function BattleDeployModal({ 
  isOpen, 
  onClose,
  beats = [
    { id: '1', title: 'CYBERPUNK ALLEY', bpm: 140, key: 'C#m', producer: 'Matrix_Ghost' },
    { id: '2', title: 'NEURAL NET', bpm: 128, key: 'Fm', producer: 'System_Admin' },
  ]
}: BattleDeployModalProps) {
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'analyzing'>('idle');
  const [linkInput, setLinkInput] = useState('');
  const [localBeats, setLocalBeats] = useState<Beat[]>(beats);

  const handleUrlSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!linkInput) return;
      setUploadStatus('analyzing');
      try {
          const res = await fetch('/api/ingest', {
              method: 'POST',
              body: JSON.stringify({ url: linkInput })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Neural interception failed.");
          
          if (data.isPlaylist) {
              const newBeats = data.tracks.map((t: any) => ({
                  id: `link_${crypto.randomUUID()}`,
                  title: t.title,
                  bpm: 120, // Playlist assets skip heavy initial DSP decoding
                  key: "N/A",
                  producer: t.type === 'suno' ? 'Suno AI Playlist' : 'Playlist Node',
                  streamUrl: `/api/proxy?url=${encodeURIComponent(t.streamUrl)}`
              }));
              
              setLocalBeats([...newBeats, ...localBeats]);
              setSelectedBeatId(newBeats[0]?.id);
              setLinkInput('');
              return;
          }

          const proxyUrl = `/api/proxy?url=${encodeURIComponent(data.streamUrl)}`;
          const bufferRes = await fetch(proxyUrl);
          if (!bufferRes.ok) throw new Error("Could not pipe proxy stream.");
          const arrayBuffer = await bufferRes.arrayBuffer();
          
          const { analyzeAudioBuffer } = await import('@/lib/utils/audioAnalyzer');
          const { bpm, key } = await analyzeAudioBuffer(arrayBuffer);
          
          const newId = `link_${Date.now()}`;
          const newBeat: Beat = {
              id: newId,
              title: data.title,
              bpm: parseInt(bpm) || 120,
              key: key,
              producer: data.type === 'suno' ? 'Suno AI' : 'Web Stream',
              streamUrl: proxyUrl
          };
          
          setLocalBeats([newBeat, ...localBeats]);
          setSelectedBeatId(newId);
          setLinkInput('');
      } catch(err: any) {
          console.error(err);
          alert("Ingestion Error: " + err.message);
      } finally {
          setUploadStatus('idle');
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadStatus('analyzing');
      try {
          const { analyzeAudioBuffer } = await import('@/lib/utils/audioAnalyzer');
          const { bpm, key } = await analyzeAudioBuffer(file);
          const objectUrl = URL.createObjectURL(file);
          const newId = `file_${Date.now()}`;
          
          const newBeat: Beat = {
              id: newId,
              title: file.name.replace(/\.[^/.]+$/, ""),
              bpm: parseInt(bpm) || 120,
              key: key,
              producer: 'Local Drive',
              streamUrl: objectUrl
          };
          setLocalBeats([newBeat, ...localBeats]);
          setSelectedBeatId(newId);
      } catch (err: any) {
          console.error(err);
          alert("Decoding Error: " + err.message);
      } finally {
          setUploadStatus('idle');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[99999] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* GLOWING AMBIENCE CACHE */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-black/95 border border-white/10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* TOP ORBITAL HEADER */}
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start w-full">
               <div>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase truncate leading-none">
                    Deploy <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Trajectory</span>
                  </h2>
                  <p className="text-primary font-mono text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-3 leading-relaxed opacity-80">
                    Select an ingested beat to wager in the lattice.
                  </p>
               </div>
               <button 
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-full border border-white/5 hover:border-red-500/50 transition-all shrink-0 cursor-pointer"
               >
                 <X size={16} />
               </button>
            </div>
          </div>
        </div>

        {/* INVENTORY VIEWER */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto scrollbar-hide relative z-10">
           <div className="flex w-full justify-between items-center mb-6 border-b border-white/5 pb-4">
              <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase shrink-0">AVAILABLE ASSETS [{localBeats.length}]</div>
              
              <div className="flex flex-1 items-center justify-end gap-2 max-w-sm ml-4">
                  <form onSubmit={handleUrlSubmit} className="flex w-full relative">
                      <input 
                          type="text" 
                          placeholder="Paste Suno / YouTube Link"
                          value={linkInput}
                          onChange={(e) => setLinkInput(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-full pl-4 pr-16 py-2.5 text-[9px] font-mono text-white placeholder-gray-600 focus:outline-none focus:border-primary/50"
                      />
                      <button type="submit" disabled={!linkInput || uploadStatus !== 'idle'} className="absolute right-1 top-1 bottom-1 bg-white/5 hover:bg-white/10 text-white font-black px-3 rounded-full transition-colors flex items-center justify-center border border-white/10">
                          {uploadStatus === 'analyzing' ? <Zap className="w-3 h-3 text-primary animate-pulse" /> : <LinkIcon className="w-3 h-3" />}
                      </button>
                  </form>

                  <label className="cursor-pointer bg-white/[0.03] hover:bg-white/[0.08] text-white transition-colors px-4 py-2.5 rounded-full font-mono text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 border border-white/10 hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.02)] shrink-0 h-full overflow-hidden">
                      <span className="hidden sm:inline">{uploadStatus === 'analyzing' ? 'Decoding...' : 'Upload'}</span>
                      {uploadStatus === 'idle' && <Upload size={12} className="text-primary shrink-0" />}
                      <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} disabled={uploadStatus !== 'idle'} />
                  </label>
              </div>
           </div>

           <div className="space-y-4">
              {localBeats.map((beat) => (
                 <div
                    key={beat.id}
                    onClick={() => setSelectedBeatId(beat.id)}
                    className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group
                    ${selectedBeatId === beat.id 
                        ? 'bg-primary/[0.08] border-primary shadow-[0_0_30px_rgba(var(--color-primary),0.15)]' 
                        : 'bg-white/[0.02] border-white/5 hover:border-primary/30 hover:bg-white/[0.05]'
                    }`}
                 >
                    {selectedBeatId === beat.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(var(--color-primary),1)]" />
                    )}
                    
                    <div className="max-w-full sm:max-w-[70%] z-10 pl-2">
                       <h4 className="text-xl md:text-2xl font-black text-white tracking-widest truncate pb-1 xl:pb-2 uppercase">
                          {beat.title}
                       </h4>
                       <div className="flex items-center gap-3">
                         <span className="text-primary font-mono text-[9px] bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">{beat.bpm} BPM</span>
                         <span className="text-gray-400 font-mono text-[8px] uppercase tracking-[0.3em] truncate">
                            KEY: {beat.key} // BY: {beat.producer}
                         </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto z-10 relative">
                       <button className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-full transition-all group/btn" title="Purge Track">
                          <Trash2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                       </button>

                       <button className="p-3 bg-white/5 hover:bg-white text-gray-300 hover:text-black border border-white/10 hover:border-white rounded-full transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] group/btn" title="Preview Signal">
                          <Play size={14} className="ml-0.5 group-hover/btn:scale-110 transition-transform" />
                       </button>

                       {selectedBeatId === beat.id && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 md:opacity-100 flex items-center pr-4 border-l border-primary/30 h-8 ml-4 pl-4">
                             <Zap className="text-primary animate-pulse w-5 h-5 drop-shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" />
                          </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* BOTTOM ACTION RIG */}
        <div className="p-6 md:p-8 border-t border-white/5 flex gap-4 bg-black/60 backdrop-blur-3xl shrink-0 z-20">
           <button
             onClick={onClose}
             className="flex-1 py-4 md:py-5 bg-black text-gray-400 border border-white/10 rounded-xl font-mono text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white/5 hover:text-white transition-all cursor-pointer whitespace-nowrap"
           >
             [ Abort ]
           </button>

           <button
             disabled={!selectedBeatId}
             className={`flex-[2] py-4 md:py-5 rounded-xl font-black text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all flex items-center justify-center whitespace-nowrap
             ${!selectedBeatId 
                ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed' 
                : 'cursor-pointer shadow-[0_0_40px_rgba(var(--color-primary),0.3)] hover:scale-[1.02] active:scale-95 border border-primary/50'
             }`}
             style={selectedBeatId ? { backgroundColor: 'rgb(var(--color-primary))', color: '#000000' } : {}}
           >
             <span className="tracking-[0.2em] md:tracking-[0.3em] ml-[0.2em] md:ml-[0.3em]">ENGAGE MATRIX</span>
           </button>
        </div>
      </div>
    </div>
  );
}
