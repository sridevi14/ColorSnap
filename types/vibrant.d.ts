declare module "node-vibrant" {
  interface Swatch {
    hex: string;
    rgb: [number, number, number];
    population: number;
    hsl: [number, number, number];
    getBodyTextColor(): string;
    getTitleTextColor(): string;
  }

  interface Palette {
    Vibrant?: Swatch;
    DarkVibrant?: Swatch;
    LightVibrant?: Swatch;
    Muted?: Swatch;
    DarkMuted?: Swatch;
    LightMuted?: Swatch;
  }

  class Vibrant {
    constructor(src: string | HTMLImageElement);
    getPalette(): Promise<Palette>;
    static from(src: string | HTMLImageElement): Vibrant;
  }

  export default Vibrant;
}
