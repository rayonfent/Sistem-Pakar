import KNOWLEDGE_BASE from './knowledgeBase';

const NLPEngine = {
  stopwords: new Set(["yang","dan","di","ke","dari","ini","itu","atau","juga","saya","aku","kamu","anda","bisa","mau","akan","ada","dengan","untuk","tidak","sudah","belum","saat","pada","oleh","bila","jika","kalau","apakah","bagaimana","berapa","kapan","dimana","siapa","apa","ya","tidak","bukan","harus","perlu","boleh","dapat","bagi","dalam","karena","maka","setelah","sebelum","hingga","sampai","namun","tetapi","tapi","namun","walaupun","meskipun","lagi","pun","punya","nya","pun","lah","kah","gak","nggak","enggak","gimana","dong","nih","sih","deh","loh","lo","gue","gw"]),

  normalize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  tokenize(text) {
    return text.split(/\s+/).filter(t => t.length > 1);
  },

  removeStopwords(tokens) {
    return tokens.filter(t => !this.stopwords.has(t));
  },

  stem(word) {
    // Simplified Sastrawi-like stemming for Indonesian
    const prefixes = ["me","men","mem","meng","menge","ber","be","pe","pen","pem","peng","penge","ter","ke","se"];
    const suffixes = ["kan","an","i","nya","lah","kah","ku","mu"];
    let w = word;
    for (const suf of suffixes) if (w.endsWith(suf) && w.length > suf.length + 2) { w = w.slice(0, -suf.length); break; }
    for (const pre of prefixes) if (w.startsWith(pre) && w.length > pre.length + 2) { w = w.slice(pre.length); break; }
    return w;
  },

  preprocess(text) {
    const normalized = this.normalize(text);
    const tokens = this.tokenize(normalized);
    const noStop = this.removeStopwords(tokens);
    const stemmed = noStop.map(t => this.stem(t));
    return { normalized, tokens, noStop, stemmed };
  },

  cosineSimilarity(a, b) {
    const setA = new Set(a), setB = new Set(b);
    const intersection = [...setA].filter(x => setB.has(x)).length;
    return intersection / (Math.sqrt(setA.size) * Math.sqrt(setB.size) || 1);
  },

  detectIntent(text) {
  const { stemmed, normalized } = this.preprocess(text); 
  
  // Greeting detection - check if ONLY greeting without academic keywords
  const greetings = ['halo', 'hai', 'hello', 'hi', 'helo', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'apa kabar'];
  const academicKeywords = ['sks', 'ipk', 'uas', 'uts', 'kehadiran', 'presensi', 'skripsi', 'kkn', 'pkl', 'yudisium', 'wisuda', 'cuti', 'semester', 'nilai', 'ujian', 'kuliah', 'dosen', 'administrasi'];
  
  const hasGreeting = greetings.some(g => normalized.includes(g));
  const hasAcademicKeyword = academicKeywords.some(k => normalized.includes(k));
  
  // Only return greeting intent if it's JUST a greeting without academic context
  if (hasGreeting && !hasAcademicKeyword && normalized.split(/\s+/).length <= 5) {
    return { 
      intent: { id: 'greeting', category: 'General' }, 
      confidence: 1.0 
    };
  }

  let best = null, bestScore = 0;

  // Strong keyword routing to avoid intent drifting to unrelated categories.
  const hardSignals = [
    { id: "skripsi", words: ["skripsi", "tugas akhir", "sidang"] },
    { id: "kkn", words: ["kkn", "kuliah kerja nyata"] },
    { id: "pkl", words: ["pkl", "magang", "kerja praktik", "kp"] },
    { id: "syarat_uas", words: ["uas", "ujian akhir"] },
    { id: "syarat_uts", words: ["uts", "ujian tengah"] },
    { id: "yudisium", words: ["yudisium"] },
    { id: "wisuda", words: ["wisuda"] },
    { id: "maksimal_sks", words: ["maksimal sks", "berapa sks", "ambil sks", "beban sks", "limit sks"] },
  ];

  for (const signal of hardSignals) {
    if (signal.words.some(w => normalized.includes(w))) {
      const forced = KNOWLEDGE_BASE.intents.find(i => i.id === signal.id);
      if (forced) {
        return { intent: forced, confidence: 0.98 };
      }
    }
  }

  for (const intent of KNOWLEDGE_BASE.intents) {
    let score = 0;
    let exactMatches = 0;
    
    for (const pattern of intent.patterns) {
      const pTokens = this.preprocess(pattern).stemmed;
      const sim = this.cosineSimilarity(stemmed, pTokens);
      
      // Check for exact substring match - give very high score
      if (normalized.includes(pattern)) {
        exactMatches++;
        score = Math.max(score, 0.95);
      }
      
      // Check for word-level match
      const patternWords = pattern.split(/\s+/);
      const matchedWords = patternWords.filter(w => normalized.includes(w)).length;
      if (matchedWords > 0) {
        const wordMatchScore = (matchedWords / patternWords.length) * 0.85;
        score = Math.max(score, wordMatchScore);
      }
      
      // Cosine similarity as fallback
      score = Math.max(score, sim * 0.7);
    }
    
    // Boost score if multiple patterns match
    if (exactMatches > 1) score = Math.min(score * 1.2, 1.0);
      
    if (score > bestScore) { 
      bestScore = score; 
      best = intent; 
    }
  }

  return { intent: bestScore > 0.22 ? best : null, confidence: bestScore };
  },

  extractFacts(text) {
    const facts = {};
    const norm = text.toLowerCase();

    // IPK extraction
    const ipkMatch = norm.match(/ipk\s*(?:saya|ku|gue|gw)?\s*(?:adalah|=|:)?\s*(\d+[.,]\d+)/);
    if (ipkMatch) facts.ipk = parseFloat(ipkMatch[1].replace(",","."));
    const ipkMatch2 = norm.match(/(\d+[.,]\d+)\s*(?:itu\s*)?(?:adalah\s*)?ipk/);
    if (ipkMatch2 && !facts.ipk) facts.ipk = parseFloat(ipkMatch2[1].replace(",","."));

    // Semester extraction
    const semMatch = norm.match(/semester\s*(?:ke[-\s]?)?\s*(\d+)/);
    if (semMatch) facts.semester = parseInt(semMatch[1]);
    const semMatch2 = norm.match(/(\d+)\s*(?:[-\s])?semester/);
    if (semMatch2 && !facts.semester) facts.semester = parseInt(semMatch2[1]);

    // SKS lulus extraction
    const sksMatch = norm.match(/(?:sudah\s*)?lulus\s*(\d+)\s*sks/);
    if (sksMatch) facts.sks_lulus = parseInt(sksMatch[1]);
    const sksMatch2 = norm.match(/(\d+)\s*sks\s*(?:sudah\s*)?(?:lulus|selesai|diambil)/);
    if (sksMatch2 && !facts.sks_lulus) facts.sks_lulus = parseInt(sksMatch2[1]);
    const sksMatch3 = norm.match(/sks\s*(?:saya|ku)?\s*(?:sudah|lulus|adalah|=|:)?\s*(\d+)/);
    if (sksMatch3 && !facts.sks_lulus) facts.sks_lulus = parseInt(sksMatch3[1]);

    // Presensi extraction
    const presMatch = norm.match(/(?:kehadiran|presensi|absensi|hadir)\s*(?:saya|ku)?\s*(?:adalah|=|:)?\s*(\d+)%?/);
    if (presMatch) facts.presensi = parseInt(presMatch[1]);
    const presMatch2 = norm.match(/(\d+)%\s*(?:kehadiran|presensi|hadir)/);
    if (presMatch2 && !facts.presensi) facts.presensi = parseInt(presMatch2[1]);

    // Boolean flags
    if (norm.includes("administrasi lunas") || norm.includes("sudah bayar") || norm.includes("ukt lunas")) facts.administrasi = true;
    if (norm.includes("administrasi belum") || norm.includes("belum bayar") || norm.includes("ukt belum")) facts.administrasi = false;
    if (norm.includes("sudah kkn") || norm.includes("kkn selesai") || norm.includes("kkn lulus")) facts.kkn = true;
    if (norm.includes("belum kkn")) facts.kkn = false;
    if (norm.includes("sudah pkl") || norm.includes("pkl selesai")) facts.pkl = true;
    if (norm.includes("sudah skripsi") || norm.includes("skripsi lulus") || norm.includes("sidang lulus")) facts.skripsi = true;
    if (norm.includes("sudah yudisium") || norm.includes("yudisium selesai")) facts.yudisium = true;
    if (norm.includes("sakit")) facts.sakit = true;

    return facts;
  }
};

export default NLPEngine;
