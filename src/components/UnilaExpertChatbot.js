import { useState, useEffect, useRef } from 'react';
import KNOWLEDGE_BASE from '../knowledgeBase';
import InferenceEngine from '../inferenceEngine';
import ResponseGenerator from '../responseGenerator';
import Database from '../database';

// ============ SVG ICONS ============
const GraduationCapIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const UserIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M9 21v-2a4 4 0 0 0-4 4v2" />
    <circle cx="6" cy="7" r="4" />
  </svg>
);

const ChatIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const RulesIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="9" x2="15" y2="9" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const TargetIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const BarChartIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const FileIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SunIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SearchIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SettingsIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlusIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SparklesIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const LogOutIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MenuIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SendIcon = ({ size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export default function UnilaExpertChatbot() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // login | chat | admin
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminTab, setAdminTab] = useState("rules");
  const [showTrace, setShowTrace] = useState(false);
  const [lastTrace, setLastTrace] = useState(null);
  const [searchRule, setSearchRule] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  
  // Mobile check state
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Collapse sidebar initially on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleLogin = () => {
    const found = Database.users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (found) {
      setUser(found);
      setLoginError("");
      const userChats = Database.getUserChats(found.id);
      setChats(userChats);
      if (found.role === "admin") setView("admin");
      else { setView("chat"); startNewChat(found); }
    } else {
      setLoginError("Email atau password salah.");
    }
  };

  const startNewChat = (u = user) => {
    const chat = Database.createChat(u.id);
    setChats(prev => [chat, ...prev]);
    setActiveChat(chat);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya **UNILA Academic Expert Chatbot** 🎓\n\nSaya adalah sistem pakar akademik berbasis *Forward Chaining Inference Engine* yang dapat membantu Anda memahami aturan akademik Universitas Lampung.\n\nSaya dapat menjawab pertanyaan tentang:\n• Pengambilan SKS berdasarkan IPK\n• Syarat UTS/UAS dan kehadiran\n• Pendaftaran Skripsi, KKN, PKL\n• Yudisium dan Wisuda\n• Cuti Akademik\n• Drop Out dan batas studi\n• Dan 100+ aturan akademik lainnya\n\nCoba tanyakan sesuatu seperti:\n*"IPK saya 3.2, berapa maksimal SKS yang bisa saya ambil?"*`,
      timestamp: new Date()
    }]);
    if (isMobile) setSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(Database.getMessages(chat.id));
    if (isMobile) setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");

    const userMsgObj = { id: Date.now(), role: "user", content: userMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsgObj]);
    if (activeChat) Database.addMessage(activeChat.id, "user", userMsg);

    setIsTyping(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    // Run inference
    const inferResult = InferenceEngine.infer(userMsg);
    const response = ResponseGenerator.generateResponse(inferResult, userMsg);

    Database.addLog({
      input: userMsg,
      intent: inferResult.intent?.id,
      confidence: inferResult.confidence,
      facts: inferResult.facts,
      rules_fired: inferResult.fired.map(f=>f.rule.rule_id),
      response: response.text.substring(0, 200)
    });

    const botMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: response.text,
      metadata: { sources: response.sources, intent: inferResult.intent?.id, confidence: response.confidence, rules_fired: response.rules_fired },
      trace: response.trace,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
    setLastTrace(response.trace);
    if (activeChat) Database.addMessage(activeChat.id, "assistant", response.text, botMsg.metadata);

    // Update chat title
    if (activeChat && messages.length <= 1) {
      const shortTitle = userMsg.slice(0, 40) + (userMsg.length > 40 ? "..." : "");
      setChats(prev => prev.map(c => c.id === activeChat.id ? {...c, title: shortTitle} : c));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSimulate = (demo) => setInput(demo);

  const filteredRules = KNOWLEDGE_BASE.rules.filter(r =>
    !searchRule || r.rule_id.toLowerCase().includes(searchRule.toLowerCase()) ||
    r.category.toLowerCase().includes(searchRule.toLowerCase()) ||
    r.template.toLowerCase().includes(searchRule.toLowerCase())
  );

  const colors = {
    bg: darkMode ? "#0B0F17" : "#F8FAFC",
    sidebar: darkMode ? "#111827" : "#F1F5F9",
    card: darkMode ? "#1F2937" : "#FFFFFF",
    border: darkMode ? "#374151" : "#E2E8F0",
    text: darkMode ? "#F3F4F6" : "#0F172A",
    textMuted: darkMode ? "#9CA3AF" : "#64748B",
    accent: "#0d9488",
    accentLight: darkMode ? "#14b8a6" : "#0f766e",
    userBubble: "#2563eb",
    botBubble: darkMode ? "#1F2937" : "#F1F5F9",
    input: darkMode ? "#111827" : "#FFFFFF",
    inputBorder: darkMode ? "#374151" : "#CBD5E1",
    headerBg: darkMode ? "#111827" : "#FFFFFF",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    tag: darkMode ? "rgba(37, 99, 235, 0.15)" : "#e0f2fe",
    tagText: darkMode ? "#60a5fa" : "#0369a1",
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const demos = [
    "IPK saya 3.5 semester 6, berapa sks yang bisa saya ambil?",
    "Kehadiran saya 65%, apakah boleh ikut UAS?",
    "Sudah lulus 115 SKS, IPK 2.8, boleh daftar skripsi?",
    "Apa syarat untuk mengikuti KKN?",
    "Saya semester 3, boleh cuti akademik?",
    "IPK 1.8 semester 5, apakah saya akan di-DO?",
    "Syarat yudisium di UNILA apa saja?",
    "Bisa ikut semester pendek kalau IPK 1.9?",
  ];

  // ============ SIDEBAR RENDERING ============
  const renderSidebar = () => {
    if (!sidebarOpen && !isMobile) return null;
    return (
      <div style={{
        width: 280,
        background: colors.sidebar,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "all 0.3s ease",
        ...(isMobile ? {
          position: "absolute",
          left: sidebarOpen ? 0 : -280,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.2)" : "none",
        } : {})
      }}>
        <div style={{ padding: 16 }}>
          <button onClick={() => startNewChat()} style={{ width: "100%", padding: "11px 14px", background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`, color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 12px ${colors.accent}30`, transition: "transform 0.2s, box-shadow 0.2s" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 16px ${colors.accent}45`; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent}30`; }}>
            <PlusIcon size={16} /> Percakapan Baru
          </button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 12px 12px" }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600, letterSpacing: 1, padding: "8px 8px 6px", textTransform: "uppercase" }}>Riwayat</div>
          {chats.map(chat => (
            <button key={chat.id} onClick={() => selectChat(chat)} style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: activeChat?.id === chat.id ? colors.card : "transparent", border: activeChat?.id === chat.id ? `1px solid ${colors.border}` : "1px solid transparent", borderRadius: 10, color: colors.text, cursor: "pointer", fontSize: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
              <ChatIcon size={14} style={{ color: activeChat?.id === chat.id ? colors.accentLight : colors.textMuted, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.title}</span>
            </button>
          ))}
        </div>

        {/* Demo shortcuts in Sidebar */}
        <div style={{ padding: 16, borderTop: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontWeight: 600, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Contoh Pertanyaan</div>
          {demos.slice(0, 4).map(d => (
            <button key={d} onClick={() => handleSimulate(d)} style={{ width: "100%", textAlign: "left", padding: "8px 10px", background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.textMuted, cursor: "pointer", fontSize: 10, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }} onMouseOver={e => { e.currentTarget.style.borderColor = colors.accentLight; e.currentTarget.style.color = colors.text; }} onMouseOut={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textMuted; }}>
              <SparklesIcon size={10} style={{ color: colors.accentLight, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ============ LOGIN SCREEN ============
  if (view === "login") return (
    <div style={{
      minHeight:"100vh",
      background: darkMode ? "linear-gradient(135deg, #090d16 0%, #0d9488 100%)" : "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
      backgroundSize:"cover",
      backgroundPosition:"center",
      position:"relative",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      fontFamily:"'Poppins', 'Segoe UI', system-ui, sans-serif",
      transition: "all 0.5s ease"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px ${darkMode ? "rgba(13, 148, 136, 0.3)" : "rgba(15, 118, 110, 0.15)"}}50%{box-shadow:0 0 40px ${darkMode ? "rgba(13, 148, 136, 0.5)" : "rgba(15, 118, 110, 0.3)"}}}
        * { box-sizing: border-box; }
      `}</style>

      {/* Theme Toggle Button */}
      <button onClick={() => setDarkMode(p => !p)} style={{
        position:"absolute",
        top:24,
        right:24,
        background: colors.card,
        border:`1px solid ${colors.border}`,
        borderRadius:"50%",
        color: colors.text,
        cursor:"pointer",
        width:42,
        height:42,
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
        transition:"all 0.3s ease",
        zIndex: 10
      }}
        onMouseOver={e=>e.currentTarget.style.transform="scale(1.08)"}
        onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}
      >
        {darkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>

      <div style={{
        position:"absolute",
        inset:0,
        background: darkMode ? "rgba(2, 6, 23, 0.6)" : "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(4px)"
      }} />

      <div style={{
        width: "100%",
        maxWidth: 400,
        margin: "0 16px",
        padding: isMobile ? "30px 24px" : "40px",
        background: darkMode ? "rgba(31, 41, 55, 0.85)" : "rgba(255, 255, 255, 0.88)",
        borderRadius: 24,
        border: `1px solid ${colors.border}`,
        backdropFilter:"blur(16px)",
        animation:"glow 4s ease-in-out infinite",
        position:"relative",
        zIndex:1,
        transition: "all 0.3s ease"
      }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo.png" alt="UNILA logo" style={{ width:76, height:76, objectFit:"contain", animation:"float 4s ease-in-out infinite" }} />
          <h1 style={{ color:colors.text, fontSize:22, fontWeight:700, margin:"16px 0 6px" }}>UNILA Academic Expert</h1>
          <p style={{ color:colors.textMuted, fontSize:13, margin:0 }}>Chatbot Sistem Pakar Akademik UNILA</p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:colors.textMuted, fontSize:11, fontWeight:600, display:"block", marginBottom:8, letterSpacing:"0.5px" }}>EMAIL</label>
          <input value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="email@unila.ac.id" type="email"
            style={{ width:"100%", padding:"12px 16px", background:colors.input, border:`1px solid ${colors.inputBorder}`, borderRadius:12, color:colors.text, fontSize:14, outline:"none", transition:"all 0.2s" }}
            onFocus={e=>e.target.style.borderColor=colors.accentLight}
            onBlur={e=>e.target.style.borderColor=colors.inputBorder}
          />
        </div>
        <div style={{ marginBottom:12 }}>
          <label style={{ color:colors.textMuted, fontSize:11, fontWeight:600, display:"block", marginBottom:8, letterSpacing:"0.5px" }}>PASSWORD</label>
          <input value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="••••••••" type="password"
            style={{ width:"100%", padding:"12px 16px", background:colors.input, border:`1px solid ${colors.inputBorder}`, borderRadius:12, color:colors.text, fontSize:14, outline:"none", transition:"all 0.2s" }}
            onFocus={e=>e.target.style.borderColor=colors.accentLight}
            onBlur={e=>e.target.style.borderColor=colors.inputBorder}
          />
        </div>
        {loginError && <p style={{ color:colors.danger, fontSize:12, margin:"8px 0 0", fontWeight:500 }}>{loginError}</p>}
        <button onClick={handleLogin} style={{ width:"100%", padding:"14px", background:colors.userBubble, color:"white", border:"none", borderRadius:12, fontSize:15, fontWeight:600, cursor:"pointer", marginTop:24, transition:"all 0.2s", boxShadow:"0 4px 12px rgba(37, 99, 235, 0.2)" }}
          onMouseOver={e=>e.target.style.background="#1d4ed8"} onMouseOut={e=>e.target.style.background=colors.userBubble}>
          Masuk →
        </button>
        <p style={{ color:colors.textMuted, fontSize:10, textAlign:"center", marginTop:32, lineHeight: 1.4 }}>Rule-Based Expert System | Forward Chaining | NLP Bahasa Indonesia</p>
      </div>
    </div>
  );

  // ============ ADMIN PANEL ============
  if (view === "admin") return (
    <div style={{ minHeight:"100vh", background:colors.bg, color:colors.text, fontFamily:"'Poppins', 'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column", transition:"all 0.3s ease" }}>
      <style>{`
        * { box-sizing: border-box; } 
        ::-webkit-scrollbar{width:6px} 
        ::-webkit-scrollbar-track{background:${colors.sidebar}} 
        ::-webkit-scrollbar-thumb{background:${colors.border};border-radius:3px} 
        table{border-collapse:collapse;width:100%} 
        th,td{padding:12px 16px;border-bottom:1px solid ${colors.border};text-align:left;font-size:13px;color:${colors.text}; transition: background-color 0.2s ease;} 
        th{background:${colors.sidebar};color:${colors.textMuted};font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px} 
        tr:hover td{background:${darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}}
        .tabs-container::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Admin Header */}
      <div style={{ background:colors.headerBg, borderBottom:`1px solid ${colors.border}`, padding: isMobile ? "0 16px" : "0 24px", display:"flex", alignItems:"center", height:64, gap:12 }}>
        <GraduationCapIcon size={24} style={{ color: colors.accentLight, flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <span style={{ fontWeight:700, color:colors.text, fontSize:15, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>UNILA Admin Panel</span>
          {!isMobile && <span style={{ color:colors.textMuted, fontSize:12, marginLeft:8 }}>Expert System Dashboard</span>}
        </div>
        
        {/* Toggle Dark/Light Mode in Admin */}
        <button onClick={()=>setDarkMode(p=>!p)} style={{ background:"none", border:`1px solid ${colors.border}`, borderRadius:8, color:colors.textMuted, cursor:"pointer", padding:"7px 10px", display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink: 0 }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.accentLight} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
          {darkMode ? <SunIcon size={14} /> : <MoonIcon size={14} />}
        </button>

        <button onClick={()=>{setView("chat");if(!activeChat)startNewChat();}} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 12px", background:colors.card, border:`1px solid ${colors.border}`, borderRadius:8, color:colors.text, fontSize:12, cursor:"pointer", transition:"all 0.2s", flexShrink: 0 }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.accentLight} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
          <ChatIcon size={14} style={{ color: colors.accentLight }} /> 
          {!isMobile && <span>Ke Chat</span>}
        </button>

        <button onClick={()=>{setUser(null);setView("login");}} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 12px", background:"transparent", border:`1px solid ${colors.danger}`, borderRadius:8, color:colors.danger, fontSize:12, cursor:"pointer", transition:"all 0.2s", flexShrink: 0 }} onMouseOver={e=>e.currentTarget.style.background=`${colors.danger}15`} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
          <LogOutIcon size={14} /> 
          {!isMobile && <span>Logout</span>}
        </button>
      </div>

      {/* Stats Bar */}
      <div style={{
        padding: isMobile ? "16px" : "20px 24px",
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(auto-fit, minmax(130px, 1fr))" : "repeat(5, 1fr)",
        gap: isMobile ? 10 : 16,
        background: colors.bg
      }}>
        {[
          [<RulesIcon size={20} style={{ color: "#2563eb" }} />, "Total Rules", KNOWLEDGE_BASE.rules.length, "#2563eb"],
          [<TargetIcon size={20} style={{ color: "#10b981" }} />, "Intent Categories", KNOWLEDGE_BASE.intents.length, "#10b981"],
          [<ChatIcon size={20} style={{ color: "#f59e0b" }} />, "Total Pesan", Database.messages.length, "#f59e0b"],
          [<BarChartIcon size={20} style={{ color: "#8b5cf6" }} />, "Inference Logs", Database.logs.length, "#8b5cf6"],
          [<UsersIcon size={20} style={{ color: "#06b6d4" }} />, "Users", Database.users.length, "#06b6d4"],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, padding:"14px 18px", borderLeft:`4px solid ${color}`, boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)", display:"flex", flexDirection:"column", gap:6 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:11, color:colors.textMuted, fontWeight:500 }}>{label}</span>
              {icon}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:colors.text }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Admin Tabs */}
      <div className="tabs-container" style={{
        display: "flex",
        gap: 4,
        padding: isMobile ? "0 16px" : "0 24px",
        background: colors.bg,
        borderBottom: `1px solid ${colors.border}`,
        overflowX: "auto",
        whiteSpace: "nowrap",
        WebkitOverflowScrolling: "touch"
      }}>
        {[
          ["rules", "Knowledge Base", <RulesIcon size={15} />],
          ["intents", "Intents", <TargetIcon size={15} />],
          ["logs", "Inference Logs", <BarChartIcon size={15} />],
          ["upload", "Upload PDF", <FileIcon size={15} />],
          ["users", "Users", <UsersIcon size={15} />],
        ].map(([t, l, icon]) => (
          <button key={t} onClick={() => setAdminTab(t)} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 18px", background:"transparent", border:"none", borderBottom: adminTab===t?`2px solid ${colors.accentLight}`:"2px solid transparent", color: adminTab===t?colors.text:colors.textMuted, fontSize:13, cursor:"pointer", fontWeight: adminTab===t?600:400, transition:"all 0.2s", flexShrink: 0 }}>
            {icon}
            <span>{l}</span>
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"auto", padding: isMobile ? 16 : 24 }}>
        {/* RULES TAB */}
        {adminTab === "rules" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, alignItems: isMobile ? "stretch" : "center", flexDirection: isMobile ? "column" : "row" }}>
              <input value={searchRule} onChange={e=>setSearchRule(e.target.value)} placeholder="Cari rule (ID, kategori, konten)..." style={{ flex:1, padding:"10px 16px", background:colors.card, border:`1px solid ${colors.border}`, borderRadius:10, color:colors.text, fontSize:13, outline:"none", transition:"all 0.2s" }} onFocus={e=>e.target.style.borderColor=colors.accentLight} onBlur={e=>e.target.style.borderColor=colors.border} />
              <span style={{ color:colors.textMuted, fontSize:12, fontWeight:500, textAlign: isMobile ? "right" : "left" }}>{filteredRules.length} rules</span>
            </div>
            <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead><tr><th>Rule ID</th><th>Kategori</th><th>Prioritas</th><th>Kondisi</th><th>Response Template</th><th>Sumber</th></tr></thead>
                  <tbody>
                    {filteredRules.map(r => (
                      <tr key={r.rule_id}>
                        <td><span style={{ fontFamily:"monospace", color:colors.tagText, background:colors.tag, padding:"3px 8px", borderRadius:6, fontSize:12, fontWeight:600 }}>{r.rule_id}</span></td>
                        <td><span style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9", padding:"3px 8px", borderRadius:6, fontSize:11, color:colors.text, fontWeight:500 }}>{r.category}</span></td>
                        <td><span style={{ color: r.priority===1?colors.success:r.priority===2?colors.warning:colors.textMuted, fontWeight:700 }}>P{r.priority}</span></td>
                        <td style={{ fontSize:11, color:colors.textMuted, maxWidth:180, whiteSpace:"normal", wordBreak:"break-all" }}>{r.conditions.length===0?"(selalu berlaku)":r.conditions.map(c=>`${c.field} ${c.op} ${c.val}`).join(", ")}</td>
                        <td style={{ fontSize:11, color:colors.text, maxWidth:320 }}><div style={{ maxHeight:48, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{r.template}</div></td>
                        <td style={{ fontSize:11, color:colors.textMuted }}>{r.source?.split(" ").slice(-2).join(" ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INTENTS TAB */}
        {adminTab === "intents" && (
          <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr><th>Intent ID</th><th>Kategori</th><th>Pattern Keywords</th><th>Facts Needed</th></tr></thead>
                <tbody>
                  {KNOWLEDGE_BASE.intents.map(i => (
                    <tr key={i.id}>
                      <td><code style={{ color:colors.tagText, fontSize:12, fontWeight:600 }}>{i.id}</code></td>
                      <td><span style={{ background: darkMode ? "rgba(245,158,11,0.15)" : "#fef3c7", padding:"3px 8px", borderRadius:6, fontSize:11, color:colors.warning, fontWeight:600 }}>{i.category}</span></td>
                      <td style={{ fontSize:11, color:colors.textMuted }}>{i.patterns.slice(0,4).join(", ")}{i.patterns.length>4&&` +${i.patterns.length-4} lagi`}</td>
                      <td style={{ fontSize:11, color:colors.text }}>{i.facts_needed.length>0?i.facts_needed.join(", "):<span style={{color:colors.textMuted}}>-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {adminTab === "logs" && (
          <div>
            {Database.logs.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:colors.textMuted }}>Belum ada inference log. Mulai chat untuk menghasilkan log.</div>
            ) : (
              <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead><tr><th>#</th><th>Input User</th><th>Intent</th><th>Confidence</th><th>Facts</th><th>Rules Fired</th><th>Waktu</th></tr></thead>
                    <tbody>
                      {[...Database.logs].reverse().map((log,i) => (
                        <tr key={log.id}>
                          <td style={{color:colors.textMuted,fontSize:11}}>{log.id}</td>
                          <td style={{fontSize:12,maxWidth:220,color:colors.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.input}</td>
                          <td><code style={{color:colors.tagText,fontSize:11}}>{log.intent||"—"}</code></td>
                          <td><span style={{color: log.confidence>0.5?colors.success:log.confidence>0.2?colors.warning:colors.danger, fontWeight:700, fontSize:12}}>{Math.round((log.confidence||0)*100)}%</span></td>
                          <td style={{fontSize:11,color:colors.textMuted}}>{Object.entries(log.facts||{}).map(([k,v])=>`${k}:${v}`).join(", ")||"—"}</td>
                          <td style={{fontSize:11,color:colors.text}}>{(log.rules_fired||[]).join(", ")||"—"}</td>
                          <td style={{fontSize:11,color:colors.textMuted}}>{new Date(log.created_at).toLocaleTimeString("id-ID")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD TAB */}
        {adminTab === "upload" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:colors.card, border:`2px dashed ${colors.border}`, borderRadius:20, padding: isMobile ? 24 : 40, textAlign:"center", marginBottom:20, transition:"all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.accentLight} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}><FileIcon size={48} style={{ color: colors.accentLight }} /></div>
              <p style={{ color:colors.text, fontWeight:600, marginBottom:8, fontSize:16 }}>Upload PDF Panduan Akademik</p>
              <p style={{ color:colors.textMuted, fontSize:13, marginBottom:24 }}>Upload PDF untuk ekstraksi teks dan parsing aturan akademik otomatis</p>
              <input type="file" accept=".pdf" onChange={()=>{ setUploadMsg("✅ File berhasil diterima. Ekstraksi teks dimulai dengan pdfplumber... (Simulasi: dalam sistem production, teks akan diekstrak per halaman dan disimpan ke database.)"); setTimeout(()=>setUploadMsg("🔄 Parsing halaman 1/45... Ditemukan 23 aturan baru. Menyimpan ke knowledge base..."),1500); setTimeout(()=>setUploadMsg("✅ Proses selesai! 23 aturan baru berhasil ditambahkan ke knowledge base."),4000); }}
                style={{ display:"none" }} id="pdf-upload" />
              <label htmlFor="pdf-upload" style={{ display:"inline-block", padding:"12px 28px", background:colors.userBubble, color:"white", borderRadius:12, cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(37, 99, 235, 0.2)" }}>Pilih File PDF</label>
            </div>
            {uploadMsg && <div style={{ padding:16, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:12, color:colors.success, fontSize:13, fontWeight:500 }}>{uploadMsg}</div>}
            <div style={{ marginTop:24, padding:20, background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16 }}>
              <h4 style={{ color:colors.text, margin:"0 0 14px", fontSize:14, fontWeight:600 }}>📋 Pipeline PDF Processing</h4>
              {["1. Upload PDF → Simpan ke /knowledge_base/raw_pdf/","2. pdfplumber → Ekstrak teks per halaman","3. Cleaning → Hapus karakter aneh, normalisasi teks","4. Parsing → Identifikasi pasal, ayat, dan aturan","5. Rule Extraction → Konversi ke format JSON rule","6. Database Insert → Simpan ke tabel rules & sources","7. Vectorization → Update TF-IDF vector space"].map(s=>(
                <div key={s} style={{ fontSize:12, color:colors.textMuted, padding:"10px 0", borderBottom:`1px solid ${colors.border}` }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {adminTab === "users" && (
          <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  {Database.users.map(u=>(
                    <tr key={u.id}>
                      <td style={{color:colors.textMuted}}>{u.id}</td>
                      <td style={{fontWeight:600, color:colors.text}}>{u.name}</td>
                      <td style={{color:colors.tagText,fontSize:13}}>{u.email}</td>
                      <td><span style={{ background: u.role==="admin"? (darkMode?"rgba(124,58,237,0.15)":"#ede9fe") : (darkMode?"rgba(13,148,136,0.15)":"#ccfbf1"), color: u.role==="admin"?"#a78bfa":"#0d9488", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{u.role}</span></td>
                      <td>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:6, color:colors.success, fontSize:12, fontWeight:500 }}>
                          <span style={{ width:8, height:8, borderRadius:"50%", background:colors.success, display:"inline-block" }} />
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ============ CHAT VIEW ============
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Poppins', 'Segoe UI',system-ui,sans-serif", color:colors.text, position:"relative", transition:"all 0.3s ease" }}>
      <style>{`
        * {box-sizing:border-box;} 
        ::-webkit-scrollbar{width:5px} 
        ::-webkit-scrollbar-thumb{background:${colors.border};border-radius:3px} 
        @keyframes typingDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}} 
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} 
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      
      <div style={{ position:"absolute", inset:0, background: darkMode ? "rgba(11, 15, 23, 0.6)" : "rgba(248, 250, 252, 0.65)", backdropFilter:"blur(4px)" }} />
      
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100%" }}>

        {/* Header */}
        <div style={{ height:64, background:colors.headerBg, borderBottom:`1px solid ${colors.border}`, display:"flex", alignItems:"center", padding: isMobile ? "0 12px" : "0 20px", gap:10, flexShrink:0 }}>
          <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:"none", border:"none", color:colors.textMuted, cursor:"pointer", padding:6, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:8, transition:"background 0.2s" }} onMouseOver={e=>e.currentTarget.style.background=darkMode?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
            <MenuIcon size={20} />
          </button>
          
          <div style={{ width:40, height:40, background: darkMode ? "rgba(31, 41, 55, 0.8)" : "#ffffff", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${colors.border}`, boxShadow:"0 2px 4px rgba(0,0,0,0.05)", flexShrink: 0 }}>
            <img src="/logo.png" alt="UNILA logo" style={{ width:26, height:26, objectFit:"contain" }} />
          </div>
          
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight:700, fontSize:15, color:colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>UNILA Academic Expert</div>
            {!isMobile && <div style={{ fontSize:11, color:colors.textMuted }}>Rule-Based Expert System • Forward Chaining</div>}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {lastTrace && (
              <button onClick={()=>setShowTrace(p=>!p)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px", background: showTrace?colors.accent:"transparent", border:`1px solid ${showTrace?colors.accent:colors.border}`, borderRadius:8, color: showTrace?"white":colors.textMuted, fontSize:11, cursor:"pointer", transition:"all 0.2s" }}>
                <SearchIcon size={12} /> 
                {!isMobile && <span>{showTrace?"Sembunyikan":"Lihat"} Trace</span>}
              </button>
            )}
            
            <button onClick={()=>setDarkMode(p=>!p)} style={{ background:"none", border:`1px solid ${colors.border}`, borderRadius:8, color:colors.textMuted, cursor:"pointer", padding:"6px 10px", display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.accentLight} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
              {darkMode ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </button>
            
            {user?.role === "admin" && (
              <button onClick={()=>setView("admin")} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px", background:`${colors.accent}15`, border:`1px solid ${colors.accent}`, borderRadius:8, color:colors.accentLight, fontSize:11, cursor:"pointer", transition:"all 0.2s" }} onMouseOver={e=>e.currentTarget.style.background=`${colors.accent}25`} onMouseOut={e=>e.currentTarget.style.background=`${colors.accent}15`}>
                <SettingsIcon size={12} /> 
                {!isMobile && <span>Admin</span>}
              </button>
            )}
            
            <button onClick={()=>{setUser(null);setView("login");}} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 10px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:8, color:colors.textMuted, fontSize:11, cursor:"pointer", transition:"all 0.2s" }} onMouseOver={e=>e.currentTarget.style.borderColor=colors.danger} onMouseOut={e=>e.currentTarget.style.borderColor=colors.border}>
              <LogOutIcon size={12} /> 
              {!isMobile && <span>Logout</span>}
            </button>
          </div>
        </div>

        <div style={{ flex:1, display:"flex", overflow:"hidden", position: "relative" }}>
          
          {/* Backdrop overlay for mobile sidebar drawer */}
          {isMobile && sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(11, 15, 23, 0.5)",
                backdropFilter: "blur(2px)",
                zIndex: 90,
                animation: "fadeIn 0.2s ease"
              }} 
            />
          )}

          {/* Sidebar */}
          {renderSidebar()}

          {/* Main Content Area */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
            
            {/* Trace Panel */}
            {showTrace && lastTrace && (
              <div style={{ background:colors.card, borderBottom:`1px solid ${colors.border}`, padding:16, maxHeight:200, overflow:"auto", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)", zIndex:5 }}>
                <div style={{ fontSize:11, fontWeight:700, color:colors.textMuted, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                  <SearchIcon size={12} /> INFERENCE TRACE (Forward Chaining)
                </div>
                {lastTrace.map((t,i) => (
                  <div key={i} style={{ marginBottom:8, padding:10, background:colors.bg, borderRadius:10, border:`1px solid ${colors.border}` }}>
                    <span style={{ fontSize:11, fontWeight:700, color:colors.accentLight, marginRight:8 }}>STEP {i+1}: {t.step}</span>
                    <code style={{ fontSize:11, color:colors.textMuted, fontFamily:"monospace" }}>{JSON.stringify(t.data)}</code>
                  </div>
                ))}
              </div>
            )}

            {/* Messages Container */}
            <div style={{ flex:1, overflow:"auto", padding: isMobile ? "16px 12px" : "24px 20px", display:"flex", flexDirection:"column", gap:20 }}>
              {messages.map((msg, idx) => (
                <div key={msg.id||idx} style={{ display:"flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", animation:"fadeIn 0.3s ease" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width:36, height:36, background:colors.accent, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginRight: isMobile ? 8 : 12, flexShrink:0, marginTop:2, boxShadow:`0 4px 8px ${colors.accent}30` }}>
                      <GraduationCapIcon size={18} style={{ color: "white" }} />
                    </div>
                  )}
                  
                  <div style={{ maxWidth: isMobile ? "85%" : "70%", minWidth:80 }}>
                    <div style={{
                      padding:"14px 18px",
                      background: msg.role==="user"?colors.userBubble:colors.botBubble,
                      borderRadius: msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
                      color: msg.role==="user"?"white":colors.text,
                      fontSize:14,
                      lineHeight:1.6,
                      border: msg.role === "assistant" ? `1px solid ${colors.border}` : "none",
                      boxShadow: msg.role === "user" ? "0 4px 12px rgba(37, 99, 235, 0.15)" : "0 4px 8px rgba(0,0,0,0.02)"
                    }}>
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    </div>
                    
                    {msg.metadata?.rules_fired?.length > 0 && (
                      <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
                        {msg.metadata.rules_fired.map(r => (
                          <span key={r} style={{ fontSize:10, padding:"3px 8px", background:colors.tag, color:colors.tagText, borderRadius:20, fontFamily:"monospace", fontWeight:600 }}>{r}</span>
                        ))}
                        {msg.metadata.intent && (
                          <span style={{ fontSize:10, padding:"3px 8px", background:"rgba(16,185,129,0.15)", color:"#10b981", borderRadius:20, fontWeight:600 }}>intent: {msg.metadata.intent}</span>
                        )}
                        {msg.metadata.confidence > 0 && (
                          <span style={{ fontSize:10, padding:"3px 8px", background:"rgba(245,158,11,0.15)", color:"#f59e0b", borderRadius:20, fontWeight:600 }}>conf: {Math.round(msg.metadata.confidence*100)}%</span>
                        )}
                      </div>
                    )}
                    
                    <div style={{ fontSize:10, color:colors.textMuted, marginTop:6, padding:"0 4px" }}>
                      {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                  
                  {msg.role === "user" && (
                    <div style={{ width:36, height:36, background:"#475569", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginLeft: isMobile ? 8 : 12, flexShrink:0, marginTop:2, boxShadow:"0 4px 8px rgba(71, 85, 105, 0.2)" }}>
                      <UserIcon size={18} style={{ color: "white" }} />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ display:"flex", alignItems:"center", gap:12, animation:"fadeIn 0.3s ease" }}>
                  <div style={{ width:36, height:36, background:colors.accent, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 8px ${colors.accent}30` }}>
                    <GraduationCapIcon size={18} style={{ color: "white" }} />
                  </div>
                  <div style={{ padding:"14px 18px", background:colors.botBubble, borderRadius:"18px 18px 18px 4px", border:`1px solid ${colors.border}` }}>
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      {[0,0.2,0.4].map((d,i) => (
                        <div key={i} style={{ width:7, height:7, background:colors.accentLight, borderRadius:"50%", animation:`typingDot 1s ${d}s infinite` }} />
                      ))}
                      {!isMobile && <span style={{ marginLeft:8, fontSize:11, color:colors.textMuted, fontWeight:500 }}>Memproses dengan forward chaining...</span>}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box Area */}
            <div style={{ padding: isMobile ? "12px" : "16px 20px 20px", background:colors.headerBg, borderTop:`1px solid ${colors.border}` }}>
              
              {/* Examples above the input text field */}
              <div className="tabs-container" style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", whiteSpace:"nowrap", WebkitOverflowScrolling: "touch" }}>
                {demos.slice(0,4).map(d => (
                  <button key={d} onClick={()=>handleSimulate(d)} style={{ padding:"5px 12px", background:colors.card, border:`1px solid ${colors.border}`, borderRadius:20, color:colors.textMuted, fontSize:10, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, transition:"all 0.2s", flexShrink: 0 }} onMouseOver={e=>{e.currentTarget.style.borderColor=colors.accentLight;e.currentTarget.style.color=colors.text;}} onMouseOut={e=>{e.currentTarget.style.borderColor=colors.border;e.currentTarget.style.color=colors.textMuted;}}>
                    <SparklesIcon size={9} style={{ color: colors.accentLight }} />
                    <span>{d.substring(0,35)}...</span>
                  </button>
                ))}
              </div>
              
              <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
                <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Tanyakan tentang aturan akademik UNILA..."
                  rows={1} style={{ flex:1, padding:"12px 16px", background:colors.input, border:`1px solid ${colors.inputBorder}`, borderRadius:12, color:colors.text, fontSize:14, resize:"none", outline:"none", lineHeight:1.5, maxHeight:120, fontFamily:"inherit", transition:"border-color 0.2s" }}
                  onFocus={e=>e.target.style.borderColor=colors.accentLight}
                  onBlur={e=>e.target.style.borderColor=colors.inputBorder}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
                
                <button onClick={sendMessage} disabled={!input.trim() || isTyping} style={{ width:44, height:44, background: input.trim()&&!isTyping?colors.accent:colors.border, border:"none", borderRadius:12, color:"white", cursor: input.trim()&&!isTyping?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", boxShadow: input.trim()&&!isTyping?`0 4px 12px ${colors.accent}30`:"none" }}
                  onMouseOver={e=>{ if(input.trim()&&!isTyping) e.currentTarget.style.background=colors.accentLight; }}
                  onMouseOut={e=>{ if(input.trim()&&!isTyping) e.currentTarget.style.background=colors.accent; }}
                >
                  {isTyping ? <div style={{ width:16, height:16, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> : <SendIcon size={16} />}
                </button>
              </div>
              
              <div style={{ textAlign:"center", fontSize:9, color:colors.textMuted, marginTop:10 }}>
                NLP Pipeline: Tokenisasi → Stopword Removal → Stemming → TF-IDF → Forward Chaining
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
