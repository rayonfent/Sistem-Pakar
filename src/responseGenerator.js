const ResponseGenerator = {
  fillTemplate(template, facts, result) {
    let text = template;
    const allData = { ...facts, ...result };
    for (const [k,v] of Object.entries(allData)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
    return text;
  },

  generateResponse(inferResult, userInput) {
    const { intent, confidence, facts, fired, trace } = inferResult;

    if (fired.length === 0) {
      return {
        text: `Maaf, saya tidak menemukan aturan akademik yang spesifik untuk pertanyaan Anda. Namun, saya dapat membantu Anda dengan topik-topik berikut:\n\n• **SKS dan IPK** – berapa SKS bisa diambil\n• **Kehadiran / UTS / UAS** – syarat mengikuti ujian\n• **Skripsi** – syarat pengajuan skripsi\n• **KKN / PKL** – syarat dan prosedur\n• **Yudisium / Wisuda** – syarat kelulusan\n• **Cuti Akademik** – prosedur dan aturan\n• **Drop Out** – batas studi dan peringatan\n• **Semester Pendek** – syarat dan informasi\n\nSilakan tanyakan dengan menyertakan informasi seperti IPK, semester, atau jumlah SKS Anda untuk jawaban yang lebih akurat.`,
        sources: [],
        trace,
        confidence: 0,
        intent: null
      };
    }

    // Filter rules with low relevance score (< 0.5) to avoid irrelevant rules
    const relevantFired = fired.filter(f => f.relevanceScore >= 0.5);
    
    // If no relevant rules after filtering, use top 3 regardless
    const finalFired = relevantFired.length > 0 ? relevantFired : fired.slice(0, 3);

    const mainRule = finalFired[0].rule;
    const mainResponse = this.fillTemplate(mainRule.template, facts, mainRule.result);

    let fullResponse = mainResponse + "\n\n";

    // Add additional rules context (only highly relevant ones)
    if (finalFired.length > 1) {
      fullResponse += "**Informasi tambahan yang relevan:**\n\n";
      for (const f of finalFired.slice(1, 4)) {
        fullResponse += "• " + this.fillTemplate(f.rule.template, facts, f.rule.result) + "\n\n";
      }
    }

    // Add fact summary if facts extracted
    if (Object.keys(facts).length > 0) {
      fullResponse += "**Ringkasan data Anda yang terdeteksi:**\n";
      for (const [k,v] of Object.entries(facts)) {
        const labels = { ipk:"IPK", semester:"Semester", sks_lulus:"SKS Lulus", presensi:"Kehadiran", administrasi:"Administrasi", kkn:"KKN", skripsi:"Skripsi", pkl:"PKL", yudisium:"Yudisium" };
        if (labels[k]) fullResponse += `• ${labels[k]}: **${v}**\n`;
      }
      fullResponse += "\n";
    }

    const sources = [...new Set(finalFired.map(f => f.rule.source))];
    fullResponse += `📚 *Sumber: ${sources.slice(0,2).join(" | ")}*`;

    return {
      text: fullResponse,
      sources,
      trace,
      confidence,
      intent,
      rules_fired: finalFired.map(f => f.rule.rule_id)
    };
  }
};

export default ResponseGenerator;
