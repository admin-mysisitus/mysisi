class LivechatAI {
    constructor() {
        this.API_KEYS = [
            "YOUR_GROQ_API_KEY_1",
            "YOUR_GROQ_API_KEY_2",
            "YOUR_GROQ_API_KEY_3"
        ];
        this.URL = "https://api.groq.com/openai/v1/chat/completions";
        this.MODEL = "groq/compound-mini";
        this.ROTATION_LIMIT = 2;
        this.status = { idx: 0, count: 0 };
        this.SYSTEM_PROMPT = `
Kamu adalah pelayan resmi SISITUS (https://sisitus.com/). Jawab ramah, jelas, profesional, dan gunakan bahasa Indonesia yang natural dan tidak kaku (seperti manusia sungguhan).
JANGAN mengarang informasi. Jika tidak tahu: "Maaf, informasi ini belum tersedia. Silakan hubungi kami lewat WA untuk detailnya."
Gunakan tanda baca sewajarnya, jangan berlebihan.
PENTING: Selalu gunakan format HTML (seperti <b>teks tebal</b> dan <br> untuk baris baru). JANGAN pernah menggunakan format markdown seperti **teks tebal** atau *miring*.

TENTANG SISITUS:
Jasa pembuatan website profesional untuk bisnis & UMKM. Cepat, aman, tanpa biaya bulanan. Pengerjaan 5-7 hari. Punya penuh domain & hosting. Dukungan Senin-Sabtu 08.00-20.00 WIB.

PAKET LAYANAN:
1. STARTER - Rp599.000 (Hingga 5 halaman, SEO dasar, domain+hosting 1 tahun, SSL, 2x revisi)
2. GROWER - Rp1.299.000 (Hingga 8 halaman, SEO lengkap, domain+hosting 2 tahun, backup bulanan, 1 bulan dukungan)
3. PIONEER - Rp2.399.000 (Website toko online, produk tak terbatas, fitur pembayaran & pengiriman)

HARGA DOMAIN:
- .com: Rp114.900/tahun
- .id: Rp190.000/tahun
- .co.id: Rp295.000/tahun
- .sch.id / .ponpes.id: Rp59.000/tahun
- .ac.id: Rp65.000/tahun
- .my.id / .web.id: Rp9.900/tahun
- .or.id / .net.id: Rp130.000/tahun
- .biz.id: Rp120.000/tahun
- .go.id: Rp250.000/tahun
- .org: Rp149.900/tahun
- .net: Rp199.900/tahun
JANGAN PERNAH mengarang harga domain yang tidak ada di daftar atas. Jika ditanya domain lain, jawab: "Untuk ekstensi domain lainnya, silakan hubungi kami untuk pengecekan harga."

PEMBAYARAN & PEMESANAN:
JANGAN PERNAH memberikan nomor rekening, link pembayaran, atau membuat tagihan invoice palsu. Jika pelanggan ingin memesan atau membayar, arahkan mereka untuk menghubungi WhatsApp atau Email.
WA: +62 812-1528-9095 | Email: hello@sisitus.com
`;
    }

    getKey() {
        this.status.count++;
        if (this.status.count > this.ROTATION_LIMIT) {
            this.status.idx = (this.status.idx + 1) % this.API_KEYS.length;
            this.status.count = 1;
        }
        return this.API_KEYS[this.status.idx];
    }

    async generateReply(chatHistory, isAutoPilot = false) {
        const messages = [
            { role: "system", content: this.SYSTEM_PROMPT }
        ];

        const recentHistory = chatHistory.slice(-15);
        
        let collapsedHistory = [];
        for (let msg of recentHistory) {
            if (collapsedHistory.length > 0 && collapsedHistory[collapsedHistory.length - 1].role === msg.role) {
                collapsedHistory[collapsedHistory.length - 1].content += "\n" + msg.content;
            } else {
                collapsedHistory.push({ role: msg.role, content: msg.content });
            }
        }
        
        // Groq API WAJIB menjadikan 'user' sebagai pesan terakhir
        if (collapsedHistory.length === 0) {
            collapsedHistory.push({ role: "user", content: "Halo." });
        } else if (collapsedHistory[collapsedHistory.length - 1].role !== "user") {
            collapsedHistory.push({ role: "user", content: "(Admin baru saja membalas, buatlah draf lanjutan jika diperlukan)" });
        }
        
        messages.push(...collapsedHistory);

        for (let i = 0; i < this.API_KEYS.length; i++) {
            try {
                const res = await fetch(this.URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + this.getKey()
                    },
                    body: JSON.stringify({
                        model: this.MODEL,
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: 1024
                    })
                });

                const data = await res.json();
                if (!res.ok) {
                   console.error("Groq API Error Response:", data);
                }
                if (res.ok && data.choices?.[0]?.message?.content) {
                    return data.choices[0].message.content;
                }
                
                this.status.idx = (this.status.idx + 1) % this.API_KEYS.length;
                this.status.count = 0;
            } catch (e) {
                console.error("AI Error:", e);
                this.status.idx = (this.status.idx + 1) % this.API_KEYS.length;
                this.status.count = 0;
            }
        }
        
        return isAutoPilot ? "" : "Maaf, AI sedang kewalahan. Silakan balas secara manual.";
    }
}

window.livechatAI = new LivechatAI();
