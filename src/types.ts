export type DisplayMode = 'fullscreen' | 'lowerthird';

export type FontChoice =
  | 'Ramabhadra'
  | 'Montserrat'
  | 'Plus Jakarta Sans'
  | 'Playfair Display'
  | 'Cinzel'
  | 'Lora'
  | 'Oswald'
  | 'Outfit'
  | 'Roboto Slab';

export type BackgroundType =
  | 'gradient'
  | 'solid'
  | 'motion_waves'
  | 'motion_particles'
  | 'motion_stars'
  | 'image'
  | 'transparent';

export type LowerThirdStyle =
  | 'pill'
  | 'full_banner'
  | 'floating_box'
  | 'subtle_glass'
  | 'cinematic_bar';

export interface ThemeSettings {
  fontFamily: FontChoice;
  fontSize: number; // in pixels (e.g. 28 to 72)
  fontColor: string;
  fontWeight: 'normal' | 'semibold' | 'bold' | 'black';
  fontItalic: boolean;
  textTransform: 'none' | 'uppercase';
  textAlign: 'center' | 'left' | 'right';
  textShadow: boolean;
  textOutline: boolean;
  lineHeight: number; // 1.2 to 1.8
  
  // Telugu Font Configuration (Defaults to Ramabhadra)
  teluguFontFamily?: string;
  
  // Background
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  bgImageUrl: string;
  
  // Lower third specific
  lowerThirdStyle: LowerThirdStyle;
  lowerThirdPosition: 'bottom' | 'top';
  lowerThirdOpacity: number; // 0 to 100
  lowerThirdAccentColor: string;
  
  // Secondary / Dual Language styling
  showSecondary: boolean;
  secondaryFontFamily: FontChoice;
  secondaryFontSize: number;
  secondaryFontColor: string;
}

export type SlideType = 'lyrics' | 'bible' | 'media' | 'alert' | 'blank';

export interface SlideContent {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  primaryText: string;
  secondaryText?: string;
  reference?: string;
  primaryLanguage?: string;
  secondaryLanguage?: string;
  copyright?: string;
}

export interface SongSection {
  id: string;
  label: string; // "Verse 1", "Chorus", "Bridge", etc.
  primaryText: string;
  secondaryText?: string;
  lines?: string[];
  secondaryLines?: string[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key?: string;
  tempo?: string;
  ccli?: string;
  tags?: string[];
  sections: SongSection[];
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleVersion {
  id: string;
  name: string;
  language: string;
  flag: string;
  verses: Record<string, string>; // "GEN.1.1" -> "In the beginning..."
}

export interface WorshipState {
  account: string;
  displayMode: DisplayMode;
  isBlackout: boolean;
  isClearText: boolean;
  isLogo: boolean;
  currentSlide: SlideContent | null;
  nextSlide: SlideContent | null;
  alertText: string;
  isAlertVisible: boolean;
  theme: ThemeSettings;
  activeTab: 'bible' | 'lyrics' | 'media' | 'setlist' | 'stage';
  lastUpdated: number;
  connectedDisplaysCount?: number;
}

export interface WsMessage {
  type: 'join' | 'sync' | 'update_state' | 'ping' | 'pong' | 'users_updated' | 'get_users' | 'count_update' | 'init';
  account?: string;
  clientType?: 'operator' | 'display' | 'stage';
  state?: Partial<WorshipState>;
  users?: RegisteredUser[];
  count?: number;
}

export interface UserSession {
  accountName: string;
  churchName: string;
  operatorName: string;
  role: string;
  isLoggedIn: boolean;
  loginTime?: number;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  churchName: string;
  role: string;
  accountSlug?: string;
  onlineDevices?: number;
  createdAt: number;
}
