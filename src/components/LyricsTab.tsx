import React, { useState, useMemo, useEffect } from 'react';
import { WORSHIP_SONGS } from '../data/lyricsData';
import {
  loadAccountSongsFromFirestore,
  saveSongToFirestore,
  subscribeToAccountSongs,
} from '../services/firebase';
import { Song, SongSection, SlideContent, WorshipState } from '../types';
import { isTeluguText } from '../utils/telugu';
import {
  Music,
  Search,
  Plus,
  Play,
  Eye,
  CheckCircle2,
  ListPlus,
  Trash2,
  Maximize2,
  Tv,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  Edit3,
  SlidersHorizontal,
  AlignLeft,
  ArrowRight,
  ArrowLeft,
  Layers,
  FileText,
} from 'lucide-react';

export type LineSeparationOption = '1' | '2' | '3' | '4' | 'all' | 'custom';

export interface SeparatedSlideItem {
  id: string;
  originalSectionId: string;
  sectionLabel: string;
  partIndex: number;
  totalParts: number;
  linesRangeLabel: string; // e.g. "Lines 1-2" or "Line 1"
  primaryText: string;
  secondaryText?: string;
  lineCount: number;
}

interface LyricsTabProps {
  account: string;
  state: WorshipState;
  onGoLive: (slide: SlideContent, mode?: 'fullscreen' | 'lowerthird') => void;
  onSetNext: (slide: SlideContent) => void;
}

export const LyricsTab: React.FC<LyricsTabProps> = ({
  account,
  state,
  onGoLive,
  onSetNext,
}) => {
  const customSongsStorageKey = `worship_custom_songs_${account}`;
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem(customSongsStorageKey) || localStorage.getItem('worship_custom_songs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...WORSHIP_SONGS, ...parsed];
      } catch (e) {
        return WORSHIP_SONGS;
      }
    }
    return WORSHIP_SONGS;
  });

  useEffect(() => {
    let cancelled = false;
    const customSongs = songs.filter((song) => song.id.startsWith('custom-song-'));

    const unsubscribe = subscribeToAccountSongs(account, (remoteSongs) => {
      if (cancelled) return;
      setSongs([...WORSHIP_SONGS, ...remoteSongs]);
    });

    loadAccountSongsFromFirestore(account)
      .then((remoteSongs) => {
        if (cancelled || remoteSongs.length === 0) return;
        setSongs([...WORSHIP_SONGS, ...remoteSongs]);
      })
      .catch(() => {});

    // Migrate songs created before account-level cloud sync was enabled.
    customSongs.forEach((song) => {
      saveSongToFirestore(account, song).catch(() => {});
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [account]);

  const [selectedSongId, setSelectedSongId] = useState<string>(songs[0]?.id || 'way-maker');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetMode, setTargetMode] = useState<'fullscreen' | 'lowerthird'>('fullscreen');

  // lineSeparation configuration: '1', '2', '3', '4', 'all', or 'custom'
  const [lineSeparation, setLineSeparation] = useState<LineSeparationOption>(() => {
    return (localStorage.getItem('worship_lyrics_line_sep') as LineSeparationOption) || '2';
  });
  const [customLineCount, setCustomLineCount] = useState<number>(2);

  // Mobile sub-tab for phone & tablet responsiveness ('songs' | 'slides')
  const [mobileSubTab, setMobileSubTab] = useState<'songs' | 'slides'>('slides');

  // Setlist (Sunday Service Playlist)
  const [setlist, setSetlist] = useState<Song[]>(() => [songs[0], songs[1]]);
  const [showSetlist, setShowSetlist] = useState<boolean>(true);

  // Quick Slide / Spontaneous lyrics state
  const [showQuickSlide, setShowQuickSlide] = useState<boolean>(false);
  const [quickTitle, setQuickTitle] = useState<string>('Spontaneous Worship');
  const [quickLyrics, setQuickLyrics] = useState<string>('');
  const [quickLinesPerSlide, setQuickLinesPerSlide] = useState<number>(2);

  // Modal for new or edit song
  const [isAddSongOpen, setIsAddSongOpen] = useState<boolean>(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newArtist, setNewArtist] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('G');
  const [newLyricsRaw, setNewLyricsRaw] = useState<string>('');
  const [editSplitNotice, setEditSplitNotice] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('worship_lyrics_line_sep', lineSeparation);
  }, [lineSeparation]);

  const selectedSong = useMemo(() => {
    return songs.find((s) => s.id === selectedSongId) || songs[0];
  }, [songs, selectedSongId]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.sections.some((sec) => sec.primaryText.toLowerCase().includes(q))
    );
  }, [songs, searchQuery]);

  // Compute effective line count per slide
  const effectiveLinesCount: number | 'all' = useMemo(() => {
    if (lineSeparation === 'all') return 'all';
    if (lineSeparation === 'custom') return Math.max(1, customLineCount);
    return parseInt(lineSeparation, 10) || 2;
  }, [lineSeparation, customLineCount]);

  // Break down song sections into line-separated slides
  const separatedSlides: SeparatedSlideItem[] = useMemo(() => {
    if (!selectedSong) return [];

    const slides: SeparatedSlideItem[] = [];

    selectedSong.sections.forEach((section) => {
      const primaryLines = section.primaryText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const secondaryLines = section.secondaryText
        ? section.secondaryText
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      // If user chose 'all', or lines count is >= section lines:
      if (
        effectiveLinesCount === 'all' ||
        effectiveLinesCount <= 0 ||
        effectiveLinesCount >= primaryLines.length
      ) {
        slides.push({
          id: `${section.id}-full`,
          originalSectionId: section.id,
          sectionLabel: section.label,
          partIndex: 1,
          totalParts: 1,
          linesRangeLabel: `All (${primaryLines.length} lines)`,
          primaryText: primaryLines.join('\n'),
          secondaryText: secondaryLines.length > 0 ? secondaryLines.join('\n') : undefined,
          lineCount: primaryLines.length,
        });
        return;
      }

      // Break into chunks of effectiveLinesCount
      const linesPerChunk = effectiveLinesCount;
      const chunkCount = Math.ceil(primaryLines.length / linesPerChunk);

      for (let i = 0; i < primaryLines.length; i += linesPerChunk) {
        const chunkPrimary = primaryLines.slice(i, i + linesPerChunk);
        const startLine = i + 1;
        const endLine = Math.min(i + linesPerChunk, primaryLines.length);
        const partNum = Math.floor(i / linesPerChunk) + 1;

        // Proportionally align secondary translation lines
        let chunkSecondary: string[] = [];
        if (secondaryLines.length > 0) {
          if (secondaryLines.length === primaryLines.length) {
            chunkSecondary = secondaryLines.slice(i, i + linesPerChunk);
          } else {
            const secPerChunk = Math.max(1, Math.round(secondaryLines.length / chunkCount));
            const secStart = (partNum - 1) * secPerChunk;
            chunkSecondary = secondaryLines.slice(secStart, secStart + secPerChunk);
          }
        }

        const rangeLabel =
          startLine === endLine ? `Line ${startLine}` : `Lines ${startLine}-${endLine}`;

        slides.push({
          id: `${section.id}-part-${partNum}`,
          originalSectionId: section.id,
          sectionLabel: section.label,
          partIndex: partNum,
          totalParts: chunkCount,
          linesRangeLabel: rangeLabel,
          primaryText: chunkPrimary.join('\n'),
          secondaryText: chunkSecondary.length > 0 ? chunkSecondary.join('\n') : undefined,
          lineCount: chunkPrimary.length,
        });
      }
    });

    return slides;
  }, [selectedSong, effectiveLinesCount]);

  // Find index of currently live slide in separatedSlides
  const currentLiveIndex = useMemo(() => {
    if (!selectedSong || !state.currentSlide) return -1;
    if (state.currentSlide.title !== selectedSong.title) return -1;
    return separatedSlides.findIndex(
      (s) => s.primaryText === state.currentSlide?.primaryText
    );
  }, [selectedSong, state.currentSlide, separatedSlides]);

  // Broadcast specific line-separated slide live
  const handleGoLiveSlide = (item: SeparatedSlideItem) => {
    if (!selectedSong) return;
    const slide: SlideContent = {
      id: `${selectedSong.id}-${item.id}-${Date.now()}`,
      type: 'lyrics',
      title: selectedSong.title,
      subtitle: `${item.sectionLabel} (${item.linesRangeLabel}) · ${selectedSong.artist}`,
      primaryText: item.primaryText,
      secondaryText: item.secondaryText,
      copyright: selectedSong.ccli ? `CCLI #${selectedSong.ccli} · ${selectedSong.title}` : undefined,
    };
    onGoLive(slide, targetMode);
  };

  // Queue slide as next
  const handlePreviewSlide = (item: SeparatedSlideItem) => {
    if (!selectedSong) return;
    const slide: SlideContent = {
      id: `${selectedSong.id}-${item.id}-${Date.now()}`,
      type: 'lyrics',
      title: selectedSong.title,
      subtitle: `${item.sectionLabel} (${item.linesRangeLabel}) · ${selectedSong.artist}`,
      primaryText: item.primaryText,
      secondaryText: item.secondaryText,
      copyright: selectedSong.ccli ? `CCLI #${selectedSong.ccli} · ${selectedSong.title}` : undefined,
    };
    onSetNext(slide);
  };

  // Advance to Next / Previous Line Slide
  const handleNextLineSlide = () => {
    if (separatedSlides.length === 0) return;
    const nextIdx = currentLiveIndex < separatedSlides.length - 1 ? currentLiveIndex + 1 : 0;
    handleGoLiveSlide(separatedSlides[nextIdx]);
  };

  const handlePrevLineSlide = () => {
    if (separatedSlides.length === 0) return;
    const prevIdx = currentLiveIndex > 0 ? currentLiveIndex - 1 : separatedSlides.length - 1;
    handleGoLiveSlide(separatedSlides[prevIdx]);
  };

  const handleAddToSetlist = (song: Song) => {
    if (!setlist.some((s) => s.id === song.id)) {
      setSetlist([...setlist, song]);
    }
  };

  const handleRemoveFromSetlist = (id: string) => {
    setSetlist(setlist.filter((s) => s.id !== id));
  };

  // Open modal to add a brand new song
  const handleOpenAddSong = () => {
    setEditingSongId(null);
    setNewTitle('');
    setNewArtist('');
    setNewKey('G');
    setNewLyricsRaw('');
    setEditSplitNotice('');
    setIsAddSongOpen(true);
  };

  // Open modal to edit existing song lyrics
  const handleOpenEditSong = (song: Song) => {
    setEditingSongId(song.id);
    setNewTitle(song.title);
    setNewArtist(song.artist);
    setNewKey(song.key || 'G');
    const raw = song.sections
      .map((sec) => `[${sec.label}]\n${sec.primaryText}`)
      .join('\n\n');
    setNewLyricsRaw(raw);
    setEditSplitNotice('');
    setIsAddSongOpen(true);
  };

  // Interactive line splitter helper inside Add/Edit Song Modal
  const handleReformatRawLyricsByLines = (linesPerChunk: number) => {
    if (!newLyricsRaw.trim()) return;

    // Split text into stanzas or lines
    const rawBlocks = newLyricsRaw.split(/\n\s*\n/);
    const reformattedBlocks: string[] = [];
    let slideCount = 0;

    rawBlocks.forEach((block, blockIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      let labelPrefix = `Verse ${blockIdx + 1}`;
      let textLines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

      const firstLineMatch = textLines[0]?.match(/^\[(.*?)\]/);
      if (firstLineMatch) {
        labelPrefix = firstLineMatch[1];
        textLines.shift(); // remove header line
      }

      if (textLines.length === 0) return;

      // Group into stanzas of size linesPerChunk
      for (let i = 0; i < textLines.length; i += linesPerChunk) {
        slideCount++;
        const chunk = textLines.slice(i, i + linesPerChunk);
        const part = Math.floor(i / linesPerChunk) + 1;
        const totalParts = Math.ceil(textLines.length / linesPerChunk);
        const sectionTag =
          totalParts > 1 ? `[${labelPrefix} - Part ${part}/${totalParts}]` : `[${labelPrefix}]`;

        reformattedBlocks.push(`${sectionTag}\n${chunk.join('\n')}`);
      }
    });

    setNewLyricsRaw(reformattedBlocks.join('\n\n'));
    setEditSplitNotice(
      `✓ Formatted lyrics into ${slideCount} slide sections (${linesPerChunk} line${
        linesPerChunk > 1 ? 's' : ''
      } per slide)!`
    );
  };

  // Quick Slide Live Broadcast (supports line separation)
  const handleQuickSlideGoLive = () => {
    if (!quickLyrics.trim()) return;
    const lines = quickLyrics.split('\n').map((l) => l.trim()).filter(Boolean);
    const primaryText =
      quickLinesPerSlide > 0 && quickLinesPerSlide < lines.length
        ? lines.slice(0, quickLinesPerSlide).join('\n')
        : quickLyrics.trim();

    const slide: SlideContent = {
      id: `quick-slide-${Date.now()}`,
      type: 'lyrics',
      title: quickTitle.trim() || 'Worship Slide',
      subtitle: `Spontaneous Live (${lines.length} lines)`,
      primaryText,
    };
    onGoLive(slide, targetMode);
  };

  const handleQuickSlideQueueNext = () => {
    if (!quickLyrics.trim()) return;
    const slide: SlideContent = {
      id: `quick-slide-${Date.now()}`,
      type: 'lyrics',
      title: quickTitle.trim() || 'Worship Slide',
      subtitle: 'Next Slide',
      primaryText: quickLyrics.trim(),
    };
    onSetNext(slide);
  };

  // Parse raw text into sections and save
  const handleSaveNewSong = () => {
    if (!newTitle.trim()) return;

    const sections: SongSection[] = [];
    const blocks = newLyricsRaw.split(/\n\s*\n/);

    blocks.forEach((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      let label = `Verse ${idx + 1}`;
      let text = trimmed;

      const firstLineMatch = trimmed.match(/^\[(.*?)\]/);
      if (firstLineMatch) {
        label = firstLineMatch[1];
        text = trimmed.replace(/^\[(.*?)\]\s*/, '').trim();
      }

      sections.push({
        id: `sec-${idx}-${Date.now()}`,
        label,
        primaryText: text,
      });
    });

    if (sections.length === 0) {
      sections.push({
        id: `sec-1-${Date.now()}`,
        label: 'Lyrics',
        primaryText: newLyricsRaw.trim() || 'Worship lyrics',
      });
    }

    if (editingSongId) {
      const updated = songs.map((s) => {
        if (s.id === editingSongId) {
          return {
            ...s,
            title: newTitle.trim(),
            artist: newArtist.trim() || 'Worship Leader',
            key: newKey,
            sections,
          };
        }
        return s;
      });
      setSongs(updated);
      setSelectedSongId(editingSongId);
      const customList = updated.filter((s) => s.id.startsWith('custom-song-'));
      localStorage.setItem(customSongsStorageKey, JSON.stringify(customList));
      saveSongToFirestore(account, updated.find((song) => song.id === editingSongId)!).catch(() => {});
    } else {
      const created: Song = {
        id: `custom-song-${Date.now()}`,
        title: newTitle.trim(),
        artist: newArtist.trim() || 'Worship Leader',
        key: newKey,
        sections,
      };

      const updated = [created, ...songs];
      setSongs(updated);
      setSelectedSongId(created.id);

      const customList = updated.filter((s) => s.id.startsWith('custom-song-'));
      localStorage.setItem(customSongsStorageKey, JSON.stringify(customList));
      saveSongToFirestore(account, created).catch(() => {});
    }

    // Reset & close modal
    setEditingSongId(null);
    setNewTitle('');
    setNewArtist('');
    setNewLyricsRaw('');
    setIsAddSongOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Top Banner with Output Mode & Quick Slide trigger */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/60 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shadow-inner">
            <Music className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Worship Songs &amp; Setlist</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300">
                Line-Separated Slides
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Split lyrics by 1, 2, 3, 4, or custom lines for live sanctuary &amp; OBS streaming
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Output Mode selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-700/80">
            <span className="text-xs font-semibold text-slate-400 px-2">Project as:</span>
            <button
              id="lyrics-mode-fullscreen-btn"
              type="button"
              onClick={() => setTargetMode('fullscreen')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                targetMode === 'fullscreen'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" /> Full Screen
            </button>
            <button
              id="lyrics-mode-lowerthird-btn"
              type="button"
              onClick={() => setTargetMode('lowerthird')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                targetMode === 'lowerthird'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> Lower Third
            </button>
          </div>

          {/* Quick Slide Button */}
          <button
            id="toggle-quick-slide-btn"
            type="button"
            onClick={() => setShowQuickSlide(!showQuickSlide)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showQuickSlide
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Type or paste spontaneous lyrics on the fly"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Quick Slide</span>
          </button>

          {/* Add Song Button */}
          <button
            id="add-new-song-btn"
            type="button"
            onClick={handleOpenAddSong}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> + Add Song
          </button>
        </div>
      </div>

      {/* Quick Slide / Spontaneous Lyrics Panel */}
      {showQuickSlide && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white">
                Quick Slide &amp; Spontaneous Lyric Broadcaster
              </h3>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60 font-semibold">
                Instant Projection
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickSlide(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Slide Title / Tag</label>
              <input
                id="quick-slide-title-input"
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="e.g. Spontaneous Worship, Chorus"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="mt-2">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Separate Quick Lines:
                </span>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setQuickLinesPerSlide(1)}
                    className={`text-[10px] py-1 rounded font-bold ${
                      quickLinesPerSlide === 1 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 Line
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickLinesPerSlide(2)}
                    className={`text-[10px] py-1 rounded font-bold ${
                      quickLinesPerSlide === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2 Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickLinesPerSlide(99)}
                    className={`text-[10px] py-1 rounded font-bold ${
                      quickLinesPerSlide === 99 ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Lines
                  </button>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Lyrics / Slide Text</label>
              <textarea
                id="quick-slide-lyrics-textarea"
                rows={3}
                value={quickLyrics}
                onChange={(e) => setQuickLyrics(e.target.value)}
                placeholder="Paste lyrics lines here... (e.g.&#10;Holy, Holy, Holy&#10;Lord God Almighty)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickSlideQueueNext}
              disabled={!quickLyrics.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Queue as Next
            </button>
            <button
              id="quick-slide-golive-btn"
              type="button"
              onClick={handleQuickSlideGoLive}
              disabled={!quickLyrics.trim()}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Project Live Now ({targetMode === 'fullscreen' ? 'Full Screen' : 'Lower Third'})
            </button>
          </div>
        </div>
      )}

      {/* Mobile / Tablet Sub Tab Switcher (Visible on < lg screens) */}
      <div className="lg:hidden flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 gap-1 text-xs shrink-0">
        <button
          type="button"
          onClick={() => setMobileSubTab('songs')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center ${
            mobileSubTab === 'songs'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Song Library ({filteredSongs.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileSubTab('slides')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all text-center ${
            mobileSubTab === 'slides'
              ? 'bg-sky-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Lyrics Slides ({separatedSlides.length})
        </button>
      </div>

      {/* Main Grid: Songs Library (4 cols) | Slide Sections (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Song Library & Sunday Setlist (4 cols) */}
        <div className={`lg:col-span-4 flex flex-col space-y-4 ${
          mobileSubTab === 'songs' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="lyrics-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song title or lyrics..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Setlist Accordion / Toggle */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setShowSetlist(!showSetlist)}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sunday Service Setlist ({setlist.length})
                </span>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  showSetlist ? 'rotate-90' : ''
                }`}
              />
            </div>

            {showSetlist && (
              <div className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-700/60">
                {setlist.map((s, idx) => (
                  <div
                    key={`setlist-${s.id}-${idx}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedSongId === s.id
                        ? 'bg-sky-950/60 text-sky-200 border border-sky-600/40'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSongId(s.id);
                        setMobileSubTab('slides');
                      }}
                      className="flex-1 text-left truncate font-medium"
                    >
                      <span className="text-sky-400 font-bold mr-1.5">{idx + 1}.</span>
                      {s.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromSetlist(s.id)}
                      className="text-slate-500 hover:text-rose-400 ml-2 p-1"
                      title="Remove from setlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Songs List */}
          <div className="flex-1 max-h-[500px] overflow-y-auto space-y-2 pr-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Song Library ({filteredSongs.length})
            </span>
            {filteredSongs.map((song) => {
              const isSelected = song.id === selectedSongId;
              const isLive = state.currentSlide?.title === song.title;

              return (
                <div
                  key={song.id}
                  onClick={() => {
                    setSelectedSongId(song.id);
                    setMobileSubTab('slides');
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-800 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white truncate">{song.title}</h4>
                    {isLive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                    <span className="truncate">{song.artist}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {song.key && (
                        <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300">
                          Key: {song.key}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToSetlist(song);
                        }}
                        className="p-1 hover:text-sky-400 text-slate-500"
                        title="Add to Sunday Setlist"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Song Line-Separated Slides (8 cols) */}
        {selectedSong && (
          <div className={`lg:col-span-8 bg-slate-800/80 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-slate-700/60 shadow-md flex flex-col space-y-4 ${
            mobileSubTab === 'slides' ? 'flex' : 'hidden lg:flex'
          }`}>
            {/* Song Header & Quick Info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-xl text-white tracking-wide">
                    {selectedSong.title}
                  </h3>
                  {selectedSong.key && (
                    <span className="px-2.5 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300 text-xs font-bold font-mono">
                      Key: {selectedSong.key}
                    </span>
                  )}
                  {selectedSong.tempo && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-xs">
                      {selectedSong.tempo}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{selectedSong.artist}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="edit-song-lyrics-btn"
                  type="button"
                  onClick={() => handleOpenEditSong(selectedSong)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  title="Edit lyrics, stanzas, or song details"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-400" /> Edit Song
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToSetlist(selectedSong)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ListPlus className="w-4 h-4" /> Add to Setlist
                </button>
              </div>
            </div>

            {/* LINE SEPARATION CONTROLS BAR */}
            <div className="bg-slate-950/90 border border-slate-700/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Separate Lyrics By Lines:
                  </span>
                </div>

                {/* Line count options: 1 line, 2 lines, 3 lines, 4 lines, all, custom */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    id="line-sep-1-btn"
                    type="button"
                    onClick={() => setLineSeparation('1')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === '1'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="1 Line per slide (Ideal for live streaming lower thirds)"
                  >
                    1 Line
                  </button>

                  <button
                    id="line-sep-2-btn"
                    type="button"
                    onClick={() => setLineSeparation('2')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === '2'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="2 Lines per slide (Standard church worship projection)"
                  >
                    2 Lines
                  </button>

                  <button
                    id="line-sep-3-btn"
                    type="button"
                    onClick={() => setLineSeparation('3')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === '3'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="3 Lines per slide"
                  >
                    3 Lines
                  </button>

                  <button
                    id="line-sep-4-btn"
                    type="button"
                    onClick={() => setLineSeparation('4')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === '4'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="4 Lines per slide (Half stanza)"
                  >
                    4 Lines
                  </button>

                  <button
                    id="line-sep-all-btn"
                    type="button"
                    onClick={() => setLineSeparation('all')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === 'all'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Full stanzas as originally entered"
                  >
                    Full Stanza
                  </button>

                  <button
                    id="line-sep-custom-btn"
                    type="button"
                    onClick={() => setLineSeparation('custom')}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      lineSeparation === 'custom'
                        ? 'bg-sky-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Specify custom lines count"
                  >
                    Custom...
                  </button>
                </div>

                {lineSeparation === 'custom' && (
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400">Lines:</span>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={customLineCount}
                      onChange={(e) => setCustomLineCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white text-center font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Sequential Line-by-Line Slide Navigation */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {currentLiveIndex >= 0
                    ? `Slide ${currentLiveIndex + 1} of ${separatedSlides.length}`
                    : `${separatedSlides.length} line slides`}
                </span>

                <button
                  id="prev-line-slide-btn"
                  type="button"
                  onClick={handlePrevLineSlide}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Go to previous line slide"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Prev
                </button>

                <button
                  id="next-line-slide-btn"
                  type="button"
                  onClick={handleNextLineSlide}
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow transition-colors"
                  title="Go to next line slide"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SEPARATED SLIDES GRID */}
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {separatedSlides.map((slideItem, idx) => {
                const isCurrentLive =
                  state.currentSlide?.title === selectedSong.title &&
                  state.currentSlide?.primaryText === slideItem.primaryText;

                return (
                  <div
                    key={slideItem.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isCurrentLive
                        ? 'bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/50 shadow-xl'
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Section Label */}
                        <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/30">
                          {slideItem.sectionLabel}
                        </span>

                        {/* Line Range Tag */}
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                          {slideItem.linesRangeLabel}
                          {slideItem.totalParts > 1 && ` (Part ${slideItem.partIndex}/${slideItem.totalParts})`}
                        </span>

                        {isCurrentLive && (
                          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ON SCREEN
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewSlide(slideItem)}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Queue as Next Slide"
                        >
                          <Eye className="w-3.5 h-3.5" /> Next
                        </button>
                        <button
                          id={`golive-slide-${idx}`}
                          type="button"
                          onClick={() => handleGoLiveSlide(slideItem)}
                          className="px-3.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                          title="Send these lines directly to Projector"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Go Live
                        </button>
                      </div>
                    </div>

                    {/* Primary separated lyrics lines */}
                    <div className={`text-base font-semibold text-slate-100 whitespace-pre-line leading-relaxed pl-1 ${isTeluguText(slideItem.primaryText) ? 'font-telugu' : 'font-sans'}`}>
                      {slideItem.primaryText}
                    </div>

                    {/* Secondary translation if available */}
                    {slideItem.secondaryText && (
                      <div className={`mt-2.5 pt-2 border-t border-slate-800 text-xs text-sky-300/80 whitespace-pre-line leading-relaxed pl-1 ${isTeluguText(slideItem.secondaryText) ? 'font-telugu' : ''}`}>
                        {slideItem.secondaryText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Song Modal with Instant Line Splitter */}
      {isAddSongOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {editingSongId ? (
                  <Edit3 className="w-5 h-5 text-sky-400" />
                ) : (
                  <Plus className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="font-bold text-lg text-white">
                  {editingSongId ? 'Edit Worship Song Lyrics' : 'Add New Worship Song'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSongOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Song Title *</label>
                <input
                  id="new-song-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Living Hope"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Artist / Author</label>
                <input
                  id="new-song-artist"
                  type="text"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  placeholder="e.g. Phil Wickham"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Interactive Line Splitter Tool inside editor */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  Song Lyrics &amp; Stanzas
                </label>

                {/* Instant split buttons */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                    Auto-Split:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleReformatRawLyricsByLines(1)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300"
                    title="Split text into 1-line stanzas"
                  >
                    1 Line
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReformatRawLyricsByLines(2)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300"
                    title="Split text into 2-line stanzas (recommended)"
                  >
                    2 Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReformatRawLyricsByLines(4)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300"
                    title="Split text into 4-line stanzas"
                  >
                    4 Lines
                  </button>
                </div>
              </div>

              {editSplitNotice && (
                <div className="mb-2 p-2 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                  {editSplitNotice}
                </div>
              )}

              <textarea
                id="new-song-lyrics"
                rows={8}
                value={newLyricsRaw}
                onChange={(e) => {
                  setNewLyricsRaw(e.target.value);
                  setEditSplitNotice('');
                }}
                placeholder="[Verse 1]&#10;How great the chasm that lay between us...&#10;&#10;[Chorus]&#10;Hallelujah, praise the One who set me free..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-mono resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Separate stanzas with a blank line. You can also use the Auto-Split buttons above to break long lyrics into the exact number of lines you need!
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSongOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                id="save-song-submit-btn"
                type="button"
                onClick={handleSaveNewSong}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors"
              >
                {editingSongId ? 'Save Changes' : 'Save & Add to Library'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
