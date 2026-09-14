export interface BibleLanguage {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  code: string;
}

export const BIBLE_LANGUAGES: BibleLanguage[] = [
  { id: 'en-kjv', name: 'English (KJV)', nativeName: 'King James Version', flag: '🇺🇸', code: 'EN-KJV' },
  { id: 'en-niv', name: 'English (NIV/Modern)', nativeName: 'Modern English', flag: '🇬🇧', code: 'EN-NIV' },
  { id: 'te-sv', name: 'Telugu (పరిశుద్ధ గ్రంథము)', nativeName: 'తెలుగు బైబిల్', flag: '🇮🇳', code: 'TE-TEL' },
  { id: 'hi-hin', name: 'Hindi (पवित्र बाइबिल)', nativeName: 'हिंदी पवित्र बाइबिल', flag: '🇮🇳', code: 'HI-HIN' },
  { id: 'es-rv', name: 'Spanish (Reina-Valera)', nativeName: 'Reina-Valera 1960', flag: '🇪🇸', code: 'ES-ESP' },
  { id: 'fr-lsg', name: 'French (Louis Segond)', nativeName: 'Louis Segond 1910', flag: '🇫🇷', code: 'FR-FRA' },
  { id: 'pt-ara', name: 'Portuguese (Almeida)', nativeName: 'Almeida Revista', flag: '🇧🇷', code: 'PT-POR' },
  { id: 'de-lut', name: 'German (Lutherbibel)', nativeName: 'Luther Bibel', flag: '🇩🇪', code: 'DE-DEU' },
  { id: 'ko-krv', name: 'Korean (개역한글)', nativeName: '개역한글 성경', flag: '🇰🇷', code: 'KO-KOR' },
  { id: 'tl-adb', name: 'Tagalog (Ang Biblia)', nativeName: 'Ang Dating Biblia', flag: '🇵🇭', code: 'TL-TGL' },
];

export interface VerseItem {
  reference: string; // e.g. "John 3:16"
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  topic?: string;
  translations: Record<string, string>; // languageId -> text
}

export interface BookMeta {
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  aliases: string[];
}

export const BIBLE_BOOKS_META: BookMeta[] = [
  // Old Testament (39)
  { name: 'Genesis', testament: 'OT', chapters: 50, aliases: ['gen', 'ge', 'gn'] },
  { name: 'Exodus', testament: 'OT', chapters: 40, aliases: ['exo', 'ex'] },
  { name: 'Leviticus', testament: 'OT', chapters: 27, aliases: ['lev', 'le', 'lv'] },
  { name: 'Numbers', testament: 'OT', chapters: 36, aliases: ['num', 'nu', 'nm'] },
  { name: 'Deuteronomy', testament: 'OT', chapters: 34, aliases: ['deut', 'dt', 'de'] },
  { name: 'Joshua', testament: 'OT', chapters: 24, aliases: ['josh', 'jos'] },
  { name: 'Judges', testament: 'OT', chapters: 21, aliases: ['judg', 'jdg', 'jg'] },
  { name: 'Ruth', testament: 'OT', chapters: 4, aliases: ['rth', 'ru'] },
  { name: '1 Samuel', testament: 'OT', chapters: 31, aliases: ['1sam', '1sa', '1s'] },
  { name: '2 Samuel', testament: 'OT', chapters: 24, aliases: ['2sam', '2sa', '2s'] },
  { name: '1 Kings', testament: 'OT', chapters: 22, aliases: ['1kgs', '1ki', '1k'] },
  { name: '2 Kings', testament: 'OT', chapters: 25, aliases: ['2kgs', '2ki', '2k'] },
  { name: '1 Chronicles', testament: 'OT', chapters: 29, aliases: ['1chr', '1ch'] },
  { name: '2 Chronicles', testament: 'OT', chapters: 36, aliases: ['2chr', '2ch'] },
  { name: 'Ezra', testament: 'OT', chapters: 10, aliases: ['ezr'] },
  { name: 'Nehemiah', testament: 'OT', chapters: 13, aliases: ['neh', 'ne'] },
  { name: 'Esther', testament: 'OT', chapters: 10, aliases: ['esth', 'es'] },
  { name: 'Job', testament: 'OT', chapters: 42, aliases: ['jb'] },
  { name: 'Psalms', testament: 'OT', chapters: 150, aliases: ['psalm', 'psa', 'ps', 'pss'] },
  { name: 'Proverbs', testament: 'OT', chapters: 31, aliases: ['prov', 'prv', 'pr'] },
  { name: 'Ecclesiastes', testament: 'OT', chapters: 12, aliases: ['eccl', 'ecc', 'ec'] },
  { name: 'Song of Solomon', testament: 'OT', chapters: 8, aliases: ['song', 'sos', 'ss', 'canticles'] },
  { name: 'Isaiah', testament: 'OT', chapters: 66, aliases: ['isa', 'is'] },
  { name: 'Jeremiah', testament: 'OT', chapters: 52, aliases: ['jer', 'je'] },
  { name: 'Lamentations', testament: 'OT', chapters: 5, aliases: ['lam', 'la'] },
  { name: 'Ezekiel', testament: 'OT', chapters: 48, aliases: ['ezek', 'eze', 'ez'] },
  { name: 'Daniel', testament: 'OT', chapters: 12, aliases: ['dan', 'da', 'dn'] },
  { name: 'Hosea', testament: 'OT', chapters: 14, aliases: ['hos', 'ho'] },
  { name: 'Joel', testament: 'OT', chapters: 3, aliases: ['joe', 'jl'] },
  { name: 'Amos', testament: 'OT', chapters: 9, aliases: ['amo', 'am'] },
  { name: 'Obadiah', testament: 'OT', chapters: 1, aliases: ['obad', 'oba', 'ob'] },
  { name: 'Jonah', testament: 'OT', chapters: 4, aliases: ['jon', 'jnh'] },
  { name: 'Micah', testament: 'OT', chapters: 7, aliases: ['mic', 'mc'] },
  { name: 'Nahum', testament: 'OT', chapters: 3, aliases: ['nah', 'na'] },
  { name: 'Habakkuk', testament: 'OT', chapters: 3, aliases: ['hab', 'hb'] },
  { name: 'Zephaniah', testament: 'OT', chapters: 3, aliases: ['zeph', 'zep'] },
  { name: 'Haggai', testament: 'OT', chapters: 2, aliases: ['hag', 'hg'] },
  { name: 'Zechariah', testament: 'OT', chapters: 14, aliases: ['zech', 'zec', 'zc'] },
  { name: 'Malachi', testament: 'OT', chapters: 4, aliases: ['mal', 'ml'] },

  // New Testament (27)
  { name: 'Matthew', testament: 'NT', chapters: 28, aliases: ['matt', 'mat', 'mt'] },
  { name: 'Mark', testament: 'NT', chapters: 16, aliases: ['mrk', 'mk', 'mr'] },
  { name: 'Luke', testament: 'NT', chapters: 24, aliases: ['luk', 'lk', 'lu'] },
  { name: 'John', testament: 'NT', chapters: 21, aliases: ['jhn', 'jn', 'joh'] },
  { name: 'Acts', testament: 'NT', chapters: 28, aliases: ['act', 'ac'] },
  { name: 'Romans', testament: 'NT', chapters: 16, aliases: ['rom', 'ro', 'rm'] },
  { name: '1 Corinthians', testament: 'NT', chapters: 16, aliases: ['1cor', '1co', '1c'] },
  { name: '2 Corinthians', testament: 'NT', chapters: 13, aliases: ['2cor', '2co', '2c'] },
  { name: 'Galatians', testament: 'NT', chapters: 6, aliases: ['gal', 'ga'] },
  { name: 'Ephesians', testament: 'NT', chapters: 6, aliases: ['eph', 'ep'] },
  { name: 'Philippians', testament: 'NT', chapters: 4, aliases: ['phil', 'php', 'pp'] },
  { name: 'Colossians', testament: 'NT', chapters: 4, aliases: ['col', 'cl'] },
  { name: '1 Thessalonians', testament: 'NT', chapters: 5, aliases: ['1thess', '1th', '1ts'] },
  { name: '2 Thessalonians', testament: 'NT', chapters: 3, aliases: ['2thess', '2th', '2ts'] },
  { name: '1 Timothy', testament: 'NT', chapters: 6, aliases: ['1tim', '1ti', '1tm'] },
  { name: '2 Timothy', testament: 'NT', chapters: 4, aliases: ['2tim', '2ti', '2tm'] },
  { name: 'Titus', testament: 'NT', chapters: 3, aliases: ['tit', 'ti'] },
  { name: 'Philemon', testament: 'NT', chapters: 1, aliases: ['philem', 'phm', 'pm'] },
  { name: 'Hebrews', testament: 'NT', chapters: 13, aliases: ['heb', 'he'] },
  { name: 'James', testament: 'NT', chapters: 5, aliases: ['jas', 'jm', 'ja'] },
  { name: '1 Peter', testament: 'NT', chapters: 5, aliases: ['1pet', '1pe', '1p'] },
  { name: '2 Peter', testament: 'NT', chapters: 3, aliases: ['2pet', '2pe', '2p'] },
  { name: '1 John', testament: 'NT', chapters: 5, aliases: ['1jhn', '1jn', '1j'] },
  { name: '2 John', testament: 'NT', chapters: 1, aliases: ['2jhn', '2jn', '2j'] },
  { name: '3 John', testament: 'NT', chapters: 1, aliases: ['3jhn', '3jn', '3j'] },
  { name: 'Jude', testament: 'NT', chapters: 1, aliases: ['jud', 'jd'] },
  { name: 'Revelation', testament: 'NT', chapters: 22, aliases: ['rev', 're', 'apocalypse'] },
];

export const BIBLE_BOOKS = BIBLE_BOOKS_META.map((b) => b.name);

export const POPULAR_VERSES: VerseItem[] = [
  {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verse: 16,
    topic: 'Salvation / Love of God',
    translations: {
      'en-kjv': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      'en-niv': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      'te-sv': 'దేవుడు లోకమును ఎంతో ప్రేమించెను; కాగా ఆయన తన అద్వితీయకుమారునిగా పుట్టిన వానియందు విశ్వాసముంచు ప్రతివాడును నశింపక నిత్యజీవము పొందునట్లు ఆయనను అనుగ్రహించెను.',
      'hi-hin': 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
      'es-rv': 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      'fr-lsg': 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.',
      'pt-ara': 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      'de-lut': 'Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, auf dass alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
      'ko-krv': '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 저를 믿는 자마다 멸망치 않고 영생을 얻게 하려 하심이니라.',
      'tl-adb': 'Sapagka\'t gayon na lamang ang pagsinta ng Dios sa sanglibutan, na ibinigay niya ang kaniyang bugtong na Anak, upang ang sinomang sa kaniya\'y sumampalataya ay huwag mapahamak, kundi magkaroon ng buhay na walang hanggan.',
    },
  },
  {
    reference: 'John 3:17',
    book: 'John',
    chapter: 3,
    verse: 17,
    topic: 'Salvation, Not Condemnation',
    translations: {
      'en-kjv': 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.',
      'en-niv': 'For God did not send his Son into the world to condemn the world, but to save the world through him.',
      'te-sv': 'లోకము తన ద్వారా రక్షణ పొందుటకే గాని లోకమునకు తీర్పు తీర్చుటకు దేవుడు తన కుమారుని లోకములోనికి పంపలేదు.',
      'hi-hin': 'परमेश्वर ने अपने पुत्र को जगत में इसलिये नहीं भेजा कि जगत पर दण्ड की आज्ञा दे, परन्तु इसलिये कि जगत उसके द्वारा उद्धार पाए।',
      'es-rv': 'Porque no envió Dios a su Hijo al mundo para condenar al mundo, sino para que el mundo sea salvo por él.',
      'fr-lsg': 'Dieu, en effet, n’a pas envoyé son Fils dans le monde pour qu’il juge le monde, mais pour que le monde soit sauvé par lui.',
      'pt-ara': 'Porquanto Deus enviou o seu Filho ao mundo, não para que julgasse o mundo, mas para que o mundo fosse salvo por ele.',
      'de-lut': 'Denn Gott hat seinen Sohn nicht gesandt in die Welt, dass er die Welt richte, sondern dass die Welt durch ihn gerettet werde.',
      'ko-krv': '하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 저로 말미암아 세상이 구원을 받게 하려 하심이라.',
      'tl-adb': 'Sapagka\'t hindi sinugo ng Dios ang Anak sa sanglibutan upang hatulan ang sanglibutan; kundi upang ang sanglibutan ay maligtas sa pamamagitan niya.',
    },
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalms',
    chapter: 23,
    verse: 1,
    topic: 'The Good Shepherd',
    translations: {
      'en-kjv': 'The LORD is my shepherd; I shall not want.',
      'en-niv': 'The Lord is my shepherd, I lack nothing.',
      'te-sv': 'యెహోవా నా కాపరి, నాకు లేమి కలుగదు.',
      'hi-hin': 'यहोवा मेरा चरवाहा है, मुझे कोई घटी न होगी।',
      'es-rv': 'Jehová es mi pastor; nada me faltará.',
      'fr-lsg': 'L’Éternel est mon berger: je ne manquerai de rien.',
      'pt-ara': 'O Senhor é o meu pastor; nada me faltará.',
      'de-lut': 'Der HERR ist mein Hirte, mir wird nichts mangeln.',
      'ko-krv': '여호와는 나의 목자시니 내게 부족함이 없으리로다.',
      'tl-adb': 'Ang Panginoon ay aking pastor; hindi ako mangangailangan.',
    },
  },
  {
    reference: 'Psalm 23:2-3',
    book: 'Psalms',
    chapter: 23,
    verse: 2,
    endVerse: 3,
    topic: 'Restoration & Peace',
    translations: {
      'en-kjv': 'He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
      'en-niv': 'He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name’s sake.',
      'te-sv': 'పచ్చికగల చోట్ల ఆయన నన్ను పరుండజేయుచున్నాడు; శాంతికరమైన జలములయొద్ద నన్ను నడుపుచున్నాడు. నా ప్రాణమునకు ఆయన సేదదీర్చుచున్నాడు. తన నామమునుబట్టి నీతిమార్గములలో నన్ను నడిపించుచున్నాడు.',
      'hi-hin': 'वह मुझे हरी-हरी चराइयों में बैठाता है; वह मुझे सुखदाई जल के झरने के पास ले चलता है। वह मेरे जी में जी ले आता है; धर्म के मार्गों में वह अपने नाम के निमित्त मेरी अगुवाई करता है।',
      'es-rv': 'En lugares de delicados pastos me hará descansar; Junto a aguas de reposo me pastoreará. Confortará mi alma; Me guiará por sendas de justicia por amor de su nombre.',
      'fr-lsg': 'Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles. Il restaure mon âme, Il me conduit dans les sentiers de la justice, À cause de son nom.',
      'pt-ara': 'Deitar-me faz em verdes pastos, guia-me mansamente a águas tranqüilas. Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome.',
      'de-lut': 'Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser. Er erquicket meine Seele; er führet mich auf rechter Straße um seines Namens willen.',
      'ko-krv': '그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다. 내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다.',
      'tl-adb': 'Kaniyang pinahihiga ako sa sariwang pastulan: pinapatnubayan niya ako sa tabi ng mga tahimik na tubig. Pinanunumbalik niya ang aking kaluluwa: pinapatnubayan niya ako sa mga landas ng katuwiran alangalang sa kaniyang pangalan.',
    },
  },
  {
    reference: 'Psalm 23:4',
    book: 'Psalms',
    chapter: 23,
    verse: 4,
    topic: 'Fear No Evil',
    translations: {
      'en-kjv': 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.',
      'en-niv': 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
      'te-sv': 'గాఢాంధకారపు లోయలో నేను సంచరించినను ఏ అపాయమునకు భయపడను, నీవు నాకు తోడై యుందువు; నీ దుడ్డుకఱ్ఱయు నీ దండమును నన్ను ఆదరించును.',
      'hi-hin': 'चाहे मैं घोर अन्धकार से भरी हुई तराई में होकर चलूं, तौभी हानि से न डरूंगा, क्योंकि तू मेरे साथ रहता है; तेरे सोंटे और तेरी लाठी से मुझे शान्ति मिलती है।',
      'es-rv': 'Aunque ande en valle de sombra de muerte, No temeré mal alguno, porque tú estarás conmigo; Tu vara y tu cayado me infundirán aliento.',
      'fr-lsg': 'Quand je marche dans la vallée de l’ombre de la mort, Je ne crains aucun mal, car tu es avec moi: Ta houlette et ton bâton me rassurent.',
      'pt-ara': 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.',
      'de-lut': 'Und ob ich schon wanderte im finstern Tal, fürchte ich kein Unglück; denn du bist bei mir, dein Stecken und Stab trösten mich.',
      'ko-krv': '내가 사망의 음침한 골짜기로 다닐지라도 해를 두려워하지 않을 것은 주께서 나와 함께 하심이라 주의 지팡이와 막대기가 나를 안위하시나이다.',
      'tl-adb': 'Oo, bagaman ako\'y lumalakad sa libis ng lilim ng kamatayan, wala akong katatakutang kasamaan; sapagka\'t ikaw ay sumasa akin: ang iyong pamalo at ang iyong tungkod, ay nagsisialiw sa akin.',
    },
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verse: 13,
    topic: 'Strength in Christ',
    translations: {
      'en-kjv': 'I can do all things through Christ which strengtheneth me.',
      'en-niv': 'I can do all this through him who gives me strength.',
      'te-sv': 'నన్ను బలపరచువానియందే నేను సమస్తమును చేయగలను.',
      'hi-hin': 'जो मुझे सामर्थ देता है उसमें मैं सब कुछ कर सकता हूं।',
      'es-rv': 'Todo lo puedo en Cristo que me fortalece.',
      'fr-lsg': 'Je puis tout par celui qui me fortifie.',
      'pt-ara': 'Tudo posso naquele que me fortalece.',
      'de-lut': 'Ich vermag alles durch den, der mich mächtig macht, Christus.',
      'ko-krv': '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라.',
      'tl-adb': 'Lahat ng mga bagay ay aking magagawa doon sa nagpapalakas sa akin.',
    },
  },
  {
    reference: 'Philippians 4:19',
    book: 'Philippians',
    chapter: 4,
    verse: 19,
    topic: 'God Will Supply All Needs',
    translations: {
      'en-kjv': 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',
      'en-niv': 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
      'te-sv': 'కాగా దేవుడు తన ఐశ్వర్యము చొప్పున క్రీస్తుయేసునందు మహిమలో మీ ప్రతి అవసరమును తీర్చును.',
      'hi-hin': 'और मेरा परमेश्वर भी अपने उस धन के अनुसार जो महिमा सहित मसीह यीशु में है, तुम्हारी हर एक घटी को पूरी करेगा।',
      'es-rv': 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.',
      'fr-lsg': 'Et mon Dieu pourvoira à tous vos besoins selon sa richesse, avec gloire, en Jésus Christ.',
      'pt-ara': 'O meu Deus suprirá todas as necessidades de vocês, de acordo com as suas gloriosas riquezas em Cristo Jesus.',
      'de-lut': 'Mein Gott aber wird all euren Mangel ausfüllen nach seinem Reichtum in Herrlichkeit in Christo Jesu.',
      'ko-krv': '나의 하나님이 그리스도 예수 안에서 영광 가운데 그 풍성한 대로 너희 모든 쓸 것을 채우시리라.',
      'tl-adb': 'At pupunan ng aking Dios ang bawa\'t kailangan ninyo ayon sa kaniyang mga kayamanan sa kaluwalhatian kay Cristo Jesus.',
    },
  },
  {
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verse: 28,
    topic: 'All Things Work Together for Good',
    translations: {
      'en-kjv': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      'en-niv': 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      'te-sv': 'దేవుని ప్రేమించువారికి, అనగా ఆయన సంకల్పముచొప్పున పిలువబడినవారికి, సమస్తమును సమకూడి మేలుకొరకే జరుగుచున్నవని యెరుగుదుము.',
      'hi-hin': 'और हम जानते हैं, कि जो लोग परमेश्वर से प्रेम रखते हैं, उनके लिये सब बातें मिलकर भलाई ही को उत्पन्न करती हैं; अर्थात उन्हीं के लिये जो उसकी इच्छा के अनुसार बुलाए हुए हैं।',
      'es-rv': 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
      'fr-lsg': 'Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.',
      'pt-ara': 'Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.',
      'de-lut': 'Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen, denen, die nach seinem Ratschluss berufen sind.',
      'ko-krv': '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라.',
      'tl-adb': 'At nalalaman natin na ang lahat ng mga bagay ay nagkakalakip na gumagawa sa ikabubuti ng mga nagsisiibig sa Dios, sa makatuwid baga\'y niyaong mga tinawag alinsunod sa kaniyang nasa.',
    },
  },
  {
    reference: 'Romans 8:31',
    book: 'Romans',
    chapter: 8,
    verse: 31,
    topic: 'If God Be For Us',
    translations: {
      'en-kjv': 'What shall we then say to these things? If God be for us, who can be against us?',
      'en-niv': 'What, then, shall we say in response to these things? If God is for us, who can be against us?',
      'te-sv': 'ఇట్లుండగా ఏమందుము? దేవుడు మనపక్షముననుండగా మనకు విరోధియెవడు?',
      'hi-hin': 'अतः हम इन बातों के विषय में क्या कहें? यदि परमेश्वर हमारी ओर है, तो हमारा विरोधी कौन हो सकता है?',
      'es-rv': '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?',
      'fr-lsg': 'Que dirons-nous donc à l’égard de ces choses? Si Dieu est pour nous, qui sera contre nous?',
      'pt-ara': 'Que diremos, pois, diante dessas coisas? Se Deus é por nós, quem será contra nós?',
      'de-lut': 'Was wollen wir nun hierzu sagen? Ist Gott für uns, wer mag wider uns sein?',
      'ko-krv': '그런즉 이 일에 대하여 우리가 무슨 말 하리요 만일 하나님이 우리를 위하시면 누가 우리를 대적하리요.',
      'tl-adb': 'Ano nga ang ating sasabihin sa mga bagay na ito? Kung ang Dios ay kakampi natin, sino ang laban sa atin?',
    },
  },
  {
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verse: 11,
    topic: 'Hope & Future',
    translations: {
      'en-kjv': 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
      'en-niv': '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
      'te-sv': 'నేను మీ విషయమై యోచించుచున్న తలంపులను నేనెరుగుదును, అవి సమాధానకరమైన తలంపులేగాని హానికరమైనవి కావు, మీకు నిరీక్షణ కలుగునట్లుగా కడవరి దినములలో నేను మీకు మేలుచేసెదను; ఇదే యెహోవా వాక్కు.',
      'hi-hin': 'क्योंकि यहोवा की यह वाणी है, कि जो कल्पनाएं मैं तुम्हारे विषय करता हूं उन्हें मैं जानता हूं, वे हानि की नहीं, वरन कुशल ही की हैं, और अन्त में तुम्हारी आशा पूरी करूंगा।',
      'es-rv': 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      'fr-lsg': 'Car je connais les projets que j’ai formés sur vous, dit l’Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l’espérance.',
      'pt-ara': 'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro.',
      'de-lut': 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der HERR: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.',
      'ko-krv': '여호와의 말씀이니라 너희를 향한 나의 생각을 내가 아나니 평안이요 재앙이 아니니라 너희에게 미래와 희망을 주는 것이니라.',
      'tl-adb': 'Sapagka\'t nalalaman ko ang mga pagiisip na aking iniisip sa inyo, sabi ng Panginoon, mga pagiisip tungkol sa kapayapaan, at hindi tungkol sa kasamaan, upang bigyan kayo ng pagasa sa inyong huling wakas.',
    },
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verse: 5,
    endVerse: 6,
    topic: 'Trust in the Lord',
    translations: {
      'en-kjv': 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
      'en-niv': 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
      'te-sv': 'నీ స్వబుద్ధిని ఆధారము చేసికొనక నీ పూర్ణహృదయముతో యెహోవాయందు నమ్మకముంచుము. నీ ప్రవర్తన అంతటియందు ఆయన అధికారమునకు ఒప్పుకొనుము; అప్పుడు ఆయన నీ త్రోవలను సరాళము చేయును.',
      'hi-hin': 'तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना। उसी को स्मरण करके सब काम करना, तब वह तेरे लिये सीधा मार्ग निकालेगा।',
      'es-rv': 'Fíate de Jehová de todo tu corazón, Y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, Y él enderezará tus veredas.',
      'fr-lsg': 'Confie-toi en l’Éternel de tout ton cœur, Et ne t’appuie pas sur ta sagesse; Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers.',
      'pt-ara': 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento; reconheça o Senhor em todos os seus caminhos, e ele endireitará as suas veredas.',
      'de-lut': 'Verlass dich auf den HERRN von ganzem Herzen, und verlass dich nicht auf deinen Verstand, sondern gedenke an ihn in allen deinen Wegen, so wird er dich recht führen.',
      'ko-krv': '너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라.',
      'tl-adb': 'Tumiwala ka sa Panginoon ng buong puso mo, at huwag kang manalig sa iyong sariling kaunawaan: Kilalanin mo siya sa lahat ng iyong mga lakad, at kaniyang ituturo ang iyong mga landas.',
    },
  },
  {
    reference: 'Isaiah 40:31',
    book: 'Isaiah',
    chapter: 40,
    verse: 31,
    topic: 'Renewed Strength Like Eagles',
    translations: {
      'en-kjv': 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
      'en-niv': 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      'te-sv': 'యెహోవాకొరకు ఎదురుచూచువారు నూతన బలము పొందుదురు; వారు పక్షులవలె రెక్కలు చాపి పైకి ఎగురుదురు; అలయక పరుగెత్తుదురు, సొమ్మసిల్లక నడిచిపోవుదురు.',
      'hi-hin': 'परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएंगे, वे उकाबों की नाईं उड़ेंगे, वे दौड़ेंगे और श्रमित न होंगे, चलेंगे और थकित न होंगे।',
      'es-rv': 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.',
      'fr-lsg': 'Mais ceux qui se confient en l’Éternel renouvellent leur force. Ils prennent le vol comme les aigles; Ils courent, et ne se lassent point; Ils marchent, et ne se fatiguent point.',
      'pt-ara': 'Mas os que esperam no Senhor renovam as suas forças; sobem com asas como águias; correm e não se cansam; caminham e não se fatigam.',
      'de-lut': 'Aber die auf den HERRN harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler, dass sie laufen und nicht matt werden, dass sie wandeln und nicht müde werden.',
      'ko-krv': '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고 걸어가도 피곤하지 아니하리로다.',
      'tl-adb': 'Nguni\'t silang nangaghihintay sa Panginoon ay mangagbabagong lakas; sila\'y paiilanglang na may mga pakpak na parang mga agila; sila\'y mangatatakbo, at hindi mangapapagod; sila\'y magsisilakad, at hindi manganghihina.',
    },
  },
  {
    reference: 'Matthew 28:19-20',
    book: 'Matthew',
    chapter: 28,
    verse: 19,
    endVerse: 20,
    topic: 'The Great Commission',
    translations: {
      'en-kjv': 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway, even unto the end of the world. Amen.',
      'en-niv': 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.',
      'te-sv': 'కాబట్టి మీరు వెళ్లి, సమస్త జనులను శిష్యులనుగా చేయుడి; తండ్రి యొక్కయు కుమారుని యొక్కయు పరిశుద్ధాత్మ యొక్కయు నామములోనికి వారికి బాప్తిస్మమిచ్చుచు, నేను మీకు ఏయే సంగతులను ఆజ్ఞాపించితినో వాటన్నిటిని గైకొనవలెనని వారికి బోధించుడి. ఇదిగో నేను యుగసమాప్తి వరకు సదాకాలము మీతో కూడ ఉన్నాననెను.',
      'hi-hin': 'इसलिये तुम जाकर सब जातियों के लोगों को चेला बनाओ: और उन्हें पिता, और पुत्र, और पवित्र आत्मा के नाम से बपतिस्मा दो। और उन्हें सब बातें जो मैं ने तुम्हें आज्ञा दी है, मानना सिखाओ: और देखो, मैं जगत के अन्त तक सदैव तुम्हारे संग हूं।',
      'es-rv': 'Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo; enseñándoles que guarden todas las cosas que os he mandado; y he aquí yo estoy con vosotros todos los días, hasta el fin del mundo. Amén.',
      'fr-lsg': 'Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint Esprit, et enseignez-leur à observer tout ce que je vous ai prescrit. Et voici, je suis avec vous tous les jours, jusqu’à la fin du monde.',
      'pt-ara': 'Portanto ide, fazei discípulos de todas as nações, batizando-os em nome do Pai, e do Filho, e do Espírito Santo; ensinando-os a guardar todas as coisas que eu vos tenho mandado; e eis que eu estou convosco todos os dias, até a consumação dos séculos. Amém.',
      'de-lut': 'Darum gehet hin und lehret alle Völker: Taufet sie auf den Namen des Vaters und des Sohnes und des Heiligen Geistes und lehret sie halten alles, was ich euch befohlen habe. Und siehe, ich bin bei euch alle Tage bis an der Welt Ende.',
      'ko-krv': '그러므로 너희는 가서 모든 족속으로 제자를 삼아 아버지와 아들과 성령의 이름으로 세례를 베풀고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라 볼지어다 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라.',
      'tl-adb': 'Dahil dito magsiyaon nga kayo, at gawin ninyong mga alagad ang lahat ng mga bansa, na sila\'y inyong bautismuhan sa pangalan ng Ama at ng Anak at ng Espiritu Santo: Na ituro ninyo sa kanila na kanilang ganapin ang lahat ng mga bagay na iniutos ko sa inyo: at narito, ako\'y sumasa inyong palagi, hanggang sa katapusan ng sanglibutan.',
    },
  },
  {
    reference: 'Genesis 1:1',
    book: 'Genesis',
    chapter: 1,
    verse: 1,
    topic: 'Creation',
    translations: {
      'en-kjv': 'In the beginning God created the heaven and the earth.',
      'en-niv': 'In the beginning God created the heavens and the earth.',
      'te-sv': 'ఆదియందు దేవుడు భూమ్యాకాశములను సృజించెను.',
      'hi-hin': 'आदि में परमेश्वर ने आकाश और पृथ्वी की सृष्टि की।',
      'es-rv': 'En el principio creó Dios los cielos y la tierra.',
      'fr-lsg': 'Au commencement, Dieu créa les cieux et la terre.',
      'pt-ara': 'No princípio, criou Deus os céus e a terra.',
      'de-lut': 'Am Anfang schuf Gott Himmel und Erde.',
      'ko-krv': '태초에 하나님이 천지를 창조하시니라.',
      'tl-adb': 'Nang pasimula ay nilikha ng Dios ang langit at ang lupa.',
    },
  },
  {
    reference: 'John 1:1',
    book: 'John',
    chapter: 1,
    verse: 1,
    topic: 'The Word Became Flesh',
    translations: {
      'en-kjv': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'en-niv': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'te-sv': 'ఆదియందు వాక్యముండెను, వాక్యము దేవునియొద్ద ఉండెను, వాక్యము దేవుడై యుండెను.',
      'hi-hin': 'आदि में वचन था, और वचन परमेश्वर के साथ था, और वचन परमेश्वर था।',
      'es-rv': 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.',
      'fr-lsg': 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.',
      'pt-ara': 'No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.',
      'de-lut': 'Im Anfang war das Wort, und das Wort war bei Gott, und Gott war das Wort.',
      'ko-krv': '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라.',
      'tl-adb': 'Nang pasimula siya ang Verbo, at ang Verbo ay kasama ng Dios, at ang Verbo ay Dios.',
    },
  },
  {
    reference: 'Matthew 6:33',
    book: 'Matthew',
    chapter: 6,
    verse: 33,
    topic: 'Seek First the Kingdom of God',
    translations: {
      'en-kjv': 'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.',
      'en-niv': 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
      'te-sv': 'కాబట్టి మీరు ఆయన రాజ్యమును నీతిని మొదట వెదకుడి; అప్పుడు అవన్నియు మీకనుగ్రహింపబడును.',
      'hi-hin': 'परन्तु तुम पहिले उसके राज्य और धर्म की खोज करो तो ये सब वस्तुएं भी तुम्हें मिल जाएंगी।',
      'es-rv': 'Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.',
      'fr-lsg': 'Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus.',
      'pt-ara': 'Busquem, pois, em primeiro lugar o Reino de Deus e a sua justiça, e todas essas coisas serão acrescentadas a vocês.',
      'de-lut': 'Trachtet am ersten nach dem Reich Gottes und nach seiner Gerechtigkeit, so wird euch solches alles zufallen.',
      'ko-krv': '그런즉 너희는 먼저 그의 나라와 그의 의를 구하라 그리하면 이 모든 것을 너희에게 더하시리라.',
      'tl-adb': 'Datapuwa\'t hanapin muna ninyo ang kaniyang kaharian, at ang kaniyang katuwiran; at ang lahat ng mga bagay na ito ay pawang idaragdag sa inyo.',
    },
  },
  {
    reference: 'Psalm 91:1-2',
    book: 'Psalms',
    chapter: 91,
    verse: 1,
    endVerse: 2,
    topic: 'The Secret Place of the Most High',
    translations: {
      'en-kjv': 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.',
      'en-niv': 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
      'te-sv': 'మహోన్నతుని చాటున నివసించువాడే సర్వశక్తుని నీడను విశ్రమించువాడు. ఆయన నా ఆశ్రయము నా కోట నేను నమ్ముకొను నా దేవుడని నేను యెహోవానుగూర్చి చెప్పుచున్నాను.',
      'hi-hin': 'जो परमप्रधान के छाए हुए स्थान में बैठा रहे, वह सर्वशक्तिमान की छाया में ठिकाना पाएगा। मैं यहोवा के विषय कहूंगा, कि वह मेरा शरणस्थान और मेरा गढ़ है; वह मेरा परमेश्वर है, मैं उस पर भरोसा रखूंगा।',
      'es-rv': 'El que habita al abrigo del Altísimo Morará bajo la sombra del Omnipotente. Diré yo a Jehová: Esperanza mía, y castillo mío; Mi Dios, en quien confiaré.',
      'fr-lsg': 'Celui qui demeure sous l’abri du Très Haut Repose à l’ombre du Tout Puissant. Je dis à l’Éternel: Mon refuge et ma forteresse, Mon Dieu en qui je me confie!',
      'pt-ara': 'Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará. Direi do Senhor: Ele é o meu Deus, o meu refúgio, a minha fortaleza, e nele confiarei.',
      'de-lut': 'Wer unter dem Schirm des Höchsten sitzt und unter dem Schatten des Allmächtigen bleibt, der spricht zu dem HERRN: Meine Zuflucht und meine Burg, mein Gott, auf den ich hoffe.',
      'ko-krv': '지존자의 은밀한 곳에 거주하며 전능자의 그늘 아래에 사는 자여, 나는 여호와를 향하여 말하기를 그는 나의 피난처요 나의 요새요 내가 의뢰하는 하나님이라 하리니.',
      'tl-adb': 'Siyang tumatahan sa lihim na dako ng Kataastaasan ay mananatili sa lilim ng Makapangyarihan sa lahat. Aking sasabihin tungkol sa Panginoon, Siya\'y aking kanlungan at aking katibayan, ang aking Dios na aking pinagtitiwalaan.',
    },
  },
  {
    reference: '2 Corinthians 5:17',
    book: '2 Corinthians',
    chapter: 5,
    verse: 17,
    topic: 'New Creation in Christ',
    translations: {
      'en-kjv': 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.',
      'en-niv': 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
      'te-sv': 'కాగా ఎవడైనను క్రీస్తునందున్నయెడల వాడు నూతన సృష్టి; పాతవి గతించెను, ఇదిగో క్రొత్తవాయెను.',
      'hi-hin': 'सो यदि कोई मसीह में है तो वह नई सृष्टि है: पुरानी बातें बीत गई हैं; देखो, वे सब नई हो गईं।',
      'es-rv': 'De modo que si alguno está en Cristo, nueva criatura es; las cosas viejas pasaron; he aquí todas son hechas nuevas.',
      'fr-lsg': 'Si quelqu’un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées; voici, toutes choses sont devenues nouvelles.',
      'pt-ara': 'Assim que, se alguém está em Cristo, nova criatura é; as coisas velhas já passaram; eis que tudo se fez novo.',
      'de-lut': 'Darum: Ist jemand in Christus, so ist er eine neue Kreatur; das Alte ist vergangen, siehe, Neues ist geworden.',
      'ko-krv': '그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라 이전 것은 지나갔으니 보라 새 것이 되었도다.',
      'tl-adb': 'Kaya\'t kung ang sinoman ay na kay Cristo, siya\'y bagong nilalang: ang mga dating bagay ay nagsilipas na; narito, sila\'y pawang naging bago.',
    },
  },
  {
    reference: 'Joshua 1:9',
    book: 'Joshua',
    chapter: 1,
    verse: 9,
    topic: 'Be Strong and Courageous',
    translations: {
      'en-kjv': 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.',
      'en-niv': 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
      'te-sv': 'నేను నీకాజ్ఞాపించియున్నాను గదా, నిబ్బరముగలిగి ధైర్యముగా నుండుము, దిగులుపడకుము జడియకుము, నీవు నడుచు మార్గమంతటిలో నీ దేవుడైన యెహోవా నీకు తోడైయుండును.',
      'hi-hin': 'क्या मैं ने तुझे आज्ञा नहीं दी? हियाव बान्ध और दृढ़ हो जा; भय न खा, और तेरा मन कच्चा न हो; क्योंकि जहां जहां तू जाएगा वहां वहां तेरा परमेश्वर यहोवा तेरे संग रहेगा।',
      'es-rv': 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
      'fr-lsg': 'Ne t’ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t’effraie point et ne t’épouvante point, car l’Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras.',
      'pt-ara': 'Não fui eu que lhe ordenei? Seja forte e corajoso! Não se apavore, nem se desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.',
      'de-lut': 'Habe ich dir nicht geboten, dass du getrost und freudig seist? Lass dir nicht grauen und entsetze dich nicht; denn der HERR, dein Gott, ist mit dir in allem, was du tun wirst.',
      'ko-krv': '내가 네게 명령한 것이 아니냐 강하고 담대하라 두려워하지 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라.',
      'tl-adb': 'Hindi ba kita inutusan? Ikaw ay magpakalakas at magpakatapang na mabuti; huwag kang matakot, ni manglupaypay: sapagka\'t ang Panginoon mong Dios ay sumasa iyo saan ka man pumaroon.',
    },
  },
  {
    reference: 'Psalm 119:105',
    book: 'Psalms',
    chapter: 119,
    verse: 105,
    topic: 'Light unto my Path',
    translations: {
      'en-kjv': 'Thy word is a lamp unto my feet, and a light unto my path.',
      'en-niv': 'Your word is a lamp for my feet, a light on my path.',
      'te-sv': 'నీ వాక్యము నా పాదములకు దీపమును నా త్రోవకు వెలుగునై యున్నది.',
      'hi-hin': 'तेरा वचन मेरे पांव के लिये दीपक, और मेरे मार्ग के लिये उजियाला है।',
      'es-rv': 'Lámpara es a mis pies tu palabra, Y lumbrera a mi camino.',
      'fr-lsg': 'Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier.',
      'pt-ara': 'Lâmpada para os meus pés é a tua palavra e, luz para o meu caminho.',
      'de-lut': 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.',
      'ko-krv': '주의 말씀은 내 발에 등이요 내 길에 빛이니이다.',
      'tl-adb': 'Ang salita mo\'y ilawan sa aking mga paa, at liwanag sa aking landas.',
    },
  },
  {
    reference: 'Isaiah 9:6',
    book: 'Isaiah',
    chapter: 9,
    verse: 6,
    topic: 'Prophecy of Prince of Peace',
    translations: {
      'en-kjv': 'For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.',
      'en-niv': 'For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.',
      'te-sv': 'ఏలయనగా మనకు శిశువు పుట్టెను మనకు కుమారుడు అనుగ్రహింపబడెను, ఆయన భుజముమీద రాజ్యభారముండును. ఆశ్చర్యకరుడు ఆలోచనకర్త బలవంతుడైన దేవుడు నిత్యుడగు తండ్రి సమాధానకర్తయగు అధిపతి అని ఆయనకు పేరు పెట్టబడును.',
      'hi-hin': 'क्योंकि हमारे लिये एक बालक उत्पन्न हुआ, हमें एक पुत्र दिया गया है; और प्रभुता उसके कांधे पर होगी, और उसका नाम अद्भुत युक्ति करनेवाला, पराक्रमी परमेश्वर, अनन्तकाल का पिता, और शान्ति का राजकुमार रखा जाएगा।',
      'es-rv': 'Porque un niño nos es nacido, hijo nos es dado, y el principado sobre su hombro; y se llamará su nombre Admirable, Consejero, Dios Fuerte, Padre Eterno, Príncipe de Paz.',
      'fr-lsg': 'Car un enfant nous est né, un fils nous est donné, Et la domination reposera sur son épaule; On l’appellera Admirable, Conseiller, Dieu puissant, Père éternel, Prince de la paix.',
      'pt-ara': 'Porque um menino nos nasceu, um filho se nos deu; e o principado está sobre os seus ombros; e o seu nome será Maravilhoso Conselheiro, Deus Forte, Pai da Eternidade, Príncipe da Paz.',
      'de-lut': 'Denn uns ist ein Kind geboren, ein Sohn ist uns gegeben, und die Herrschaft ist auf seiner Schulter; und er heißt Wunder-Rat, Gott-Held, Ewig-Vater, Friede-Fürst.',
      'ko-krv': '이는 한 아기가 우리에게 났고 한 아들을 우리에게 주신 바 되었는데 그의 어깨에는 정사를 메었고 그의 이름은 기묘자라, 모사라, 전능하신 하나님이라, 영존하시는 아버지라, 평강의 왕이라 할 것임이라.',
      'tl-adb': 'Sapagka\'t sa atin ay ipinanganak ang isang bata, sa atin ay ibinigay ang isang anak na lalake; at ang pamamahala ay maaatang sa kaniyang balikat: at ang kaniyang pangalan ay tatawaging Kamanghamangha, Tagapayo, Makapangyarihang Dios, Walang hanggang Ama, Pangulo ng Kapayapaan.',
    },
  },
  {
    reference: 'Revelation 21:4',
    book: 'Revelation',
    chapter: 21,
    verse: 4,
    topic: 'No More Tears or Sorrow',
    translations: {
      'en-kjv': 'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.',
      'en-niv': 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.',
      'te-sv': 'ఆయన వారి కన్నుల ప్రతి బాష్పబిందువును తుడిచివేయును, మరణము ఇక ఉండదు, దుఃఖమైనను ఏడ్పైనను వేదనయైనను ఇక ఉండదు, మొదటి సంగతులు గతించిపోయెనని సింహాసనములోనుండి వచ్చిన గొప్ప స్వరము చెప్పుట వింటిని.',
      'hi-hin': 'और वह उन की आंखों से सब आंसू पोंछ डालेगा; और इस के बाद मृत्यु न रहेगी, और न शोक, न विलाप, न पीड़ा रहेगी; पहली बातें जाती रहीं।',
      'es-rv': 'Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor; porque las primeras cosas pasaron.',
      'fr-lsg': 'Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n’y aura plus ni deuil, ni cri, ni douleur, car les premières choses ont disparu.',
      'pt-ara': 'Ele enxugará dos seus olhos toda lágrima. Não haverá mais morte, nem tristeza, nem choro, nem dor, pois a antiga ordem já passou.',
      'de-lut': 'Und Gott wird abwischen alle Tränen von ihren Augen, und der Tod wird nicht mehr sein, noch Leid noch Geschrei noch Schmerz wird mehr sein; denn das Erste ist vergangen.',
      'ko-krv': '모든 눈물을 그 눈에서 닦아 주시니 다시는 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라.',
      'tl-adb': 'At papahirin niya ang bawa\'t luha sa kanilang mga mata; at hindi na magkakaroon ng kamatayan; hindi na magkakaroon pa ng dalamhati, o ng pananangis man, o ng hirap pa man: ang mga unang bagay ay naparam na.',
    },
  },
];

/**
 * Smart Scripture Resolver (VerseVIEW & BibleShow fast lookup)
 * Parses queries like "John 3:16", "jn 3 16", "gen 1 1", "ps 23:1", "rom 8:28"
 */
export function resolveScriptureReference(query: string): {
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  foundItem?: VerseItem;
} | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // 1. Direct reference match in popular verses
  const exact = POPULAR_VERSES.find(
    (v) => v.reference.toLowerCase() === clean || clean.startsWith(v.reference.toLowerCase())
  );
  if (exact) {
    return {
      book: exact.book,
      chapter: exact.chapter,
      verse: exact.verse,
      endVerse: exact.endVerse,
      foundItem: exact,
    };
  }

  // 2. Parse Book + Chapter + Verse regex: e.g. "1 cor 13:4", "john 3 16", "ps 23:1-3"
  const match = clean.match(/^(\d?\s*[a-zA-Z]+)\s*(\d+)[\s:.,]+(\d+)(?:-(\d+))?$/);
  if (match) {
    const bookInput = match[1].replace(/\s+/g, ' ').trim();
    const chapterNum = parseInt(match[2], 10);
    const verseNum = parseInt(match[3], 10);
    const endVerseNum = match[4] ? parseInt(match[4], 10) : undefined;

    // Find book meta
    const bookMeta = BIBLE_BOOKS_META.find((b) => {
      const bLower = b.name.toLowerCase();
      if (bLower === bookInput) return true;
      if (b.aliases.some((a) => a === bookInput || bookInput.startsWith(a))) return true;
      if (bLower.startsWith(bookInput)) return true;
      return false;
    });

    if (bookMeta) {
      // Check if we have exact verse text
      const foundInDb = POPULAR_VERSES.find(
        (v) =>
          v.book.toLowerCase() === bookMeta.name.toLowerCase() &&
          v.chapter === chapterNum &&
          v.verse === verseNum
      );

      return {
        book: bookMeta.name,
        chapter: chapterNum,
        verse: verseNum,
        endVerse: endVerseNum,
        foundItem: foundInDb,
      };
    }
  }

  return null;
}
