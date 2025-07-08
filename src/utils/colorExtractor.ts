export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
}

/**
 * Client-side color extraction using Canvas (improved version)
 */
export const extractColorsFromImageCanvas = (imageElement: HTMLImageElement): ColorPalette => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.warn('Cannot get canvas context.');
      return {
        primary: '#2E7D32',
        secondary: '#66BB6A', 
        tertiary: '#C8E6C9'
      };
    }
    
    // Resize image (reduce large images for performance)
    const maxSize = 300;
    let { width, height } = imageElement;
    
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw image
    ctx.drawImage(imageElement, 0, 0, width, height);
    
    // Create color histogram from entire image
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Examine all pixels, but exclude colors that are too bright or dark
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      // Skip transparent or nearly transparent pixels
      if (alpha < 128) continue;
      
      // Filter colors that are too bright or dark
      const brightness = (r + g + b) / 3;
      if (brightness > 240 || brightness < 15) continue;
      
      // Filter colors with low saturation (grayscale)
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      if (saturation < 0.2) continue; // Exclude low saturation colors
      
      const hexColor = rgbToHex(r, g, b);
      colorMap.set(hexColor, (colorMap.get(hexColor) || 0) + 1);
    }
    
    if (colorMap.size === 0) {
      console.warn('No valid colors found.');
      return {
        primary: '#2E7D32',
        secondary: '#66BB6A',
        tertiary: '#C8E6C9'
      };
    }
    
    // Sort by frequency and extract top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 colors
      .map(entry => entry[0]);
    
    console.log('Extracted main colors:', sortedColors);
    
    // Select the most vibrant colors
    const vibrantColors = sortedColors
      .map(color => ({
        color,
        vibrancy: calculateVibrancy(color)
      }))
      .sort((a, b) => b.vibrancy - a.vibrancy)
      .slice(0, 3)
      .map(item => item.color);
    
    const primary = vibrantColors[0] || sortedColors[0] || '#2E7D32';
    
    // Generate harmonious secondary colors based on primary color
    const primaryHsl = hexToHsl(primary);
    
    // Generate colors with similar hue but different brightness
    const secondary = hslToHex({
      h: primaryHsl.h,
      s: Math.max(0.4, primaryHsl.s * 0.8), // Slightly reduce saturation
      l: Math.min(0.8, primaryHsl.l + 0.2)   // Increase brightness
    });
    
    const tertiary = hslToHex({
      h: (primaryHsl.h + 20) % 360, // Slightly change hue
      s: Math.max(0.3, primaryHsl.s * 0.6), // Further reduce saturation
      l: Math.min(0.9, primaryHsl.l + 0.4)   // Further increase brightness
    });
    
    const finalPalette = { primary, secondary, tertiary };
    console.log('Final palette:', finalPalette);
    
    return finalPalette;
    
  } catch (error) {
    console.error('Canvas color extraction error:', error);
    return {
      primary: '#2E7D32',
      secondary: '#66BB6A',
      tertiary: '#C8E6C9'
    };
  }
};

/**
 * Calculate color vibrancy
 */
const calculateVibrancy = (hex: string): number => {
  const { h, s, l } = hexToHsl(hex);
  
  // Give high scores to colors with good saturation and appropriate brightness
  const saturationScore = s;
  const lightnessScore = 1 - Math.abs(l - 0.5) * 2; // Higher score closer to 0.5
  const hueScore = 1; // Treat all hues equally
  
  return saturationScore * 0.6 + lightnessScore * 0.3 + hueScore * 0.1;
};

/**
 * Convert RGB to HEX
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Convert HEX to HSL
 */
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  return { h: h * 360, s, l };
};

/**
 * Convert HSL to HEX
 */
const hslToHex = ({ h, s, l }: { h: number; s: number; l: number }): string => {
  h = h % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return rgbToHex(r, g, b);
};

/**
 * Create CSS gradient from color palette
 */
export const createGradientFromPalette = (palette: ColorPalette, direction: string = 'to-r'): string => {
  return `bg-gradient-${direction} from-[${palette.primary}] via-[${palette.secondary}] to-[${palette.tertiary}]`;
};
