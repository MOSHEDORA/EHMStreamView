import { DeviceMode, DeviceConfig } from '../types';

export const DEVICE_CONFIGS: Record<DeviceMode, DeviceConfig> = {
  mobile: {
    mode: 'mobile',
    name: 'Mobile Smartphone',
    subtitle: 'Pocket Remote & Touch Control',
    iconName: 'smartphone',
    touchOptimized: true,
    density: 'touch-compact',
    defaultLayout: 'single-pane',
    hasPersistentSideMonitors: false,
    features: [
      'One-thumb touch UI with 48px+ touch targets',
      'Step-by-step mobile Bible & Song selector',
      'Floating Live Monitor sheet & quick 1-tap blackout',
      'Optimized for iPhone, Samsung Galaxy, & Android devices',
    ],
  },
  tablet: {
    mode: 'tablet',
    name: 'Tablet / iPad',
    subtitle: 'Stage & Sound Booth Controller',
    iconName: 'tablet',
    touchOptimized: true,
    density: 'comfortable',
    defaultLayout: 'split-pane',
    hasPersistentSideMonitors: false,
    features: [
      'Balanced dual-pane layout for touch and stylus',
      'Side-by-side lyrics & scripture verse navigator',
      'Collapsible live program monitor drawer',
      'Optimized for iPad Pro, iPad Air, Surface, & Galaxy Tabs',
    ],
  },
  desktop: {
    mode: 'desktop',
    name: 'Desktop / PC / Studio',
    subtitle: 'Full Pro Multi-Screen Broadcasting Suite',
    iconName: 'monitor',
    touchOptimized: false,
    density: 'studio-pro',
    defaultLayout: 'multi-pane',
    hasPersistentSideMonitors: true,
    features: [
      '3-column studio desk with persistent dual monitors',
      'Simultaneous Sanctuary Projector & OBS Lower Third feeds',
      'Keyboard shortcuts (F1 Blackout, F2 Clear, F3 Logo, PgDn)',
      'Optimized for multi-monitor sanctuary PCs, Macs, & OBS rigs',
    ],
  },
};

const STORAGE_KEY = 'worship_selected_device_mode';

export function detectSuggestedDevice(): DeviceMode {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  const isTouch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const userAgent = navigator.userAgent.toLowerCase();

  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTabletUA = /ipad|tablet|playbook|silk/i.test(userAgent) || (isTouch && width >= 768 && width <= 1200);

  if (isTabletUA || (width >= 640 && width < 1024 && isTouch)) {
    return 'tablet';
  }
  if (isMobileUA || width < 640) {
    return 'mobile';
  }
  return 'desktop';
}

export function getStoredDeviceMode(): DeviceMode | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'mobile' || saved === 'tablet' || saved === 'desktop') {
      return saved;
    }
  } catch (e) {}
  return null;
}

export function setStoredDeviceMode(mode: DeviceMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (e) {}
  applyDeviceConfiguration(mode);
}

export function applyDeviceConfiguration(mode: DeviceMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-device-mode', mode);

  // Apply device class names for customized styling hooks
  root.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
  root.classList.add(`device-${mode}`);

  // Adjust theme color and viewport meta if appropriate
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeMeta);
  }
  themeMeta.setAttribute('content', '#020617'); // slate-950
}
