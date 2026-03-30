import codecs

path = 'app/(gated)/ai/page.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

# The 4 big boxes start at line 382:
target_grid = """<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-20">"""
grid_idx = text.find(target_grid)

# Recent Archives starts at:
archive_start_marker = """{/* RECENT ARCHIVES (Matching core landing grid) */}"""
archive_idx = text.find(archive_start_marker)

# NeuralModal starts at:
modal_start_marker = """<NeuralModal"""
modal_idx = text.find(modal_start_marker)

# NeuralModal inner content starts at:
inner_start_marker = """<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">"""
inner_idx = text.find(inner_start_marker)

# NeuralModal closing tag:
modal_close_marker = """</NeuralModal>"""
modal_close_idx = text.find(modal_close_marker)

if grid_idx > 0 and archive_idx > 0 and inner_idx > 0 and modal_close_idx > 0:
    # 1. Create the new Tab Slider + Tool Header
    new_top = """
            {/* TACTICAL NAVIGATION (FOUNDRY CATEGORIES) */}
            <div className="w-full mt-2 mb-10 z-20 overflow-hidden">
                <div className="flex sm:grid sm:grid-cols-4 gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                    {(['flixsynth', 'deforum', 'vocal_dna', 'neural_swap'] as const).map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => { setActiveTab(tab); setNeuralState('IDLE'); setLastOutput(null); }}
                            className={`shrink-0 w-[140px] sm:w-auto snap-center flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 border relative overflow-hidden group shadow-[0_5px_15px_rgba(0,0,0,0.5)] rounded-2xl ${activeTab === tab ? 'bg-[#00ffff]/10 text-[#00ffff] border-[#00ffff]/80 shadow-[0_0_20px_rgba(0,255,255,0.2)]' : 'bg-black/60 text-white/70 font-bold border-white/10 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/5 hover:text-white'}`}
                        >
                            {tab === 'flixsynth' && <ImageIcon size={24} className={`mb-3 ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'deforum' && <Video size={24} className={`mb-3 ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'vocal_dna' && <Terminal size={24} className={`mb-3 ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            {tab === 'neural_swap' && <Database size={24} className={`mb-3 ${activeTab === tab ? 'animate-pulse' : ''}`} />}
                            <span className="font-mono text-[10px] md:text-[12px] items-center text-center font-black uppercase tracking-[0.2em]">
                                {tab === 'flixsynth' ? 'FLIXSYNTH' : tab === 'deforum' ? 'DEFORUM' : tab === 'vocal_dna' ? 'VOCAL DNA' : 'NEURAL SWAP'}
                            </span>
                            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${activeTab === tab ? 'bg-[#00ffff] animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'bg-primary/20'}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 border-b border-primary/20 pb-6 gap-4 animate-in fade-in duration-700">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="p-3 md:p-5 bg-primary/10 border border-primary/30 rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.2)] shrink-0">
                        {activeTab === 'flixsynth' && <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                        {activeTab === 'deforum' && <Video className="w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                        {activeTab === 'vocal_dna' && <Terminal className="w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                        {activeTab === 'neural_swap' && <Database className="w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse cyber-flicker-slow" />}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black font-bebas tracking-[0.1em] uppercase text-white leading-none">
                            {activeTab === 'flixsynth' ? 'FLIXSYNTH STUDIO' : activeTab === 'deforum' ? 'VIDEO ENGINE' : activeTab === 'vocal_dna' ? 'NEURAL BLUEPRINT' : 'NEURAL SWAP'}
                        </h2>
                        <p className="font-mono text-[9px] sm:text-[11px] text-primary/60 uppercase tracking-[0.2em] md:tracking-[0.5em] font-bold mt-2">
                            [ ACTIVE GENERATION PORT ]
                        </p>
                    </div>
                </div>
            </div>

"""
    
    # 2. Extract Archives
    text_before_grid = text[:grid_idx]
    archives_block = text[archive_idx:modal_idx]
    archives_cleaned = archives_block
    split_archives = archives_cleaned.rsplit("</div>", 2)
    if len(split_archives) == 3:
        archives_cleaned = split_archives[0]
    
    # Extract inner modal content.
    inner_block = text[inner_idx:modal_close_idx]
    
    inner_cleaned = inner_block
    split_inner = inner_cleaned.rsplit("</div>", 2)
    if len(split_inner) == 3:
        inner_cleaned = split_inner[0]
    
    end_matter = text[modal_close_idx + len(modal_close_marker):]

    final_str = text_before_grid + new_top + inner_cleaned + "\n\n            <div className=\"mt-20 w-full\">\n            " + archives_cleaned + "\n            </div>\n            </div>\n            </div>\n" + end_matter
    
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(final_str)
    print("SUCCESSFULLY REFACTORED AI LAYOUT")
else:
    print("COULD NOT FIND INDEXES")
    print(f"GRID: {grid_idx}, ARCHIVE: {archive_idx}, MODAL: {modal_idx}, FINAL: {modal_close_idx}")
