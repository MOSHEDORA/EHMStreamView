import fs from 'fs';
import path from 'path';

const BIBLE_BOOK_NAMES = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah',
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

type EnglishBible = Array<{ abbrev: string; chapters: string[][] }>;
let englishBibleCache: EnglishBible | null = null;

function loadEnglishBible(): EnglishBible {
  if (!englishBibleCache) {
    const filePath = path.join(process.cwd(), 'data', 'bibles', 'en_kjv.json');
    englishBibleCache = JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  }
  return englishBibleCache;
}

function decodeHtmlText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function loadTeluguChapter(bookNumber: number, chapter: number): Record<number, string> {
  const filePath = path.join(process.cwd(), 'data', 'tel_new', String(bookNumber).padStart(2, '0'), `${chapter}.htm`);
  if (!fs.existsSync(filePath)) return {};
  const html = fs.readFileSync(filePath, 'utf8');
  const verses: Record<number, string> = {};
  const versePattern = /<span class="verse" id="(\d+)">[\s\S]*?<\/span>([\s\S]*?)(?=<br\s*\/?|<\/p>)/gi;
  for (const match of html.matchAll(versePattern)) {
    const verseText = decodeHtmlText(match[2]);
    if (verseText) verses[Number(match[1])] = verseText;
  }
  return verses;
}

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });

  const bookName = decodeURIComponent(String(req.query?.book || '')).trim();
  const bookNumber = BIBLE_BOOK_NAMES.findIndex((book) => book.toLowerCase() === bookName.toLowerCase()) + 1;
  const chapter = Number(req.query?.chapter);
  const verse = Number(req.query?.verse);

  if (!bookNumber || !Number.isInteger(chapter) || !Number.isInteger(verse) || chapter < 1 || verse < 1) {
    return res.status(400).json({ error: 'Invalid Bible reference.' });
  }

  try {
    const englishBook = loadEnglishBible()[bookNumber - 1];
    const englishVerse = englishBook?.chapters?.[chapter - 1]?.[verse - 1] || '';
    const teluguVerse = loadTeluguChapter(bookNumber, chapter)[verse] || '';
    if (!englishVerse && !teluguVerse) {
      return res.status(404).json({ error: 'Bible verse not found.' });
    }

    return res.status(200).json({
      reference: `${BIBLE_BOOK_NAMES[bookNumber - 1]} ${chapter}:${verse}`,
      book: BIBLE_BOOK_NAMES[bookNumber - 1],
      chapter,
      verse,
      translations: { 'en-kjv': englishVerse, 'te-sv': teluguVerse },
    });
  } catch (error) {
    console.error('Failed to load Bible verse:', error);
    return res.status(500).json({ error: 'Bible data could not be loaded.' });
  }
}
