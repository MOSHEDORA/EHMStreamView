import { ThemeSettings, WorshipState } from '../types';

export const DEFAULT_THEME: ThemeSettings = {
  fontFamily: 'Montserrat',
  fontSize: 44,
  fontColor: '#ffffff',
  fontWeight: 'bold',
  fontItalic: false,
  textTransform: 'none',
  textAlign: 'center',
  textShadow: true,
  textOutline: false,
  lineHeight: 1.35,
  teluguFontFamily: 'Ramabhadra',

  backgroundType: 'motion_waves',
  backgroundColor: '#090d16',
  gradientFrom: '#1e1b4b',
  gradientTo: '#0f172a',
  gradientAngle: 135,
  bgImageUrl: '',

  lowerThirdStyle: 'pill',
  lowerThirdPosition: 'bottom',
  lowerThirdOpacity: 85,
  lowerThirdAccentColor: '#38bdf8',

  showSecondary: false,
  secondaryFontFamily: 'Outfit',
  secondaryFontSize: 24,
  secondaryFontColor: '#cbd5e1',
};

export const DEFAULT_STATE: WorshipState = {
  account: 'worship-main',
  displayMode: 'fullscreen',
  isBlackout: false,
  isClearText: false,
  isLogo: false,
  currentSlide: {
    id: 'welcome-1',
    type: 'lyrics',
    title: 'Welcome to Worship',
    subtitle: 'Sunday Service',
    primaryText: 'Praise the LORD with all your heart;\nSing to Him a new song with joyful shouting.',
    secondaryText: 'యెహోవాను స్తుతించుడి; ఆయనకు క్రొత్త కీర్తన పాడుడి.',
    reference: 'Psalm 33:1-3',
  },
  nextSlide: null,
  alertText: '',
  isAlertVisible: false,
  theme: DEFAULT_THEME,
  activeTab: 'lyrics',
  lastUpdated: Date.now(),
  connectedDisplaysCount: 1,
};

export const GRADIENT_PRESETS = [
  { name: 'Midnight Worship', from: '#0f172a', to: '#1e1b4b', angle: 135 },
  { name: 'Royal Majesty', from: '#2e1065', to: '#0f172a', angle: 140 },
  { name: 'Ocean Grace', from: '#082f49', to: '#0369a1', angle: 160 },
  { name: 'Golden Dawn', from: '#451a03', to: '#78350f', angle: 120 },
  { name: 'Ember Fire', from: '#4c0519', to: '#881337', angle: 135 },
  { name: 'Emerald Sanctuary', from: '#022c22', to: '#064e3b', angle: 150 },
  { name: 'Pure Obsidian', from: '#09090b', to: '#18181b', angle: 180 },
  { name: 'Clean White (Church Hall)', from: '#f8fafc', to: '#e2e8f0', angle: 180 },
];

export const FONT_OPTIONS: { name: string; label: string; sample: string; isTelugu?: boolean }[] = [
  { name: 'Ramabhadra', label: 'Ramabhadra (Telugu Default)', sample: 'పరిశుద్ధుడు పరిశుద్ధుడు యెహోవా', isTelugu: true },
  { name: 'Montserrat', label: 'Montserrat (Modern Clean)', sample: 'Amazing Grace, How Sweet' },
  { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Crisp UI)', sample: 'Praise the Lord O My Soul' },
  { name: 'Playfair Display', label: 'Playfair Display (Sacred Serif)', sample: 'Holy, Holy, Holy is the Lord' },
  { name: 'Cinzel', label: 'Cinzel (Majestic Traditional)', sample: 'KING OF KINGS & LORD OF LORDS' },
  { name: 'Lora', label: 'Lora (Editorial Scripture)', sample: 'The Lord is my shepherd, I shall not want' },
  { name: 'Oswald', label: 'Oswald (High-Impact Condensed)', sample: 'GREAT ARE YOU LORD IN ALL THE EARTH' },
  { name: 'Outfit', label: 'Outfit (Friendly Contemporary)', sample: 'Goodness of God all my life' },
  { name: 'Roboto Slab', label: 'Roboto Slab (Bold Architectural)', sample: 'Blessed Be The Name Of The Lord' },
];
