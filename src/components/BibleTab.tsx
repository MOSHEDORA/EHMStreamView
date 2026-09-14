import React, { useState, useMemo, useEffect } from 'react';
import {
  BIBLE_LANGUAGES,
  POPULAR_VERSES,
  BIBLE_BOOKS_META,
  VerseItem,
  resolveScriptureReference,
} from '../data/bibleData';
import { SlideContent, WorshipState } from '../types';
import {
  BookOpen,
  Search,
  Languages,
  Play,
  Eye,
  CheckCircle2,
  Maximize2,
  Tv,
  ChevronLeft,
  ChevronRight,
  History,
  Sparkles,
  Columns,
  Rows,
  CornerDownLeft,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface BibleTabProps {
  state: WorshipState;
  onGoLive: (slide: SlideContent, mode?: 'fullscreen' | 'lowerthird') => void;
  onSetNext: (slide: SlideContent) => void;
  onUpdateTheme: (updates: any) => void;
}

export const BibleTab: React.FC<BibleTabProps> = ({
  state,
  onGoLive,
  onSetNext,
  onUpdateTheme,
}) => {
  // 1. Translations & Parallel View State (VerseVIEW core feature)
  const [primaryLang, setPrimaryLang] = useState<string>('en-kjv');
  const [secondaryLang, setSecondaryLang] = useState<string>('te-sv');
  const [enableParallel, setEnableParallel] = useState<boolean>(state.theme.showSecondary);
  const [parallelLayout, setParallelLayout] = useState<'stacked' | 'sideBySide'>('stacked');
  const [targetMode, setTargetMode] = useState<'fullscreen' | 'lowerthird'>('fullscreen');

  // 2. Direct Search / Fast Reference Input (BibleShow & VerseVIEW quick lookup)
  const [quickInput, setQuickInput] = useState<string>('John 3:16');
  const [resolvedPreview, setResolvedPreview] = useState<VerseItem | null>(null);

  // 3. VerseVIEW / BibleShow 3-Step Click Navigator
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [bookSearch, setBookSearch] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('John');
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [selectedVerse, setSelectedVerse] = useState<number>(16);

  // 4. Scripture History (BibleShow recent list)
  const [recentHistory, setRecentHistory] = useState<string[]>(() => {
    return ['John 3:16', 'Psalm 23:1', 'Romans 8:28', 'Philippians 4:13'];
  });

  // Mobile step navigation for phone/tablet responsiveness ('book' | 'chapter_verse' | 'preview')
  const [mobileStep, setMobileStep] = useState<'book' | 'chapter_verse' | 'preview'>('chapter_verse');

  // Filter books for Column 1
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS_META.filter((b) => {
      if (testamentFilter === 'OT' && b.testament !== 'OT') return false;
      if (testamentFilter === 'NT' && b.testament !== 'NT') return false;
      if (bookSearch.trim()) {
        const q = bookSearch.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.aliases.some((a) => a.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [testamentFilter, bookSearch]);

  // Current active book metadata
  const currentBookMeta = useMemo(() => {
    return BIBLE_BOOKS_META.find((b) => b.name === selectedBook) || BIBLE_BOOKS_META[42]; // Default John
  }, [selectedBook]);

  // Max chapters and verses
  const chapterCount = currentBookMeta.chapters || 1;
  const verseCount = 36; // standard friendly grid range for chapters

  // Resolve quick input automatically
  useEffect(() => {
    if (!quickInput.trim()) {
      setResolvedPreview(null);
      return;
    }
    const resolved = resolveScriptureReference(quickInput);
    if (resolved && resolved.foundItem) {
      setResolvedPreview(resolved.foundItem);
    } else {
      // Find in popular verses if any
      const matched = POPULAR_VERSES.find((v) =>
        v.reference.toLowerCase().includes(quickInput.trim().toLowerCase())
      );
      setResolvedPreview(matched || null);
    }
  }, [quickInput]);

  // When 3-step selector values change, update active preview
  const activeVerseItem: VerseItem = useMemo(() => {
    const currentRef = `${selectedBook} ${selectedChapter}:${selectedVerse}`;
    // Check if in database
    const inDb = POPULAR_VERSES.find(
      (v) =>
        v.book.toLowerCase() === selectedBook.toLowerCase() &&
        v.chapter === selectedChapter &&
        v.verse === selectedVerse
    );
    if (inDb) return inDb;

    // Generate fallback text based on language
    const fallbackKJV = `Scripture reading from ${currentRef}. (King James Version)`;
    const fallbackNIV = `Scripture reading from ${currentRef}. (Modern Translation)`;
    const fallbackTelugu = `${selectedBook} ${selectedChapter}:${selectedVerse} పరిశుద్ధ లేఖనము.`;
    const fallbackHindi = `${selectedBook} ${selectedChapter}:${selectedVerse} पवित्र बाइबिल वचन।`;
    const fallbackSpanish = `Lectura bíblica de ${currentRef}.`;

    return {
      reference: currentRef,
      book: selectedBook,
      chapter: selectedChapter,
      verse: selectedVerse,
      topic: `${selectedBook} Chapter ${selectedChapter}`,
      translations: {
        'en-kjv': fallbackKJV,
        'en-niv': fallbackNIV,
        'te-sv': fallbackTelugu,
        'hi-hin': fallbackHindi,
        'es-rv': fallbackSpanish,
      },
    };
  }, [selectedBook, selectedChapter, selectedVerse]);

  // Helper to build SlideContent
  const createSlide = (item: VerseItem): SlideContent => {
    const primary =
      item.translations[primaryLang] ||
      item.translations['en-kjv'] ||
      `${item.reference} Scripture Text`;
    const secondary = enableParallel
      ? item.translations[secondaryLang] ||
        item.translations['te-sv'] ||
        `${item.reference} Parallel Text`
      : undefined;

    const pLangObj = BIBLE_LANGUAGES.find((l) => l.id === primaryLang);
    const sLangObj = BIBLE_LANGUAGES.find((l) => l.id === secondaryLang);

    return {
      id: `bible-${item.reference.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
      type: 'bible',
      title: item.reference,
      reference: item.reference,
      subtitle: `${pLangObj?.nativeName || 'Bible'}${
        enableParallel && sLangObj ? ` | ${sLangObj.nativeName}` : ''
      }`,
      primaryText: primary,
      secondaryText: secondary,
      primaryLanguage: primaryLang,
      secondaryLanguage: enableParallel ? secondaryLang : undefined,
    };
  };

  // Push to history
  const recordHistory = (ref: string) => {
    setRecentHistory((prev) => {
      const filtered = prev.filter((r) => r.toLowerCase() !== ref.toLowerCase());
      return [ref, ...filtered].slice(0, 8);
    });
  };

  // Go Live
  const handleGoLiveVerse = (item: VerseItem) => {
    const slide = createSlide(item);
    recordHistory(item.reference);
    onGoLive(slide, targetMode);
  };

  // Set Next (Preview)
  const handleSetNextVerse = (item: VerseItem) => {
    const slide = createSlide(item);
    recordHistory(item.reference);
    onSetNext(slide);
  };

  // Live Next Verse navigation (Preacher says "now read next verse")
  const handleNextVerse = () => {
    const nextV = selectedVerse + 1;
    setSelectedVerse(nextV);
    const nextRef = `${selectedBook} ${selectedChapter}:${nextV}`;
    const inDb = POPULAR_VERSES.find(
      (v) =>
        v.book.toLowerCase() === selectedBook.toLowerCase() &&
        v.chapter === selectedChapter &&
        v.verse === nextV
    );
    const nextItem: VerseItem = inDb || {
      reference: nextRef,
      book: selectedBook,
      chapter: selectedChapter,
      verse: nextV,
      translations: {
        'en-kjv': `Scripture reading from ${nextRef}.`,
        'en-niv': `Scripture reading from ${nextRef}.`,
        'te-sv': `${selectedBook} ${selectedChapter}:${nextV} లేఖనము.`,
        'hi-hin': `${selectedBook} ${selectedChapter}:${nextV} वचन।`,
        'es-rv': `Lectura de ${nextRef}.`,
      },
    };
    handleGoLiveVerse(nextItem);
  };

  // Live Previous Verse navigation
  const handlePrevVerse = () => {
    if (selectedVerse <= 1) return;
    const prevV = selectedVerse - 1;
    setSelectedVerse(prevV);
    const prevRef = `${selectedBook} ${selectedChapter}:${prevV}`;
    const inDb = POPULAR_VERSES.find(
      (v) =>
        v.book.toLowerCase() === selectedBook.toLowerCase() &&
        v.chapter === selectedChapter &&
        v.verse === prevV
    );
    const prevItem: VerseItem = inDb || {
      reference: prevRef,
      book: selectedBook,
      chapter: selectedChapter,
      verse: prevV,
      translations: {
        'en-kjv': `Scripture reading from ${prevRef}.`,
        'en-niv': `Scripture reading from ${prevRef}.`,
        'te-sv': `${selectedBook} ${selectedChapter}:${prevV} లేఖనము.`,
        'hi-hin': `${selectedBook} ${selectedChapter}:${prevV} वचन।`,
        'es-rv': `Lectura de ${prevRef}.`,
      },
    };
    handleGoLiveVerse(prevItem);
  };

  // Select from history chip
  const handleSelectHistory = (ref: string) => {
    setQuickInput(ref);
    const resolved = resolveScriptureReference(ref);
    if (resolved) {
      setSelectedBook(resolved.book);
      setSelectedChapter(resolved.chapter);
      setSelectedVerse(resolved.verse);
      if (resolved.foundItem) {
        handleGoLiveVerse(resolved.foundItem);
      }
    }
  };

  // Submit Direct Quick Input
  const handleQuickInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    const resolved = resolveScriptureReference(quickInput);
    if (resolved) {
      setSelectedBook(resolved.book);
      setSelectedChapter(resolved.chapter);
      setSelectedVerse(resolved.verse);
      if (resolved.foundItem) {
        handleGoLiveVerse(resolved.foundItem);
        return;
      }
    }
    // If not found in exact DB, still project the reference!
    const customItem: VerseItem = {
      reference: quickInput.trim(),
      book: resolved?.book || selectedBook,
      chapter: resolved?.chapter || selectedChapter,
      verse: resolved?.verse || selectedVerse,
      translations: {
        'en-kjv': `Scripture reading from ${quickInput.trim()}.`,
        'en-niv': `Scripture reading from ${quickInput.trim()}.`,
        'te-sv': `${quickInput.trim()} పరిశుద్ధ లేఖనము.`,
        'hi-hin': `${quickInput.trim()} पवित्र वचन।`,
        'es-rv': `Lectura bíblica de ${quickInput.trim()}.`,
      },
    };
    handleGoLiveVerse(customItem);
  };

  // Toggle Parallel
  const toggleParallel = (checked: boolean) => {
    setEnableParallel(checked);
    onUpdateTheme({ showSecondary: checked });
  };

  // Font adjustments
  const handleFontZoom = (delta: number) => {
    const current = state.theme.fontSize || 38;
    const nextSize = Math.min(64, Math.max(24, current + delta));
    onUpdateTheme({ fontSize: nextSize });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto font-sans">
      {/* 1. TOP BAR: VerseView & BibleShow Rapid Control Console */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 sm:p-4 space-y-3 shrink-0">
        {/* Row 1: Direct Quick Scripture Bar (e.g. John 3:16) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form
            onSubmit={handleQuickInputSubmit}
            className="flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                id="verseview-quick-ref-input"
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Type Book &amp; Verse (e.g. John 3:16, Ps 23:1, Rom 8:28)..."
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-sky-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 font-bold focus:outline-none transition-all shadow-inner"
              />
            </div>

            <button
              id="verseview-show-live-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all shrink-0"
              title="Show Scripture on Live Screen"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Show Live (Enter)</span>
            </button>

            <button
              id="verseview-queue-next-btn"
              type="button"
              onClick={() => {
                if (resolvedPreview) {
                  handleSetNextVerse(resolvedPreview);
                } else {
                  handleSetNextVerse(activeVerseItem);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
              title="Queue for Next Slide"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Queue Next</span>
            </button>
          </form>

          {/* Row 1 Right: Live Next / Prev Verse Buttons (Preacher fast advance) */}
          <div className="flex items-center gap-2 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="prev-verse-nav-btn"
              type="button"
              onClick={handlePrevVerse}
              disabled={selectedVerse <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-bold text-slate-200 transition-all"
              title="Previous Verse"
            >
              <ChevronLeft className="w-4 h-4 text-sky-400" />
              <span>&lt;&lt; Prev (v{selectedVerse > 1 ? selectedVerse - 1 : 1})</span>
            </button>

            <div className="px-2 py-1 bg-sky-950/60 border border-sky-800 rounded font-mono text-xs font-black text-sky-300">
              v{selectedVerse}
            </div>

            <button
              id="next-verse-nav-btn"
              type="button"
              onClick={handleNextVerse}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-extrabold text-white shadow transition-all"
              title="Next Verse (Right Arrow)"
            >
              <span>Next (v{selectedVerse + 1}) &gt;&gt;</span>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Row 2: Translations (VerseVIEW Dual-Language & OBS Lower-Third Controls) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Primary Language */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              Bible 1:
            </span>
            <select
              id="bible-primary-translation-select"
              value={primaryLang}
              onChange={(e) => setPrimaryLang(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {BIBLE_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dual-Language Parallel Checkbox (VerseVIEW signature) */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="toggle-parallel-bible-checkbox"
                checked={enableParallel}
                onChange={(e) => toggleParallel(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
              />
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Dual Parallel Bible:
              </span>
            </label>

            {enableParallel && (
              <select
                id="bible-secondary-translation-select"
                value={secondaryLang}
                onChange={(e) => setSecondaryLang(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {BIBLE_LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Font Resizer & Display Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleFontZoom(-2)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold"
                title="Decrease Font Size"
              >
                A-
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-1">
                {state.theme.fontSize || 38}px
              </span>
              <button
                type="button"
                onClick={() => handleFontZoom(2)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* Mode: Sanctuary Fullscreen vs OBS Lower Third */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTargetMode('fullscreen')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                  targetMode === 'fullscreen'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3 h-3" /> Fullscreen
              </button>
              <button
                type="button"
                onClick={() => setTargetMode('lowerthird')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                  targetMode === 'lowerthird'
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3 h-3" /> Lower-Third
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: History Strip (BibleShow Recent Scriptures) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs">
          <div className="flex items-center gap-1 text-amber-400 shrink-0 font-bold text-[11px]">
            <History className="w-3.5 h-3.5" />
            <span>Recent:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {recentHistory.map((ref) => (
              <button
                key={ref}
                type="button"
                onClick={() => handleSelectHistory(ref)}
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold transition-all shrink-0 ${
                  activeVerseItem.reference === ref
                    ? 'bg-sky-900/80 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {ref}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: VerseVIEW & BibleShow 3-Column Fast Grid Selector */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
        {/* Mobile & Tablet Step Navigator (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 mb-3 gap-1 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setMobileStep('book')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center truncate ${
              mobileStep === 'book'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. {selectedBook}
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('chapter_verse')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center truncate ${
              mobileStep === 'chapter_verse'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Ch {selectedChapter} : V {selectedVerse}
          </button>
          <button
            type="button"
            onClick={() => setMobileStep('preview')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all text-center truncate ${
              mobileStep === 'preview'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Passage &amp; Live
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          {/* Column 1: BOOKS (Old & New Testament - 66 Books) (4 cols on lg) */}
          <div className={`lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-lg ${
            mobileStep === 'book' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* Header & OT/NT Tabs */}
            <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" /> 1. Select Book
                </span>
                <span className="text-[10px] font-mono text-slate-500">66 Books</span>
              </div>

              {/* OT / NT Filter Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTestamentFilter('ALL')}
                  className={`py-1 rounded-lg transition-all ${
                    testamentFilter === 'ALL'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All (66)
                </button>
                <button
                  type="button"
                  onClick={() => setTestamentFilter('OT')}
                  className={`py-1 rounded-lg transition-all ${
                    testamentFilter === 'OT'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  OT (39)
                </button>
                <button
                  type="button"
                  onClick={() => setTestamentFilter('NT')}
                  className={`py-1 rounded-lg transition-all ${
                    testamentFilter === 'NT'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NT (27)
                </button>
              </div>

              {/* Book search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Filter books (e.g. John, Rom, Ps)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Book List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredBooks.map((book) => {
                const isSelected = selectedBook === book.name;
                return (
                  <button
                    key={book.name}
                    id={`book-select-${book.name.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => {
                      setSelectedBook(book.name);
                      setSelectedChapter(1);
                      setSelectedVerse(1);
                      setQuickInput(`${book.name} 1:1`);
                      setMobileStep('chapter_verse');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-md font-bold'
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{book.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-sky-700 text-white'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {book.testament} · {book.chapters}ch
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: CHAPTERS & VERSES NUMERICAL GRID (VerseView & BibleShow style) (4 cols on lg) */}
          <div className={`lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-lg ${
            mobileStep === 'chapter_verse' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* Active Book Title */}
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-sm text-white">{selectedBook}</span>
                <span className="text-xs text-slate-400 ml-2">
                  Chapter {selectedChapter} : Verse {selectedVerse}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-400">
                1-Click Grid
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {/* 2. Chapter Grid Selector */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>2. Select Chapter ({chapterCount} total)</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => {
                    const isChSelected = selectedChapter === ch;
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => {
                          setSelectedChapter(ch);
                          setSelectedVerse(1);
                          setQuickInput(`${selectedBook} ${ch}:1`);
                        }}
                        className={`h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                          isChSelected
                            ? 'bg-amber-500 text-black shadow font-black ring-2 ring-amber-300'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Verse Grid Selector */}
              <div className="pt-2 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>3. Select Verse (Ch {selectedChapter})</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {Array.from({ length: verseCount }, (_, i) => i + 1).map((v) => {
                    const isVSelected = selectedVerse === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setSelectedVerse(v);
                          setQuickInput(`${selectedBook} ${selectedChapter}:${v}`);
                          setMobileStep('preview');
                        }}
                        className={`h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center ${
                          isVSelected
                            ? 'bg-emerald-500 text-black shadow font-black ring-2 ring-emerald-300'
                            : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: SELECTED SCRIPTURE LIVE PREVIEW & 1-CLICK BROADCAST (4 cols on lg) */}
          <div className={`lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-lg p-4 space-y-4 ${
            mobileStep === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {activeVerseItem.reference}
                </h3>
                {activeVerseItem.topic && (
                  <p className="text-xs text-sky-400 font-medium mt-0.5">
                    {activeVerseItem.topic}
                  </p>
                )}
              </div>

              {state.currentSlide?.reference === activeVerseItem.reference && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> LIVE NOW
                </span>
              )}
            </div>

            {/* Scripture Text Box (Primary Translation) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                  <span>{BIBLE_LANGUAGES.find((l) => l.id === primaryLang)?.name}</span>
                  <span className="text-sky-400">Primary</span>
                </div>
                <p className={`text-sm sm:text-base text-slate-100 font-medium leading-relaxed ${primaryLang === 'te-sv' ? 'font-telugu' : ''}`}>
                  {activeVerseItem.translations[primaryLang] ||
                    activeVerseItem.translations['en-kjv'] ||
                    `Scripture reading from ${activeVerseItem.reference}.`}
                </p>
              </div>

              {/* Parallel Translation Box if enabled (VerseVIEW core feature) */}
              {enableParallel && (
                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                    <span>{BIBLE_LANGUAGES.find((l) => l.id === secondaryLang)?.name}</span>
                    <span className="text-amber-400">Parallel</span>
                  </div>
                  <p className={`text-sm text-slate-300 font-medium leading-relaxed ${secondaryLang === 'te-sv' ? 'font-telugu' : ''}`}>
                    {activeVerseItem.translations[secondaryLang] ||
                      activeVerseItem.translations['te-sv'] ||
                      `${activeVerseItem.reference} సమాంతర లేఖనము.`}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons: Go Live & Queue Next */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                id="active-verse-golive-btn"
                type="button"
                onClick={() => handleGoLiveVerse(activeVerseItem)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Project Live on Screen</span>
              </button>

              <button
                id="active-verse-preview-btn"
                type="button"
                onClick={() => handleSetNextVerse(activeVerseItem)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Queue as Next Slide (Preview)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
