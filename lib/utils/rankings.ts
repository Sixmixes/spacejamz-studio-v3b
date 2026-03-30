export const MAX_RANK = 55;
export const XP_PER_RANK = 1000;
export const XP_PER_PRESTIGE = MAX_RANK * XP_PER_RANK; // 55,000

export function getPilotRank(xp: number, prestigeLevel: number = 0) {
    if (!xp || xp <= 0) {
        return { level: 1, prestige: prestigeLevel, progress: 0, currentLevelXP: 0, isPrestigeEligible: false };
    }
    
    // Architect Override (Phase 23): Strict hard cap at 55,000 XP preventing infinite loop.
    // User must physically enter Prestige Matrix to wipe Database XP back to 0.
    const cappedXp = Math.min(xp, XP_PER_PRESTIGE);
    
    let level = Math.floor(cappedXp / XP_PER_RANK) + 1;
    if (level > MAX_RANK) level = MAX_RANK; // Safety cap
    
    const currentLevelXP = cappedXp % XP_PER_RANK;
    const progress = level === MAX_RANK ? 100 : (currentLevelXP / XP_PER_RANK) * 100;
    const isPrestigeEligible = level >= MAX_RANK || xp >= XP_PER_PRESTIGE;
    
    return {
        level,
        prestige: prestigeLevel,
        progress,
        currentLevelXP,
        isPrestigeEligible
    };
}
