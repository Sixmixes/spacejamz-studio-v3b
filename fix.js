const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Users', 'kroni', 'OneDrive', 'Desktop', 'spacejamz-studio-v3b', 'app', '(gated)', 'ai', 'page.tsx');
let text = fs.readFileSync(file, 'utf8');

const replacementTop = 
            {/* TACTICAL NAVIGATION (FOUNDRY CATEGORIES) */}
            <div className="w-full max-w-[1800px] mx-auto px-2 md:px-8 mt-4 z-20">
                <div className="flex sm:grid sm:grid-cols-4 gap-2 md:gap-4 overflow-x-auto pb-2 px-2 md:px-0 scrollbar-none snap-x snap-mandatory rounded-2xl">
                    {(['flixsynth', 'deforum', 'vocal_dna', 'neural_swap'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => { setActiveTab(tab); setNeuralState('IDLE'); setLastOutput(null); }}
                            className={\shrink-0 w-[130px] sm:w-auto snap-center flex flex-col items-center justify-center p-3 md:p-4 transition-all duration-300 border relative overflow-hidden group shadow-[0_5px_15px_rgba(0,0,0,0.5)] \\}
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                        >
                            {tab === 'flixsynth' && <ImageIcon size={16} className={\mb-1.5 md:w-[18px] md:h-[18px] \\} />}
                            {tab === 'deforum' && <Video size={16} className={\mb-1.5 md:w-[18px] md:h-[18px] \\} />}
                            {tab === 'vocal_dna' && <Terminal size={16} className={\mb-1.5 md:w-[18px] md:h-[18px] \\} />}
                            {tab === 'neural_swap' && <Database size={16} className={\mb-1.5 md:w-[18px] md:h-[18px] \\} />}
                            <span className="font-mono text-[9px] md:text-[10px] items-center text-center font-black uppercase tracking-[0.1em] px-1">
                                {tab === 'flixsynth' ? 'FLIXSYNTH' : tab === 'deforum' ? 'DEFORUM' : tab === 'vocal_dna' ? 'VOCAL DNA' : 'NEURAL SWAP'}
                            </span>
                            <div className={\bsolute top-2 right-2 w-1.5 h-1.5 rounded-full \\} />
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN FOUNDRY WORKSPACE */}
            <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-20 z-30">
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 border-b-2 border-primary/20 pb-4 md:pb-6 gap-4">
                        <div className="flex items-center gap-3 md:gap-6">
                            <div className="p-2.5 md:p-4 bg-primary/10 border border-primary/30 rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.2)] shrink-0">
                                {activeTab === 'flixsynth' && <ImageIcon className="w-5 h-5 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                                {activeTab === 'deforum' && <Video className="w-5 h-5 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                                {activeTab === 'vocal_dna' && <Terminal className="w-5 h-5 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                                {activeTab === 'neural_swap' && <Database className="w-5 h-5 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-widest uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-none">
                                    {activeTab === 'flixsynth' ? 'FLIXSYNTH STUDIO' : activeTab === 'deforum' ? 'VIDEO ENGINE' : activeTab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP'}
                                </h2>
                                <p className="font-mono text-[8px] sm:text-[11px] text-primary/60 uppercase tracking-[0.1em] md:tracking-[0.5em] font-bold mt-1 leading-tight pr-4 truncate">
                                    [ SYNTHESIZING ORIGINAL MISSION ASSETS ]
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1 bg-black/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] w-full md:w-auto">
                            <div className="flex items-center gap-2 text-white">
                                <Coins size={14} className="text-yellow-500" />
                                <span className="font-bebas text-2xl md:text-3xl tracking-widest">{currentUser?.coinsBalance?.toLocaleString() || '0'} C</span>
                            </div>
                            <span className="text-[7px] md:text-[8px] font-mono text-primary/40 tracking-widest uppercase font-black">Treasury Liquid Balance</span>
                        </div>
                    </div>

;

const archiveMarker = '{/* RECENT ARCHIVES (Matching core landing grid) */}';
const glitchStart = '<div className="cyber-glitch-container';
const innerModalStart = '<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">';
const modalClose = '</NeuralModal>';

const glitchIndex = text.indexOf(glitchStart);
const archiveIndex = text.indexOf(archiveMarker);
const modalOuterStart = text.indexOf('<NeuralModal');
const modalInnerStartIndex = text.indexOf(innerModalStart);
const modalEnd = text.indexOf(modalClose);

if (glitchIndex > 0 && archiveIndex > 0 && modalEnd > 0) {
    // 1. Extract RECENT ARCHIVES
    const archivesContent = text.substring(archiveIndex, modalOuterStart);
    // Remove trailing </div> </div> which closed glitch-container
    const cleanArchives = archivesContent.replace(/<\/div>\s*<\/div>\s*$/, '            </div>\n');

    // 2. Extract INNER MODAL CONTENT
    // The inner content ends right before </NeuralModal>
    let innerContent = text.substring(modalInnerStartIndex, modalEnd);

    // 3. Assemble New Render Block
    let newText = text.substring(0, glitchIndex) + replacementTop + innerContent + "\n\n                " + cleanArchives + "\n" + text.substring(modalEnd + modalClose.length);
    
    fs.writeFileSync(file, newText);
    console.log("REPLACED SUCCESSFULLY!");
} else {
    console.error("Failed to find indexes:", { glitchIndex, archiveIndex, modalInnerStartIndex, modalEnd });
}
