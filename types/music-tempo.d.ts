declare module 'music-tempo' {
  export default class MusicTempo {
    constructor(audioData: Float32Array | number[]);
    tempo: string;
    beats: number[];
  }
}
