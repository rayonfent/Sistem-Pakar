const Database = {
  users: [
    { id:1, name:"Admin UNILA", email:"admin@unila.ac.id", role:"admin", password:"admin123" },
    { id:2, name:"Mahasiswa Demo", email:"demo@student.unila.ac.id", role:"student", password:"demo123" }
  ],
  chats: [],
  messages: [],
  logs: [],
  nextId: 100,

  createChat(userId) {
    const chat = { id: this.nextId++, user_id: userId, title: "Percakapan baru", created_at: new Date() };
    this.chats.push(chat);
    return chat;
  },

  addMessage(chatId, role, content, metadata={}) {
    const msg = { id: this.nextId++, chat_id: chatId, role, content, metadata, created_at: new Date() };
    this.messages.push(msg);
    return msg;
  },

  addLog(data) {
    this.logs.push({ id: this.nextId++, ...data, created_at: new Date() });
  },

  getMessages(chatId) {
    return this.messages.filter(m => m.chat_id === chatId);
  },

  getUserChats(userId) {
    return this.chats.filter(c => c.user_id === userId);
  }
};

export default Database;
