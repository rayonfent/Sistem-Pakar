import { useState, useEffect, useRef } from 'react';
import KNOWLEDGE_BASE from '../knowledgeBase';
import InferenceEngine from '../inferenceEngine';
import ResponseGenerator from '../responseGenerator';
import Database from '../database';

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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(Database.getMessages(chat.id));
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
    bg: darkMode ? "#0d1117" : "#f8fafc",
    sidebar: darkMode ? "#161b22" : "#f1f5f9",
    card: darkMode ? "#21262d" : "#ffffff",
    border: darkMode ? "#30363d" : "#e2e8f0",
    text: darkMode ? "#e6edf3" : "#1e293b",
    textMuted: darkMode ? "#8b949e" : "#64748b",
    accent: "#0f766e",
    accentLight: darkMode ? "#0d9488" : "#14b8a6",
    userBubble: "#2563eb",
    botBubble: darkMode ? "#21262d" : "#f1f5f9",
    input: darkMode ? "#0d1117" : "#ffffff",
    inputBorder: darkMode ? "#30363d" : "#cbd5e1",
    headerBg: darkMode ? "#161b22" : "#ffffff",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    tag: darkMode ? "#1d4ed820" : "#dbeafe",
    tagText: darkMode ? "#60a5fa" : "#1d4ed8",
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

  // ============ LOGIN SCREEN ============
  if (view === "login") return (
    <div style={{ minHeight:"100vh", backgroundImage:"url(/darkbg.png)", backgroundSize:"cover", backgroundPosition:"center", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Poppins', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes glow{0%,100%{box-shadow:0 0 20px #0f766e55}50%{box-shadow:0 0 40px #0f766e99}} * { box-sizing: border-box; }`}</style>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(120deg, rgba(2,6,23,0.72), rgba(15,118,110,0.35))" }} />
      <div style={{ width:420, padding:40, background:"rgba(10,15,20,0.82)", borderRadius:20, border:"1px solid #2c3e46", backdropFilter:"blur(14px)", animation:"glow 3s ease-in-out infinite", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo.png" alt="UNILA logo" style={{ width:72, height:72, objectFit:"contain", animation:"float 3s ease-in-out infinite" }} />
          <h1 style={{ color:"#e6edf3", fontSize:22, fontWeight:700, margin:"12px 0 4px" }}>UNILA Academic Expert</h1>
          <p style={{ color:"#8b949e", fontSize:13, margin:0 }}>Chatbot Sistem Pakar Akademik UNILA</p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:"#8b949e", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>EMAIL</label>
          <input value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="email@unila.ac.id" type="email"
            style={{ width:"100%", padding:"12px 16px", background:"#0d1117", border:"1px solid #30363d", borderRadius:10, color:"#e6edf3", fontSize:14, outline:"none" }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={{ color:"#8b949e", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>PASSWORD</label>
          <input value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="••••••••" type="password"
            style={{ width:"100%", padding:"12px 16px", background:"#0d1117", border:"1px solid #30363d", borderRadius:10, color:"#e6edf3", fontSize:14, outline:"none" }} />
        </div>
        {loginError && <p style={{ color:"#ef4444", fontSize:12, margin:"8px 0" }}>{loginError}</p>}
        <button onClick={handleLogin} style={{ width:"100%", padding:"13px", background:"#2563eb", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", marginTop:16, transition:"all 0.2s" }}
          onMouseOver={e=>e.target.style.background="#1d4ed8"} onMouseOut={e=>e.target.style.background="#2563eb"}>
          Masuk →
        </button>
        <div style={{ marginTop:24, padding:16, background:"#0d1117", borderRadius:10, border:"1px solid #21262d" }}>
          <p style={{ color:"#8b949e", fontSize:11, margin:"0 0 8px", fontWeight:600 }}>DEMO AKUN:</p>
          <div style={{ display:"grid", gap:6 }}>
            {[["👨‍💼 Admin","admin@unila.ac.id","admin123"],["👨‍🎓 Mahasiswa","demo@student.unila.ac.id","demo123"]].map(([label,email,pass])=>(
              <button key={email} onClick={()=>setLoginForm({email,password:pass})}
                style={{ padding:"8px 12px", background:"#161b22", border:"1px solid #30363d", borderRadius:8, color:"#8b949e", fontSize:11, cursor:"pointer", textAlign:"left" }}>
                {label}: <span style={{color:"#60a5fa"}}>{email}</span> / <span style={{color:"#60a5fa"}}>{pass}</span>
              </button>
            ))}
          </div>
        </div>
        <p style={{ color:"#8b949e", fontSize:11, textAlign:"center", marginTop:16 }}>Rule-Based Expert System | Forward Chaining | NLP Bahasa Indonesia</p>
      </div>
    </div>
  );

  // ============ ADMIN PANEL ============
  if (view === "admin") return (
    <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#161b22} ::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px} table{border-collapse:collapse;width:100%} th,td{padding:10px 12px;border-bottom:1px solid #21262d;text-align:left;font-size:13px} th{background:#161b22;color:#8b949e;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px} tr:hover td{background:#161b2240}`}</style>
      {/* Admin Header */}
      <div style={{ background:"#161b22", borderBottom:"1px solid #21262d", padding:"0 24px", display:"flex", alignItems:"center", height:56, gap:16 }}>
        <span style={{ fontSize:20 }}>🎓</span>
        <div>
          <span style={{ fontWeight:700, color:"#e6edf3", fontSize:14 }}>UNILA Admin Panel</span>
          <span style={{ color:"#8b949e", fontSize:12, marginLeft:8 }}>Expert System Dashboard</span>
        </div>
        <div style={{ flex:1 }} />
        <button onClick={()=>{setView("chat");if(!activeChat)startNewChat();}} style={{ padding:"7px 16px", background:"#21262d", border:"1px solid #30363d", borderRadius:8, color:"#e6edf3", fontSize:12, cursor:"pointer" }}>💬 Ke Chat</button>
        <button onClick={()=>{setUser(null);setView("login");}} style={{ padding:"7px 16px", background:"transparent", border:"1px solid #ef4444", borderRadius:8, color:"#ef4444", fontSize:12, cursor:"pointer" }}>Logout</button>
      </div>

      {/* Stats Bar */}
      <div style={{ padding:"16px 24px", display:"flex", gap:12, background:"#0d1117" }}>
        {[
          ["📋", "Total Rules", KNOWLEDGE_BASE.rules.length, "#2563eb"],
          ["🎯", "Intent Categories", KNOWLEDGE_BASE.intents.length, "#22c55e"],
          ["💬", "Total Pesan", Database.messages.length, "#f59e0b"],
          ["📊", "Inference Logs", Database.logs.length, "#a855f7"],
          ["👥", "Users", Database.users.length, "#06b6d4"],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ flex:1, background:"#161b22", border:"1px solid #21262d", borderRadius:12, padding:"14px 16px", borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:"#8b949e" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Admin Tabs */}
      <div style={{ display:"flex", gap:2, padding:"0 24px", background:"#0d1117", borderBottom:"1px solid #21262d" }}>
        {[["rules","📋 Knowledge Base"],["intents","🎯 Intents"],["logs","📊 Inference Logs"],["upload","📄 Upload PDF"],["users","👥 Users"]].map(([t,l])=>(
          <button key={t} onClick={()=>setAdminTab(t)} style={{ padding:"10px 16px", background:"transparent", border:"none", borderBottom: adminTab===t?"2px solid #2563eb":"2px solid transparent", color: adminTab===t?"#e6edf3":"#8b949e", fontSize:13, cursor:"pointer", fontWeight: adminTab===t?600:400 }}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"auto", padding:24 }}>
        {/* RULES TAB */}
        {adminTab === "rules" && (
          <div>
            <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center" }}>
              <input value={searchRule} onChange={e=>setSearchRule(e.target.value)} placeholder="Cari rule (ID, kategori, konten)..." style={{ flex:1, padding:"9px 14px", background:"#161b22", border:"1px solid #30363d", borderRadius:8, color:"#e6edf3", fontSize:13, outline:"none" }} />
              <span style={{ color:"#8b949e", fontSize:12 }}>{filteredRules.length} rules</span>
            </div>
            <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
              <table>
                <thead><tr><th>Rule ID</th><th>Kategori</th><th>Prioritas</th><th>Kondisi</th><th>Response Template</th><th>Sumber</th></tr></thead>
                <tbody>
                  {filteredRules.map(r => (
                    <tr key={r.rule_id}>
                      <td><span style={{ fontFamily:"monospace", color:"#60a5fa", background:"#1d4ed820", padding:"2px 8px", borderRadius:4, fontSize:12 }}>{r.rule_id}</span></td>
                      <td><span style={{ background:"#21262d", padding:"2px 8px", borderRadius:4, fontSize:11, color:"#8b949e" }}>{r.category}</span></td>
                      <td><span style={{ color: r.priority===1?"#22c55e":r.priority===2?"#f59e0b":"#8b949e", fontWeight:600 }}>P{r.priority}</span></td>
                      <td style={{ fontSize:11, color:"#8b949e", maxWidth:160 }}>{r.conditions.length===0?"(selalu berlaku)":r.conditions.map(c=>`${c.field} ${c.op} ${c.val}`).join(", ")}</td>
                      <td style={{ fontSize:11, color:"#e6edf3", maxWidth:280 }}><div style={{ maxHeight:48, overflow:"hidden", textOverflow:"ellipsis" }}>{r.template.substring(0,100)}...</div></td>
                      <td style={{ fontSize:11, color:"#8b949e" }}>{r.source?.split(" ").slice(-2).join(" ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INTENTS TAB */}
        {adminTab === "intents" && (
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <table>
              <thead><tr><th>Intent ID</th><th>Kategori</th><th>Pattern Keywords</th><th>Facts Needed</th></tr></thead>
              <tbody>
                {KNOWLEDGE_BASE.intents.map(i => (
                  <tr key={i.id}>
                    <td><code style={{ color:"#60a5fa", fontSize:12 }}>{i.id}</code></td>
                    <td><span style={{ background:"#21262d", padding:"2px 8px", borderRadius:4, fontSize:11, color:"#f59e0b" }}>{i.category}</span></td>
                    <td style={{ fontSize:11 }}>{i.patterns.slice(0,4).join(", ")}{i.patterns.length>4&&` +${i.patterns.length-4} lagi`}</td>
                    <td style={{ fontSize:11 }}>{i.facts_needed.length>0?i.facts_needed.join(", "):<span style={{color:"#8b949e"}}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS TAB */}
        {adminTab === "logs" && (
          <div>
            {Database.logs.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#8b949e" }}>Belum ada inference log. Mulai chat untuk menghasilkan log.</div>
            ) : (
              <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
                <table>
                  <thead><tr><th>#</th><th>Input User</th><th>Intent</th><th>Confidence</th><th>Facts</th><th>Rules Fired</th><th>Waktu</th></tr></thead>
                  <tbody>
                    {[...Database.logs].reverse().map((log,i) => (
                      <tr key={log.id}>
                        <td style={{color:"#8b949e",fontSize:11}}>{log.id}</td>
                        <td style={{fontSize:12,maxWidth:200}}>{log.input?.substring(0,60)}</td>
                        <td><code style={{color:"#60a5fa",fontSize:11}}>{log.intent||"—"}</code></td>
                        <td><span style={{color: log.confidence>0.5?"#22c55e":log.confidence>0.2?"#f59e0b":"#ef4444", fontWeight:600, fontSize:12}}>{Math.round((log.confidence||0)*100)}%</span></td>
                        <td style={{fontSize:11,color:"#8b949e"}}>{Object.entries(log.facts||{}).map(([k,v])=>`${k}:${v}`).join(", ")||"—"}</td>
                        <td style={{fontSize:11}}>{(log.rules_fired||[]).join(", ")||"—"}</td>
                        <td style={{fontSize:11,color:"#8b949e"}}>{new Date(log.created_at).toLocaleTimeString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD TAB */}
        {adminTab === "upload" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:"#161b22", border:"2px dashed #30363d", borderRadius:16, padding:40, textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
              <p style={{ color:"#e6edf3", fontWeight:600, marginBottom:8 }}>Upload PDF Panduan Akademik</p>
              <p style={{ color:"#8b949e", fontSize:13, marginBottom:20 }}>Upload PDF untuk ekstraksi teks dan parsing aturan akademik otomatis</p>
              <input type="file" accept=".pdf" onChange={()=>{ setUploadMsg("✅ File berhasil diterima. Ekstraksi teks dimulai dengan pdfplumber... (Simulasi: dalam sistem production, teks akan diekstrak per halaman dan disimpan ke database.)"); setTimeout(()=>setUploadMsg("🔄 Parsing halaman 1/45... Ditemukan 23 aturan baru. Menyimpan ke knowledge base..."),1500); setTimeout(()=>setUploadMsg("✅ Proses selesai! 23 aturan baru berhasil ditambahkan ke knowledge base."),4000); }}
                style={{ display:"none" }} id="pdf-upload" />
              <label htmlFor="pdf-upload" style={{ display:"inline-block", padding:"12px 28px", background:"#2563eb", color:"white", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>Pilih File PDF</label>
            </div>
            {uploadMsg && <div style={{ padding:16, background:"#161b22", border:"1px solid #30363d", borderRadius:12, color:"#22c55e", fontSize:13 }}>{uploadMsg}</div>}
            <div style={{ marginTop:20, padding:20, background:"#161b22", border:"1px solid #21262d", borderRadius:12 }}>
              <h4 style={{ color:"#e6edf3", margin:"0 0 12px", fontSize:14 }}>📋 Pipeline PDF Processing</h4>
              {["1. Upload PDF → Simpan ke /knowledge_base/raw_pdf/","2. pdfplumber → Ekstrak teks per halaman","3. Cleaning → Hapus karakter aneh, normalisasi teks","4. Parsing → Identifikasi pasal, ayat, dan aturan","5. Rule Extraction → Konversi ke format JSON rule","6. Database Insert → Simpan ke tabel rules & sources","7. Vectorization → Update TF-IDF vector space"].map(s=>(
                <div key={s} style={{ fontSize:12, color:"#8b949e", padding:"4px 0", borderBottom:"1px solid #21262d80" }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {adminTab === "users" && (
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {Database.users.map(u=>(
                  <tr key={u.id}>
                    <td style={{color:"#8b949e"}}>{u.id}</td>
                    <td style={{fontWeight:500}}>{u.name}</td>
                    <td style={{color:"#60a5fa",fontSize:13}}>{u.email}</td>
                    <td><span style={{ background: u.role==="admin"?"#7c3aed20":"#0d9488​20", color: u.role==="admin"?"#a78bfa":"#2dd4bf", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{u.role}</span></td>
                    <td><span style={{ color:"#22c55e", fontSize:12 }}>● Aktif</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ============ CHAT VIEW ============
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Poppins', 'Segoe UI',system-ui,sans-serif", color:colors.text, position:"relative" }}>
      <style>{`* {box-sizing:border-box;} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:${colors.border};border-radius:3px} @keyframes typingDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ position:"absolute", inset:0, background: darkMode ? "rgba(2,8,15,0.64)" : "rgba(248,250,252,0.72)", backdropFilter:"blur(1.5px)" }} />
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100%" }}>

      {/* Header */}
      <div style={{ height:56, background:colors.headerBg, borderBottom:`1px solid ${colors.border}`, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:"none", border:"none", color:colors.textMuted, cursor:"pointer", fontSize:18, padding:4 }}>☰</button>
        <div style={{ width:36, height:36, background: darkMode ? "#0f172acc" : "#ffffffcc", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", border:`1px solid ${colors.border}` }}>
          <img src="/logo.png" alt="UNILA logo" style={{ width:24, height:24, objectFit:"contain" }} />
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:colors.text }}>UNILA Academic Expert</div>
          <div style={{ fontSize:11, color:colors.textMuted }}>Rule-Based Expert System • Forward Chaining</div>
        </div>
        <div style={{ flex:1 }} />
        {lastTrace && (
          <button onClick={()=>setShowTrace(p=>!p)} style={{ padding:"5px 12px", background: showTrace?"#2563eb":"transparent", border:`1px solid ${showTrace?"#2563eb":colors.border}`, borderRadius:7, color: showTrace?"white":colors.textMuted, fontSize:11, cursor:"pointer" }}>
            🔍 {showTrace?"Sembunyikan":"Lihat"} Trace
          </button>
        )}
        <button onClick={()=>setDarkMode(p=>!p)} style={{ background:"none", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, cursor:"pointer", fontSize:13, padding:"5px 10px" }}>{darkMode?"☀️":"🌙"}</button>
        {user?.role === "admin" && <button onClick={()=>setView("admin")} style={{ padding:"5px 12px", background:"#7c3aed20", border:"1px solid #7c3aed", borderRadius:7, color:"#a78bfa", fontSize:11, cursor:"pointer" }}>⚙️ Admin</button>}
        <button onClick={()=>{setUser(null);setView("login");}} style={{ padding:"5px 12px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, fontSize:11, cursor:"pointer" }}>Logout</button>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width:260, background:colors.sidebar, borderRight:`1px solid ${colors.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ padding:12 }}>
              <button onClick={()=>startNewChat()} style={{ width:"100%", padding:"10px 14px", background:colors.accent, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                <span>+</span> Percakapan Baru
              </button>
            </div>
            <div style={{ flex:1, overflow:"auto", padding:"0 8px 8px" }}>
              <div style={{ fontSize:10, color:colors.textMuted, fontWeight:600, letterSpacing:1, padding:"8px 8px 4px", textTransform:"uppercase" }}>Riwayat</div>
              {chats.map(chat => (
                <button key={chat.id} onClick={()=>selectChat(chat)} style={{ width:"100%", textAlign:"left", padding:"10px 12px", background: activeChat?.id===chat.id?colors.card:"transparent", border: activeChat?.id===chat.id?`1px solid ${colors.border}`:"1px solid transparent", borderRadius:8, color:colors.text, cursor:"pointer", fontSize:12, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  💬 {chat.title}
                </button>
              ))}
            </div>
            {/* Demo shortcuts */}
            <div style={{ padding:12, borderTop:`1px solid ${colors.border}` }}>
              <div style={{ fontSize:10, color:colors.textMuted, fontWeight:600, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Contoh Pertanyaan</div>
              {demos.slice(0,4).map(d => (
                <button key={d} onClick={()=>handleSimulate(d)} style={{ width:"100%", textAlign:"left", padding:"6px 10px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, cursor:"pointer", fontSize:10, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  ✨ {d.substring(0,42)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", backgroundImage:`url(${darkMode ? "/darkbg.png" : "/lightbg.png"})`, backgroundSize:"35%", backgroundRepeat:"no-repeat", backgroundPosition:"center" }}>
          {/* Trace Panel */}
          {showTrace && lastTrace && (
            <div style={{ background:darkMode?"#0d1117":"#f8fafc", border:`1px solid ${colors.border}`, borderRadius:0, padding:12, borderBottom:`1px solid ${colors.border}`, maxHeight:160, overflow:"auto" }}>
              <div style={{ fontSize:11, fontWeight:700, color:colors.textMuted, marginBottom:8 }}>🔍 INFERENCE TRACE (Forward Chaining)</div>
              {lastTrace.map((t,i) => (
                <div key={i} style={{ marginBottom:8, padding:8, background:colors.card, borderRadius:8, border:`1px solid ${colors.border}` }}>
                  <span style={{ fontSize:10, fontWeight:700, color:colors.accent, marginRight:8 }}>STEP {i+1}: {t.step}</span>
                  <code style={{ fontSize:10, color:colors.textMuted }}>{JSON.stringify(t.data, null, 1).substring(0,200)}</code>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflow:"auto", padding:"20px 16px" }}>
            {messages.map((msg, idx) => (
              <div key={msg.id||idx} style={{ marginBottom:20, display:"flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", animation:"fadeIn 0.3s ease" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginRight:10, flexShrink:0, marginTop:2 }}>🎓</div>
                )}
                <div style={{ maxWidth:"72%", minWidth:60 }}>
                  <div style={{ padding:"14px 18px", background: msg.role==="user"?colors.userBubble:colors.botBubble, borderRadius: msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", color: msg.role==="user"?"white":colors.text, fontSize:14, lineHeight:1.65, border: msg.role==="assistant"?`1px solid ${colors.border}`:"none", boxShadow: msg.role==="user"?"0 2px 12px #2563eb40":"0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  </div>
                  {msg.metadata?.rules_fired?.length > 0 && (
                    <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap" }}>
                      {msg.metadata.rules_fired.map(r => (
                        <span key={r} style={{ fontSize:10, padding:"2px 7px", background:colors.tag, color:colors.tagText, borderRadius:20, fontFamily:"monospace" }}>{r}</span>
                      ))}
                      {msg.metadata.intent && (
                        <span style={{ fontSize:10, padding:"2px 7px", background:"#22c55e20", color:"#22c55e", borderRadius:20 }}>intent: {msg.metadata.intent}</span>
                      )}
                      {msg.metadata.confidence > 0 && (
                        <span style={{ fontSize:10, padding:"2px 7px", background:"#f59e0b20", color:"#f59e0b", borderRadius:20 }}>conf: {Math.round(msg.metadata.confidence*100)}%</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize:10, color:colors.textMuted, marginTop:4, padding:"0 4px" }}>
                    {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div style={{ width:32, height:32, background:"#475569", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginLeft:10, flexShrink:0, marginTop:2 }}>👤</div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, animation:"fadeIn 0.3s ease" }}>
                <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎓</div>
                <div style={{ padding:"14px 18px", background:colors.botBubble, borderRadius:"18px 18px 18px 4px", border:`1px solid ${colors.border}` }}>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {[0,0.2,0.4].map((d,i) => (
                      <div key={i} style={{ width:7, height:7, background:colors.accent, borderRadius:"50%", animation:`typingDot 1s ${d}s infinite` }} />
                    ))}
                    <span style={{ marginLeft:8, fontSize:11, color:colors.textMuted }}>Memproses dengan forward chaining...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding:"12px 16px 16px", background:colors.headerBg, borderTop:`1px solid ${colors.border}` }}>
            {/* Quick demos */}
            <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
              {demos.slice(0,4).map(d => (
                <button key={d} onClick={()=>handleSimulate(d)} style={{ padding:"4px 10px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:20, color:colors.textMuted, fontSize:10, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {d.substring(0,35)}...
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Tanyakan tentang aturan akademik UNILA... (contoh: IPK 3.0, semester 4, berapa SKS?)"
                rows={1} style={{ flex:1, padding:"12px 16px", background:colors.input, border:`1px solid ${colors.inputBorder}`, borderRadius:12, color:colors.text, fontSize:14, resize:"none", outline:"none", lineHeight:1.5, maxHeight:120, fontFamily:"inherit" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
              <button onClick={sendMessage} disabled={!input.trim() || isTyping} style={{ width:44, height:44, background: input.trim()&&!isTyping?"#2563eb":"#30363d", border:"none", borderRadius:11, color:"white", cursor: input.trim()&&!isTyping?"pointer":"default", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                {isTyping ? <div style={{ width:16, height:16, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> : "↑"}
              </button>
            </div>
            <div style={{ textAlign:"center", fontSize:10, color:colors.textMuted, marginTop:8 }}>
              NLP Pipeline: Tokenisasi → Stopword Removal → Stemming → TF-IDF → Cosine Similarity → Forward Chaining
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

