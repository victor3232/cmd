/*
  © Created by : Tn Ajie Inc (Developer)
      Thanks yang tidak hapus WM :)

  WARNING..!!
- DI LARANG MEMBAGIKAN SC SECARA GRATIS
- DI LARANG MENJUAL DENGAN HARGA 271T

© Copyright 2021 - 2025 Nexus Inc
*/

const { Telegraf, Markup } = require("telegraf");
const { Client } = require("ssh2");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const config = require("./config");
const userFile = path.join(__dirname, "src", "database", "users.json");

// [BARU] Tambahkan crypto dan qrcode
const crypto = require("crypto");
const QRCode = require("qrcode");

const OWNER_ID = config.OWNER_ID;
const BOT_TOKEN = config.BOT_TOKEN;
const domain = config.domain;
const urladmin = config.urladmin;
const urlchannel = config.urlchannel;
const plta = config.plta;
const pltc = config.pltc;
const egg = config.egg;
const loc = config.loc;

// [DIMODIFIKASI] Hapus atlantic, tambahkan Duitku
const {
  apiAtlantic,
  typeewallet,
  nopencairan,
  atasnamaewallet,
  DUITKU_MERCHANT_CODE, // [BARU]
  DUITKU_API_KEY, // [BARU]
} = require("./config");
const axios = require("axios");
const qs = require("qs");

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN kosong di config.js");
  process.exit(1);
}
const bot = new Telegraf(BOT_TOKEN);

// util: simple sleep
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Pastikan directory & file ada
function ensureUserFile() {
  const dir = path.dirname(userFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(userFile)) fs.writeFileSync(userFile, "[]", "utf8");
}

function readUsers() {
  try {
    ensureUserFile();
    const raw = fs.readFileSync(userFile, "utf8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return Array.from(new Set(arr.map(Number))).filter(Boolean); // unik & numeric
  } catch (e) {
    console.error("readUsers error:", e);
    return [];
  }
}

function saveUsers(users) {
  try {
    ensureUserFile();
    const normalized = Array.from(new Set(users.map(Number))).filter(Boolean);
    fs.writeFileSync(userFile, JSON.stringify(normalized, null, 2), "utf8");
  } catch (e) {
    console.error("saveUsers error:", e);
  }
}

function addUser(id) {
  try {
    const users = readUsers();
    const nid = Number(id);
    if (!users.includes(nid)) {
      users.push(nid);
      saveUsers(users);
    }
  } catch (e) {
    console.error("addUser error:", e);
  }
}

function removeUser(id) {
  try {
    const users = readUsers();
    const nid = Number(id);
    const filtered = users.filter(u => u !== nid);
    saveUsers(filtered);
  } catch (e) {
    console.error("removeUser error:", e);
  }
}


//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Function Timezone WIB 
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

function formatDate() {
  const now = new Date();

  const options = {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  };

  // hasil format misalnya: 26/09/2025, 08.30.45
  const parts = new Intl.DateTimeFormat("id-ID", options).formatToParts(now);

  const year = parts.find(p => p.type === "year").value;
  const month = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;
  const hour = parts.find(p => p.type === "hour").value;
  const minute = parts.find(p => p.type === "minute").value;
  const second = parts.find(p => p.type === "second").value;

  return `${year}-${month}-${day} ${hour}:${minute}:${second} WIB`;
}

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Menu Start
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.start(async (ctx) => {
  try {
    // tambahkan user id ke src/database/users.json
    addUser(ctx.from.id);
  } catch (e) {
    console.error("Error adding user on start:", e);
  }

  const me = ctx.from;
  const caption = `
Halo *${me.first_name || ""}* Aku adalah Bot Auto Order, siap membantu anda untuk membuat Akun dan Server *Panel Pterodactyl*.

┌ 🤖 *AUTO ORDER PANEL*
└─ *Pterodactyl Server*

*📊 Nikmati Panel Kualitas Tinggi Namun Harga Tetap Bersahabat*

--- [ Benefit Membeli Panel ] ---
*♻️ Garansi 20 Hari*
*🔒 Anti Colong & Rusuh*
*📉 Server Stabil*

Pilih *📦 Order Panel* Untuk Beli
Pilih *🛍️ Order Admin Panel* Untuk Beli.
`; // <-- String Selesai di sini

  const keyboard = Markup.keyboard([
    ["📦 Order Panel"],
    ["🛍️ Order Admin Panel"],
    ["📞 Hubungi Customer Service"]
  ]).resize();

  const startImage = path.join(__dirname, "src", "media", "start.jpg");
  await ctx.replyWithPhoto(
    { source: startImage },
    { caption, parse_mode: "Markdown", ...keyboard }
  );
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Help Command (/help)
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("help", async (ctx) => {
  const helpText = `
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
          ⚙️ *DAFTAR FITUR BOT* ⚙️
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯

📦 *FITUR UTAMA UNTUK USER*
───────────────────────
• /start — Menampilkan menu utama bot
• /buypanel <username> — Membuat invoice & membeli panel

💰 *FITUR PEMBAYARAN (OWNER)*
───────────────────────
• /saldo — Mengecek saldo Atlantic
• /cairkan — Mencairkan saldo Atlantic ke e-wallet

🧰 *FITUR PANEL (OWNER)*
───────────────────────
• /createpanel <username> — Membuat panel manual
• /installpanel ipvps|pwvps|panel.com|node.com|ram — Instalasi otomatis Panel & Wings di VPS

🧹 *FITUR ADMIN PANEL (OWNER)*
───────────────────────
• /delallusr — Mengecek user tanpa server
• /confirmdelusr — Konfirmasi Menghapus semua user tanpa server

📢 *FITUR BROADCAST (OWNER)*
───────────────────────
• /broadcast <pesan> — Kirim pesan ke semua pengguna bot

───────────────────────
📞 *Customer Service*
Hubungi admin: [Klik di sini](${urladmin})
───────────────────────

🕒 *Terakhir diperbarui:* ${formatDate()}
`;
  await ctx.replyWithMarkdown(helpText);
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Buy Panel Pterodactyl 
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("buypanel", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1);
  const username = text[0];
  if (!username) return ctx.reply(`
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
           📦𝗢𝗥𝗗𝗘𝗥 𝗣𝗔𝗡𝗘𝗟📦
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯
✎ 𝗖𝗮𝗿𝗮 𝗠𝗲𝗺𝗯𝘂𝗮𝘁 :
/buypanel <username>

✎ 𝗖𝗼𝗻𝘁𝗼𝗵 :
/buypanel picung`);

  if (await isUsernameTaken(username)) {
    return ctx.reply(`⚠️ Username "${username}" sudah dipakai. Silakan pilih username lain.`);
  }

  const products = readProducts();
  if (!products.length) return ctx.reply("Belum ada produk.");

  const normalProducts = products.filter(p => p.id !== "unlimited");
  const rows = [];
  for (let i = 0; i < normalProducts.length; i += 2) {
    const left = normalProducts[i];
    const right = normalProducts[i + 1];
    const row = [];
    row.push(Markup.button.callback(`${left.name} • Rp${left.price}`, `ORDER|${left.id}|${username}`));
    if (right) row.push(Markup.button.callback(`${right.name} • Rp${right.price}`, `ORDER|${right.id}|${username}`));
    rows.push(row);
  }

  const unlimited = products.find(p => p.id === "unlimited");
  if (unlimited) {
    rows.push([
      Markup.button.callback(`${unlimited.name} • Rp${unlimited.price}`, `ORDER|${unlimited.id}|${username}`)
    ]);
  }

  await ctx.reply(`
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
         🚀𝗣𝗥𝗜𝗩𝗔𝗧𝗘 𝗦𝗘𝗥𝗩𝗘𝗥🚀
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯
╭──❏「 𝗣𝗮𝗻𝗲𝗹 𝗣𝘁𝗲𝗿𝗼𝗱𝗮𝗰𝘁𝘆𝗹 」❏
┃
┃➥  𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲 : ${username}
┃➥  𝗥𝗔𝗠 : ?
┃
┗━━━━━[ 𝗔𝘂𝘁𝗼 𝗢𝗿𝗱𝗲𝗿 𝗕𝗢𝗧 ]━━━━

Silahkan pilih paket yang di inginkan.

⚠️ 𝗞𝗟𝗜𝗞 𝟭 𝗞𝗔𝗟𝗜 𝗗𝗔𝗡 𝗧𝗨𝗡𝗚𝗚𝗨`, Markup.inlineKeyboard(rows));
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Callback handler (Order, Cancel)
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.on("callback_query", async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    if (!data) return ctx.answerCbQuery();

    const [cmd, arg1, arg2] = data.split("|");
    const orders = readOrders();

    // [START] LOGIKA PEMBAYARAN DUITKU
    if (cmd === "ORDER") {
      const username = arg2;
      const products = readProducts();
      const product = products.find(p => p.id === arg1);
      if (!product) return ctx.answerCbQuery("Produk tidak ditemukan.", { show_alert: true });

      const reff = `PANEL-${Date.now()}`; // Ini akan jadi merchantOrderId
      const amount = product.price;

      // 1. Buat signature Duitku
      const rawSignature = config.DUITKU_MERCHANT_CODE + reff + amount + config.DUITKU_API_KEY;
      const signature = crypto.createHash("md5").update(rawSignature).digest("hex");

      let paymentResp;
      try {
        // 2. Request Inquiry ke Duitku
        paymentResp = await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
          merchantCode: config.DUITKU_MERCHANT_CODE,
          paymentAmount: amount,
          paymentMethod: "SP", // QRIS
          merchantOrderId: reff,
          productDetails: `Panel ${product.name}`,
          customerVaName: ctx.from.first_name || "Telegram User",
          email: `${username}@private.id`, // Ambil dari logika create user
          phoneNumber: "08123456789", // Placeholder
          itemDetails: [{
            name: `Panel ${product.name}`,
            price: amount,
            quantity: 1
          }],
          // Ganti callbackUrl & returnUrl dengan domain Anda jika perlu
          callbackUrl: `https://example.com/callback/${reff}`,
          returnUrl: `https://example.com/return/${reff}`,
          signature: signature,
          expiryPeriod: 5 // Kadaluarsa 5 menit (300 detik)
        }, {
          headers: { "Content-Type": "application/json" }
        });

      } catch (e) {
        console.error("Duitku inquiry error:", e.response ? e.response.data : e.message);
        return ctx.reply("Gagal menghubungi gateway Duitku. Coba lagi nanti.");
      }
      
      const result = paymentResp.data;

      // 3. Cek respon Duitku
      if (result.statusCode !== "00") {
          console.error("Duitku Error Response:", result);
          return ctx.reply("Gagal membuat transaksi Duitku: " + result.statusMessage);
      }

      const qrString = result.qrString;
      const reference = result.reference; // ID Transaksi Duitku
      const checkoutUrl = result.paymentUrl; // Link bayar web

      // 4. Buat QR Code dari qrString
      const buffer = await QRCode.toBuffer(qrString, { width: 400, color: { dark: "#000000", light: "#ffffff" } });

      // 5. Kirim QR Code ke user
      const sentMsg = await ctx.replyWithPhoto({ source: buffer }, {
        caption: `𝗜𝗡𝗩𝗢𝗜𝗖𝗘 𝗣𝗔𝗬𝗠𝗘𝗡𝗧 💰

𝗣𝗿𝗼𝗱𝘂𝗸 : Panel ${product.name}
𝗧𝗼𝘁𝗮𝗹 𝗧𝗮𝗴𝗶𝗵𝗮𝗻 : Rp${product.price}
𝗕𝗶𝗮𝘆𝗮 𝗔𝗱𝗺𝗶𝗻 : Rp0
𝗤𝗿𝗶𝘀 𝗞𝗮𝗱𝗮𝗹𝘂𝗮𝗿𝘀𝗮 𝗗𝗮𝗹𝗮𝗺 : 5 menit
------------------------------------------
🕓 Sistem akan 𝗰𝗲𝗸 𝗼𝘁𝗼𝗺𝗮𝘁𝗶𝘀 setiap 15 detik hingga pembayaran terverifikasi.`,
        ...Markup.inlineKeyboard([
          [Markup.button.url("Bayar di Website", checkoutUrl)], // Tombol bayar web
          [Markup.button.callback("❌ Batalkan", `CANCEL|${reff}`)]
        ])
      });

      // 6. Simpan order ke orders.json
      orders[reff] = {
        reff, // Ini adalah merchantOrderId
        productId: product.id,
        username,
        buyer: ctx.from.id,
        status: "pending",
        created: Date.now(),
        reference, // ID Duitku
        paymentData: result,
        qrisMessageId: sentMsg.message_id,
        chatId: ctx.chat.id
      };
      saveOrders(orders);

      // 7. POLLING PEMBAYARAN
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        // 20 * 15 detik = 300 detik = 5 menit (sesuai expiryPeriod)
        if (attempts > 20) { 
          clearInterval(interval);
          const order = orders[reff];
          if (order?.status === "pending") {

            // Hapus pesan QRIS jika kadaluarsa
            if (order.qrisMessageId && order.chatId) {
              try {
                await bot.telegram.deleteMessage(order.chatId, order.qrisMessageId);
              } catch (e) {
                // biarkan jika gagal
              }
            }

            delete orders[reff];
            saveOrders(orders);
            await ctx.reply("⏳ Invoice kadaluarsa, silakan buat order baru.");
          }
          return;
        }

        try {
          // 8. Cek status Duitku
          const sigCheck = crypto.createHash("md5")
            .update(config.DUITKU_MERCHANT_CODE + reff + config.DUITKU_API_KEY) // merchantCode + merchantOrderId + apiKey
            .digest("hex");

          const statusResp = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
            merchantCode: config.DUITKU_MERCHANT_CODE,
            merchantOrderId: reff,
            signature: sigCheck
          }, {
            headers: { "Content-Type": "application/json" }
          });
          
          const status = statusResp?.data?.statusCode;

          if (status === "00") { // "00" = Sukses
            clearInterval(interval);
            orders[reff].status = "paid";
            saveOrders(orders);

            await ctx.reply(`𝗧𝗥𝗔𝗡𝗦𝗔𝗞𝗦𝗜 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ✅
𝗧𝗮𝗻𝗴𝗴𝗮𝗹 : ${formatDate()}
𝗡𝗼𝗺𝗼𝗿 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝘀𝗶 : ${reff}
𝗜𝗗 𝗧𝗿𝗮𝗻𝘀𝗮𝗸𝘀𝗶 : ${reference}
𝗦𝘁𝗮𝘁𝘂𝘀 : Berhasil
------------------------------------------
𝗣𝗿𝗼𝗱𝘂𝗸 : Panel ${product.name}
𝗧𝗼𝘁𝗮𝗹 𝗧𝗮𝗴𝗶𝗵𝗮𝗻 : Rp${product.price}
𝗕𝗶𝗮𝘆𝗮 𝗔𝗱𝗺𝗶𝗻 : Rp0
------------------------------------------
📌 Data Panel akan segera dikirim.
`);
            
            // 9. Buat Panel (logika lama)
            const account = await createUserAndServer({ username, product });
            if (account.error) {
              await ctx.reply("⚠️ Pembayaran sukses tapi gagal membuat panel.\nError: " + JSON.stringify(account.details));
              return;
            }

            await bot.telegram.sendMessage(ctx.from.id, `𓈃 𝗗𝗔𝗧𝗔 𝗣𝗔𝗡𝗘𝗟 𝗔𝗡𝗗𝗔
✎ 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${account.username}
✎ 𝗣𝗮𝘀𝘀𝘄𝗼𝗿𝗱: ${account.password}
✎ 𝗘𝗺𝗮𝗶𝗹: ${account.email}

✎ 𝗟𝗼𝗴𝗶𝗻: ${account.url}

💻 𝗦𝗽𝗲𝘀𝗶𝗳𝗶𝗸𝗮𝘀𝗶:
ʀᴀᴍ: ${product.ram === "0" ? "Unlimited" : product.ram + " MB"}
ᴅɪsᴋ: ${product.disk} MB
ᴄᴘᴜ: ${product.cpu}%

‼️𝗡𝗢𝗧𝗘:
1. DILARANG PAKAI SC DDOS
2. DILARANG SPAM SC PAIRING
3. DILARANG MENJUAL PANEL

📆 𝗧𝗮𝗻𝗴𝗴𝗮𝗹 : ${formatDate()}
📮 𝗜𝗻𝗳𝗼 *Bot* : ${urlchannel}`);
            
            // 10. Kirim Notif ke Admin
            await bot.telegram.sendMessage(-1002518002377, // Ganti dengan ID grup log Anda
`PEMBELIAN PANEL✅

𝗧𝗮𝗻𝗴𝗴𝗮𝗹 : ${formatDate()}
𝗡𝗼𝗺𝗼𝗿 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝘀𝗶 : ${reff}
𝗜𝗗 𝗧𝗿𝗮𝗻𝘀𝗮𝗸𝘀𝗶 : ${reference}
------------------------------------------
👤𝗨𝘀er @${ctx.from.username || "tanpa_username"} (ID: ${ctx.from.id})
Telah membeli Produk dengan data berikut:

• 𝗣𝗿𝗼𝗱𝘂𝗸 : Panel Pterodactyl
• 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲 : ${account.username}
• 𝗥𝗔𝗠 : ${product.ram} MB`);
          
          } else if (status === "01") {
            // "01" = Pending, biarkan loop berlanjut
          } else if (status) {
            // Status lain = Gagal, Batal, Expired
            clearInterval(interval);
            if (orders[reff]) {
                delete orders[reff];
                saveOrders(orders);
            }
            await ctx.reply(`⏳ Invoice gagal atau kadaluarsa (Status: ${statusResp?.data?.statusMessage || 'N/A'}). Silakan buat order baru.`);
          }
        } catch (e) {
          console.error("checkPayment (Duitku) error", e);
        }
      }, 15000); // Cek setiap 15 detik

      return ctx.answerCbQuery("Invoice Duitku dibuat.");
    }
    // [END] LOGIKA PEMBAYARAN DUITKU


    // ❌ HANDLE CANCEL (Logika lama, tetap berfungsi)
    if (cmd === "CANCEL") {
      const reff = arg1;
      const order = orders[reff];
      if (!order) return ctx.answerCbQuery("Order tidak ditemukan.", { show_alert: true });

      if (order.qrisMessageId && order.chatId) {
        try {
          await bot.telegram.deleteMessage(order.chatId, order.qrisMessageId);
        } catch (e) {
          // biarkan
        }
      }

      delete orders[reff];
      saveOrders(orders);

      await ctx.reply("❌ Order dibatalkan.");
      return ctx.answerCbQuery("Order dibatalkan.", { show_alert: true });
    }

  } catch (err) {
    console.error("callback_query error:", err);
  }
});


//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// [BARU] Perintah Beli Admin Panel (/buyadmin)
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("buyadmin", async (ctx) => {
  // 1. UBAH PARSING ARGUMEN: Hanya ambil username
  const text = ctx.message.text.split(" ").slice(1);
  const username = text[0];
  
  // 2. UBAH VALIDASI: Hanya cek username
  if (!username) {
    return ctx.reply(`
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
    🔥𝗢𝗥𝗗𝗘𝗥 𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟🔥
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯
✎ 𝗖𝗮𝗿𝗮 𝗠𝗲𝗺𝗯𝘂𝗮𝘁 :
/buyadmin <username>

✎ 𝗖𝗼𝗻𝘁𝗼𝗵 :
/buyadmin picung

💰 𝗛𝗮𝗿𝗴𝗮 : Rp10.000
    `);
  }
  
  // 3. UBAH TARGET ID: Ambil ID dari user yang mengirim perintah
  const targetTelegramId = ctx.from.id;
  const buyerUsername = ctx.from.username || "tanpa_username";

  // Harga dan detail produk virtual untuk Admin Panel
  const amount = 10000;
  const productName = "Admin Panel";
  const productId = "ADMIN_PANEL"; // ID unik untuk order ini

  const reff = `BUYADMIN-${Date.now()}`; // merchantOrderId (ganti dari CADP)

  // 1. Buat signature Duitku
  const rawSignature = config.DUITKU_MERCHANT_CODE + reff + amount + config.DUITKU_API_KEY;
  const signature = crypto.createHash("md5").update(rawSignature).digest("hex");

  let paymentResp;
  try {
    // 2. Request Inquiry ke Duitku
    paymentResp = await axios.post("https://passport.duitku.com/webapi/api/merchant/v2/inquiry", {
      merchantCode: config.DUITKU_MERCHANT_CODE,
      paymentAmount: amount,
      paymentMethod: "SP", // QRIS
      merchantOrderId: reff,
      productDetails: `Pembelian Admin Panel (${username})`,
      customerVaName: ctx.from.first_name || "Telegram User",
      email: `${username}@admin.Xhin`, // Format email dari /createadmin lama
      phoneNumber: "08123456789", // Placeholder
      itemDetails: [{
        name: `Admin Panel ${username}`,
        price: amount,
        quantity: 1
      }],
      callbackUrl: `https://example.com/callback/${reff}`,
      returnUrl: `https://example.com/return/${reff}`,
      signature: signature,
      expiryPeriod: 5 // Kadaluarsa 5 menit
    }, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    console.error("Duitku inquiry error (/buyadmin):", e.response ? e.response.data : e.message);
    return ctx.reply("Gagal menghubungi gateway Duitku. Coba lagi nanti.");
  }

  const result = paymentResp.data;

  // 3. Cek respon Duitku
  if (result.statusCode !== "00") {
    console.error("Duitku Error Response (/buyadmin):", result);
    return ctx.reply("Gagal membuat transaksi Duitku: " + result.statusMessage);
  }

  const qrString = result.qrString;
  const reference = result.reference; // ID Transaksi Duitku
  const checkoutUrl = result.paymentUrl; // Link bayar web

  // 4. Buat QR Code dari qrString
  const buffer = await QRCode.toBuffer(qrString, { width: 400, color: { dark: "#000000", light: "#ffffff" } });

  // 5. Kirim QR Code ke user
  const sentMsg = await ctx.replyWithPhoto({ source: buffer }, {
    caption: `𝗜𝗡𝗩𝗢𝗜𝗖𝗘 𝗣𝗔𝗬𝗠E𝗡𝗧 💰

𝗣𝗿𝗼𝗱𝘂𝗸 : ${productName} (${username})
𝗧𝗼𝘁𝗮𝗹 𝗧𝗮𝗴𝗶𝗵𝗮𝗻 : Rp${amount}
𝗕𝗶𝗮𝘆𝗮 𝗔𝗱𝗺𝗶𝗻 : Rp0
𝗤𝗿𝗶𝘀 𝗞𝗮𝗱𝗮𝗹𝘂𝗮𝗿𝘀𝗮 𝗗𝗮𝗹𝗮𝗺 : 5 menit
------------------------------------------
🕓 Sistem akan 𝗰𝗲𝗸 𝗼𝘁𝗼𝗺𝗮𝘁𝗶𝘀 setiap 15 detik hingga pembayaran terverifikasi.`,
    ...Markup.inlineKeyboard([
      [Markup.button.url("Bayar di Website", checkoutUrl)],
      [Markup.button.callback("❌ Batalkan", `CANCEL|${reff}`)]
    ])
  });

  // 6. Simpan order ke orders.json
  const orders = readOrders();
  orders[reff] = {
    reff,
    productId: productId,
    username: username, // Username panel baru
    targetTelegramId: targetTelegramId, // 4. UBAH DISINI: Simpan ID pembeli sebagai target
    buyer: ctx.from.id,
    buyerUsername: buyerUsername, // Simpan username untuk log
    status: "pending",
    created: Date.now(),
    reference, // ID Duitku
    paymentData: result,
    qrisMessageId: sentMsg.message_id,
    chatId: ctx.chat.id
  };
  saveOrders(orders);

  // 7. POLLING PEMBAYARAN
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    
    if (attempts > 20) { 
      clearInterval(interval);
      const order = orders[reff];
      if (order?.status === "pending") {
        if (order.qrisMessageId && order.chatId) {
          try {
            await bot.telegram.deleteMessage(order.chatId, order.qrisMessageId);
          } catch (e) { /* biarkan */ }
        }
        delete orders[reff];
        saveOrders(orders);
        
        // Kirim ke chat yang benar
        await bot.telegram.sendMessage(order.chatId, "⏳ Invoice kadaluarsa, silakan buat order baru.");
      }
      return;
    }

    try {
      // 8. Cek status Duitku
      const sigCheck = crypto.createHash("md5")
        .update(config.DUITKU_MERCHANT_CODE + reff + config.DUITKU_API_KEY)
        .digest("hex");

      const statusResp = await axios.post("https://passport.duitku.com/webapi/api/merchant/transactionStatus", {
        merchantCode: config.DUITKU_MERCHANT_CODE,
        merchantOrderId: reff,
        signature: sigCheck
      }, {
        headers: { "Content-Type": "application/json" }
      });

      const status = statusResp?.data?.statusCode;

      if (status === "00") { // "00" = Sukses
        clearInterval(interval);
        
        const finalOrder = orders[reff];
        if (!finalOrder || finalOrder.status === "paid") return; 

        finalOrder.status = "paid";
        saveOrders(orders);

        // 5. UBAH PENGIRIMAN PESAN: Gunakan finalOrder.chatId, jangan ctx.reply
        await bot.telegram.sendMessage(finalOrder.chatId, `𝗧𝗥𝗔𝗡𝗦𝗔𝗞𝗦𝗜 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 ✅
𝗧𝗮𝗻𝗴𝗴𝗮𝗹 : ${formatDate()}
𝗡𝗼𝗺𝗼𝗿 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝘀𝗶 : ${reff}
𝗜𝗗 𝗧𝗿𝗮𝗻𝘀𝗮𝗸𝘀𝗶 : ${reference}
𝗦𝘁𝗮𝘁𝘂𝘀 : Berhasil
------------------------------------------
𝗣𝗿𝗼𝗱𝘂𝗸 : ${productName} (${finalOrder.username})
𝗧𝗼𝘁𝗮𝗹 𝗧𝗮𝗴𝗶𝗵𝗮𝗻 : Rp${amount}
𝗕𝗶𝗮𝘆𝗮 𝗔𝗱𝗺𝗶𝗻 : Rp0
------------------------------------------
📌 Data Admin Panel akan segera dibuat dan dikirim.
`);

        // 9. LOGIKA CREATE ADMIN (tidak berubah)
        const password = finalOrder.username + "117";
        let newAdminData;

        try {
          const response = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${plta}`,
            },
            body: JSON.stringify({
              email: `${finalOrder.username}@admin.Xhin`,
              username: finalOrder.username,
              first_name: finalOrder.username,
              last_name: "Memb",
              language: "en",
              root_admin: true,
              password: password,
            }),
          });
          newAdminData = await response.json();

          if (newAdminData.errors) {
            console.error("Gagal buat admin Pterodactyl:", newAdminData.errors);
            // Kirim ke chat yang benar
            await bot.telegram.sendMessage(finalOrder.chatId, "⚠️ Pembayaran sukses tapi gagal membuat admin panel.\nError: " + JSON.stringify(newAdminData.errors[0], null, 2));
            return;
          }

          const user = newAdminData.attributes;

          // 10. Kirim detail ke admin baru (finalOrder.targetTelegramId sekarang adalah ID pembeli)
          await bot.telegram.sendMessage(
            finalOrder.targetTelegramId, // Ini adalah ID si pembeli
            `
┏━⬣❏「 INFO DATA ADMIN PANEL 」❏
│➥  Login : ${domain}
│➥  Username : ${user.username}
│➥  Password : ${password} 
┗━━━━━━━━━⬣
│ Rules : 
│• Jangan Curi Sc
│• Jangan Buka Panel Orang
│• Jangan Ddos Server
│• Kalo jualan sensor domainnya
│• Jangan Bagi² Panel Free !!
│• Jangan bagi bagi panel free !! ngelanggar? maklu matyy
┗━━━━━━━━━━━━━━━━━━⬣
THANKS FOR BUYING
          `
          );
          
          // 11. UBAH KONFIRMASI (OPSIONAL, dihapus agar tidak spam)
          // Pesan "Admin panel berhasil dibuat..." dihapus karena user sudah langsung dapat datanya.

          // 12. UBAH LOG ADMIN: Sederhanakan pesannya
          await bot.telegram.sendMessage(-1002518002377, // ID grup log Anda
`PEMBELIAN ADMIN PANEL✅

𝗧𝗮𝗻𝗴𝗴𝗮𝗹 : ${formatDate()}
𝗡𝗼𝗺𝗼𝗿 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝘀𝗶 : ${reff}
𝗜𝗗 𝗧𝗿𝗮𝗻𝘀𝗮𝗸𝘀𝗶 : ${reference}
------------------------------------------
👤User @${finalOrder.buyerUsername} (ID: ${finalOrder.buyer})
Telah membeli Admin Panel untuk dirinya sendiri:

• 𝗣𝗿𝗼𝗱𝘂𝗸 : Admin Panel
• 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲 : ${user.username}`);

        } catch (error) {
          console.error(error);
          await bot.telegram.sendMessage(
            finalOrder.chatId,
            "⚠️ Pembayaran sukses, tapi terjadi kesalahan dalam pembuatan admin. Silakan hubungi admin."
          );
        }

      } else if (status === "01") {
        // Pending, biarkan
      } else if (status) {
        // Gagal/Expired
        clearInterval(interval);
        const order = orders[reff]; // Ambil order sekali lagi
        if (order) {
            delete orders[reff];
            saveOrders(orders);
            // Kirim ke chat yang benar
            await bot.telegram.sendMessage(order.chatId, `⏳ Invoice gagal atau kadaluarsa (Status: ${statusResp?.data?.statusMessage || 'N/A'}). Silakan buat order baru.`);
        }
      }
    } catch (e) {
      console.error("checkPayment (Duitku /buyadmin) error", e);
    }
  }, 15000); // Cek setiap 15 detik

});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Headler Button Keyboard
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.hears("📦 Order Panel", (ctx) => ctx.reply(`
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
           📦𝗢𝗥𝗗𝗘𝗥 𝗣𝗔𝗡𝗘𝗟📦
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯
✎ 𝗖𝗮𝗿𝗮 𝗠𝗲𝗺𝗯𝘂𝗮𝘁 :
/buypanel <username>

✎ 𝗖𝗼𝗻𝘁𝗼𝗵 :
/buypanel picung`));
bot.hears("🛍️ Order Admin Panel", (ctx) => ctx.reply(`
╭─━━━━━━ ✦ ✧ ✦ ━━━━━━─╮
    🔥𝗢𝗥𝗗𝗘𝗥 𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟🔥
╰─━━━━━━ ✦ ✧ ✦ ━━━━━━─╯
✎ 𝗖𝗮𝗿𝗮 𝗠𝗲𝗺𝗯𝘂𝗮𝘁 :
/buyadmin <username>

✎ 𝗖𝗼𝗻𝘁𝗼𝗵 :
/buyadmin picung

💰 𝗛𝗮𝗿𝗴𝗮 : Rp10.000
`));
bot.hears("📞 Hubungi Customer Service", (ctx) => {
  const infoOwner = `
📞 *Customer Service*

👤 Owner: [Klik disini](${urladmin})
  `;
  ctx.replyWithMarkdown(infoOwner);
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Withdraw (Atlantic - Dibiarkan)
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

// helper sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// helper sensor
function sensorString(input, visibleCount = 3, maskChar = "X") {
  if (!input) return "";
  if (input.length <= visibleCount) return input;
  return input.slice(0, visibleCount) + maskChar.repeat(input.length - visibleCount);
}

function sensorWithSpace(str, visibleCount = 3, maskChar = "X") {
  if (!str) return "";
  let result = "";
  let count = 0;
  for (let char of str) {
    if (char === " ") {
      result += char;
    } else if (count < visibleCount) {
      result += char;
      count++;
    } else {
      result += maskChar;
    }
  }
  return result;
}

// ✅ Command cek saldo (versi sederhana & stabil)
bot.command("saldo", async (ctx) => {
  const userId = ctx.from.id.toString();
  if (userId !== config.OWNER_ID.toString()) {
    return ctx.reply("❌ Hanya Owner yang bisa mengakses perintah ini.");
  }

  try {
    const res = await axios.post(
      "https://atlantich2h.com/get_profile",
      qs.stringify({ api_key: config.apiAtlantic }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const saldoUtama = res?.data?.data?.balance || 0;
    const saldoSettle = res?.data?.data?.settlement_balance || 0;

    const message = `
📊 *INFORMASI SALDO ATLANTIC*
━━━━━━━━━━━━━━━━━━━━━
💰 *User Balance:* Rp${saldoUtama.toLocaleString()}
🏦 *Settlement Balance:* Rp${saldoSettle.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━
🕒 *Update:* ${formatDate()}
`;

    return ctx.reply(message, { parse_mode: "Markdown" });
  } catch (err) {
    const msgErr = err.response?.data?.message || err.message;
    console.error("❌ Error cek saldo:", msgErr);
    return ctx.reply(`❌ Gagal memuat saldo.\n\n${msgErr}`);
  }
});


// ✅ Command cairkan saldo
bot.command("cairkan", async (ctx) => {
  const userId = ctx.from.id.toString();
  if (userId !== config.OWNER_ID.toString()) {
    return ctx.reply("❌ Hanya Owner yang bisa mengakses perintah ini.");
  }

  try {
    // ambil saldo dulu
    const res = await axios.post(
      "https://atlantich2h.com/get_profile",
      qs.stringify({ api_key: config.apiAtlantic }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const saldoAwal = res?.data?.data?.balance || 0;
    if (saldoAwal <= 0) {
      return ctx.reply("⚠️ Tidak ada saldo yang bisa dicairkan.");
    }

    const totalsaldo = Math.max(0, saldoAwal - 2000); // potong fee 2000

    await ctx.reply(
      `⏳ *Proses Pencairan*\n\n` +
      `Sedang mencairkan saldo sebesar *Rp${totalsaldo.toLocaleString()}*...\n\nMohon tunggu sebentar.`
    , { parse_mode: "Markdown" });

    // request pencairan
    const transfer = await axios.post(
      "https://atlantich2h.com/transfer/create",
      qs.stringify({
        api_key: config.apiAtlantic,
        ref_id: `${Date.now()}`,
        kode_bank: config.typeewallet,
        nomor_akun: config.nopencairan,
        nama_pemilik: config.atasnamaewallet,
        nominal: totalsaldo.toString(),
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const ids = transfer?.data?.data?.id;
    let status = transfer?.data?.data?.status || "unknown";

    const notif = (st) => (
      `🏦 *Slip Pencairan Saldo*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 Nominal     : Rp${saldoAwal.toLocaleString()}\n` +
      `💸 Fee         : Rp2.000\n` +
      `📲 Tujuan      : ${sensorString(config.nopencairan)}\n` +
      `🏷️ Ewallet     : ${config.typeewallet}\n` +
      `👤 Pemilik     : ${sensorWithSpace(config.atasnamaewallet)}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 Status      : *${st.toUpperCase()}*`
    );

    if (status === "success") {
      return ctx.reply(notif("success"), { parse_mode: "Markdown" });
    }

    if (status === "pending") {
      for (let i = 0; i < 6; i++) {
        await sleep(5000);

        const checkRes = await axios.post(
          "https://atlantich2h.com/transfer/status",
          qs.stringify({ api_key: config.apiAtlantic, id: ids }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const result = checkRes?.data?.data || {};
        if (result?.status && result.status !== "pending") {
          return ctx.reply(notif(result.status), { parse_mode: "Markdown" });
        }
      }

      await ctx.reply("⚠️ Pencairan masih *pending*, silakan cek manual di dashboard Atlantic.", { parse_mode: "Markdown" });
    }

  } catch (err) {
    const msgErr = err.response?.data?.message || err.message;
    console.error("❌ Error cairkan saldo:", msgErr);
    return ctx.reply(`❌ Gagal mencairkan saldo.\n\n${msgErr}`);
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Create Panel (Owner Only)
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("createpanel", async (ctx) => {
  const userId = ctx.from.id.toString();
  if (userId !== OWNER_ID.toString()) {
    return ctx.reply("⚠️ Hanya Owner yang bisa mengakses perintah ini.", { parse_mode: "Markdown" });
  }

  const text = ctx.message.text.split(" ").slice(1);
  const username = text[0];
  if (!username) {
    return ctx.reply("Format: /createpanel <username>\n\nContoh:\n/createpanel testuser");
  }

  ctx.reply("⏳ Membuat panel...");

  const product = {
    ram: "1024",
    cpu: "50",
    disk: "2048"
  };

  const account = await createUserAndServer({ username, product });
  if (account.error) {
    return ctx.reply("⚠️ Gagal membuat panel.\nError: " + JSON.stringify(account.details));
  }

  await ctx.reply(
`✅ Panel berhasil dibuat!

𓈃 𝗗𝗔𝗧𝗔 𝗣𝗔𝗡𝗘𝗟
✎ Username: ${account.username}
✎ Password: ${account.password}
✎ Email: ${account.email}

✎ Login: ${account.url}

💻 Spec:
RAM: ${product.ram} MB
Disk: ${product.disk} MB
CPU: ${product.cpu}%`
  );
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Broadcast ke semua pengguna Bot
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

// === BROADCAST ===
const BROADCAST_DELAY_MS = 5; // delay antar pesan (ubah sesuai kebutuhan)

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

bot.command("broadcast", async (ctx) => {
  try {
    const senderId = ctx.from.id;
    // pastikan owner match (samakan tipe)
    if (String(senderId) !== String(OWNER_ID)) {
      return ctx.reply("❌ Hanya Owner yang bisa menggunakan command ini.");
    }

    const text = ctx.message.text.split(" ").slice(1).join(" ").trim();
    if (!text) {
      return ctx.reply("⚠️ Format salah!\nGunakan: /broadcast Isi pesan yang mau dikirim");
    }

    const users = readUsers();
    if (!users.length) return ctx.reply("⚠️ Database user kosong. Tidak ada yang dikirimi broadcast.");

    await ctx.reply(`📢 Mengirim broadcast ke ${users.length} user...`);

    let success = 0, fail = 0, removed = [];

    for (const uid of users) {
      try {
        await bot.telegram.sendMessage(uid, `${text}`, { parse_mode: "Markdown" });
        success++;
      } catch (err) {
        fail++;
        // Hapus user jika memang block atau chat not found (error 403)
        const code = err && (err.code || (err.response && err.response.error_code));
        const desc = err && (err.response && err.response.description || err.message || "");
        const blocked = code === 403 || /blocked/i.test(String(desc)) || /chat not found/i.test(String(desc));
        if (blocked) {
          removeUser(uid);
          removed.push(uid);
        }
        console.error(`Broadcast failed to ${uid}:`, desc);
      }
      // delay kecil untuk mengurangi risiko rate limit
      if (BROADCAST_DELAY_MS > 0) await sleep(BROADCAST_DELAY_MS);
    }

    await ctx.reply(`✅ Broadcast selesai.\nBerhasil: ${success}\nGagal: ${fail}\nDihapus (auto): ${removed.length}`);
  } catch (e) {
    console.error("broadcast error:", e);
    ctx.reply("❌ Terjadi kesalahan saat broadcast.");
  }
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Install Panel & Wings
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("installpanel", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  // ✅ Batasi hanya untuk OWNER
  if (userId.toString() !== OWNER_ID.toString()) {
    return ctx.reply("⚠️ Hanya *Owner* yang bisa menjalankan perintah ini.", {
      parse_mode: "Markdown"
    });
  }

  const text = ctx.message.text.split(" ").slice(1).join(" ");

  // Kalau argumen tidak ada, tampilkan tutorial lengkap
  if (!text) {
    return ctx.reply(`
📦 *TUTORIAL INSTALASI PANEL PTERODACTYL*

Gunakan perintah dengan format:
\`/installpanel ipvps|pwvps|panel.com|node.com|ram\`

📌 *Penjelasan Parameter:*
1. \`ipvps\` – IP VPS tujuan, contoh: \`34.101.XX.XX\`
2. \`pwvps\` – Password root SSH VPS
3. \`panel.com\` – Domain untuk panel admin (misal: \`panel.nexus.com\`)
4. \`node.com\` – Domain untuk node wings (misal: \`node.nexus.com\`)
5. \`ram\` – RAM untuk node dalam *MB* (contoh: \`10240\` untuk 10GB)

🔧 *Contoh Penggunaan:*
\`/installpanel 34.101.XX.XX|passwordroot|panel.nexus.com|node.nexus.com|10240\`

⏱️ Proses ini memakan waktu 5–10 menit. Jangan keluar dari bot.
`, { parse_mode: "Markdown" });
  }

  const vii = text.split("|");
  if (vii.length < 5) {
    return ctx.reply("❌ Format salah. Harus 5 parameter:\nipvps|pwvps|panel.com|node.com|ram *(contoh 100000)*");
  }

  const [ipVps, pwVps, domainPanel, domainNode, ramServer] = vii;
  const passwordPanel = "admin" + Math.floor(Math.random() * 10000);
  const commandPanel = `bash <(curl -s https://pterodactyl-installer.se)`;

  const ress = new Client();
  const connSettings = {
    host: ipVps,
    port: '22',
    username: 'root',
    password: pwVps
  };

  function instalWings() {
    ress.exec('bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/createnode.sh)', async (err, stream) => {
      if (err) throw err;

      stream.on('close', async () => {
        const teks = `
╭─━━━━━━━━━━━━━━━━━━━━━╮
  *INSTALL PANEL SUKSES ✅*
╰─━━━━━━━━━━━━━━━━━━━━━╯

📦 *Detail Panel :*
👤 *Username :* admin
🔐 *Password :* ${passwordPanel}
🌐 *Domain :* ${domainPanel}

📌 *Langkah selanjutnya:* Ketik perintah:  
\`/startwings ${ipVps}|${pwVps}|<TOKEN_WINGS>\`

Token Wings bisa diambil dari panel node.
`.trim();

        await ctx.reply(teks, { parse_mode: "Markdown" });
      });

      stream.on('data', (data) => {
        const d = data.toString();
        console.log('Wings STDOUT:', d);
        if (d.includes("Masukkan nama lokasi: ")) stream.write('Singapore\n');
        if (d.includes("Masukkan deskripsi lokasi: ")) stream.write('by picung\n');
        if (d.includes("Masukkan domain: ")) stream.write(`${domainNode}\n`);
        if (d.includes("Masukkan nama node: ")) stream.write('Node01\n');
        if (d.includes("Masukkan RAM (dalam MB): ")) stream.write(`${ramServer}\n`);
        if (d.includes("Masukkan jumlah maksimum disk space (dalam MB): ")) stream.write(`${ramServer}\n`);
        if (d.includes("Masukkan Locid: ")) stream.write('1\n');
      });

      stream.stderr.on('data', (data) => console.error("Wings STDERR:", data.toString()));
    });
  }

  function instalPanel() {
    ress.exec(commandPanel, (err, stream) => {
      if (err) throw err;

      stream.on('close', () => {
        instalWings();
      });

      stream.on('data', (data) => {
        const d = data.toString();
        console.log('InstallPanel STDOUT:', d);
        if (d.includes('Input 0-6')) stream.write('0\n');
        if (d.includes('(y/N)')) stream.write('y\n');
        if (d.includes('Database name')) stream.write('\n');
        if (d.includes('Database username')) stream.write('adminnnn\n');
        if (d.includes('Password (press enter')) stream.write('admin\n');
        if (d.includes('Select timezone')) stream.write('Asia/Jakarta\n');
        if (d.includes('Provide the email address')) stream.write('admin@gmail.com\n');
        if (d.includes('Email address for the initial admin account')) stream.write('admin@gmail.com\n');
        if (d.includes('Username for the initial admin account')) stream.write('admin\n');
        if (d.includes('First name')) stream.write('admin\n');
        if (d.includes('Last name')) stream.write('panel\n');
        if (d.includes('Password for the initial admin account')) stream.write(`${passwordPanel}\n`);
        if (d.includes('Set the FQDN')) stream.write(`${domainPanel}\n`);
        if (d.includes('Do you want to automatically configure UFW')) stream.write('y\n');
        if (d.includes('Do you want to automatically configure HTTPS')) stream.write('y\n');
        if (d.includes('Select the appropriate number')) stream.write('1\n');
        if (d.includes('I agree that this HTTPS request')) stream.write('y\n');
        if (d.includes('Proceed anyways')) stream.write('y\n');
        if (d.includes('(yes/no)')) stream.write('y\n');
        if (d.includes('Continue with installation?')) stream.write('y\n');
        if (d.includes('Still assume SSL?')) stream.write('y\n');
        if (d.includes('Please read the Terms')) stream.write('y\n');
        if (d.includes('(A)gree/(C)ancel:')) stream.write('A\n');
      });

      stream.stderr.on('data', (data) => console.error("InstallPanel STDERR:", data.toString()));
    });
  }

  ress.on('ready', async () => {
    await ctx.reply("🚀 Memulai proses *install panel VPS*. Harap tunggu sekitar 5–10 menit...", {
      parse_mode: 'Markdown'
    });

    ress.exec("\n", (err, stream) => {
      if (err) throw err;
      stream.on('close', () => instalPanel());
      stream.on('data', (data) => console.log("PRE-setup:", data.toString()));
      stream.stderr.on('data', (data) => console.error("PRE-setup ERR:", data.toString()));
    });
  });

  ress.on('error', (err) => {
    console.error("❌ SSH Connection Error:", err.message);
    ctx.reply(`❌ Gagal konek ke VPS:\n${err.message}`);
  });

  ress.connect(connSettings);
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Command: /startwings
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("startwings", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id.toString();

  // ✅ Batasi hanya untuk OWNER
  if (userId !== OWNER_ID.toString()) {
    return ctx.reply("⚠️ Hanya *Owner* yang bisa menjalankan perintah ini.", {
      parse_mode: "Markdown"
    });
  }

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) {
    return ctx.reply(
      `
📖 *TUTORIAL START WINGS* 📖

Gunakan format:
/startwings ipvps|password|token

🔧 *Contoh:*
/startwings 123.45.67.89|myPassword|token-xyz-123456

➡️ *Keterangan:*
• ipvps   = IP VPS tujuan
• password = Password root VPS
• token    = Token konfigurasi node dari panel

⚡ Setelah berhasil, node akan otomatis terkoneksi dengan panel.
`,
      { parse_mode: "Markdown" }
    );
  }

  const args = text.split(",");
  if (args.length < 3) {
    return ctx.reply(
      "❌ *Format salah!*\n\nGunakan format:\n/startwings ipvps|password|token",
      { parse_mode: "Markdown" }
    );
  }

  const [ipvps, passwd, token] = args.map((a) => a.trim());
  const conn = new Client();

  conn
    .on("ready", () => {
      ctx.reply("⚙️ *PROSES CONFIGURE WINGS...*", { parse_mode: "Markdown" });

      const command = "bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/startwings.sh)";

      conn.exec(command, (err, stream) => {
        if (err) {
          ctx.reply("❌ Terjadi error saat eksekusi command!");
          return conn.end();
        }

        stream
          .on("data", (data) => {
            const output = data.toString();
            console.log("STDOUT:", output);

            // Respon otomatis terhadap prompt dari script
            if (output.includes("Masukkan token:") || output.includes("Input token:")) {
              stream.write(`${token}\n`);
            }
            if (output.includes("Pilih opsi") || output.includes("Masukkan pilihan:")) {
              stream.write("3\n");
            }

            // Info progres ke Telegram (tanpa spam)
            if (output.toLowerCase().includes("selesai") || output.toLowerCase().includes("berhasil")) {
              ctx.reply("✅ *Wings Berhasil Dikoneksikan ke Panel!*", {
                parse_mode: "Markdown",
              });
            }
          })
          .stderr.on("data", (data) => {
            console.error("STDERR:", data.toString());
          })
          .on("close", () => {
            ctx.reply("✅ *Proses konfigurasi Wings selesai!*", {
              parse_mode: "Markdown",
            });
            conn.end();
          });
      });
    })
    .on("error", (err) => {
      console.error("Connection Error:", err.message);
      ctx.reply(`❌ Gagal konek ke VPS:\n${err.message}`);
    })
    .connect({
      host: ipvps,
      port: 22,
      username: "root",
      password: passwd,
    });
});

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Hapus semua User yang tidak ada Server
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.command("delallusr", async (ctx) => {
  const userId = ctx.from.id; // ✅ ambil id dari user yang eksekusi command
  if (String(userId) !== String(OWNER_ID)) {
    return ctx.reply("⚠️ Hanya Owner yang bisa mengakses perintah ini.", { parse_mode: "Markdown" });
  }

  try {
    // 🔹 Ambil semua user
    const usersResp = await fetch(`${domain}/api/application/users?per_page=10000`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    const usersData = await usersResp.json();
    const users = usersData.data || [];

    // 🔹 Ambil semua server
    const serversResp = await fetch(`${domain}/api/application/servers?per_page=10000`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    const serversData = await serversResp.json();
    const servers = serversData.data || [];

    // 🔹 Cari user tanpa server
    const serverUserIds = servers.map((srv) => String(srv.attributes.user));
    const usersNoServer = users.filter((usr) => !serverUserIds.includes(String(usr.attributes.id)));

    const total = usersNoServer.length;

    if (total === 0) {
      return ctx.reply("✅ Tidak ada user tanpa server.");
    }

    await ctx.reply(
      `📋 Total user tanpa server: *${total}*\n\nKetik /confirmdelusr untuk menghapus semuanya.`,
      { parse_mode: "Markdown" }
    );

  } catch (err) {
    console.error("Error:", err);
    ctx.reply("❌ Terjadi kesalahan mengambil data.");
  }
});

// === Command /confirmdelusr ===
bot.command("confirmdelusr", async (ctx) => {
  const userId = ctx.from.id;
  if (String(userId) !== String(OWNER_ID)) {
    return ctx.reply("⚠️ Hanya Owner yang bisa mengakses perintah ini.", { parse_mode: "Markdown" });
  }
  
  try {
    // 🔹 Fetch ulang data user & server
    const usersResp = await fetch(`${domain}/api/application/users?per_page=10000`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    const usersData = await usersResp.json();
    const users = usersData.data || [];

    const serversResp = await fetch(`${domain}/api/application/servers?per_page=10000`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${plta}`,
      },
    });
    const serversData = await serversResp.json();
    const servers = serversData.data || [];

    // 🔹 Cari user tanpa server lagi
    const serverUserIds = servers.map((srv) => String(srv.attributes.user));
    const usersNoServer = users.filter((usr) => !serverUserIds.includes(String(usr.attributes.id)));

    if (!usersNoServer.length) {
      return ctx.reply("✅ Semua user sudah punya server, tidak ada yang dihapus.");
    }

    let success = 0, fail = 0;

    // 🔹 Loop hapus user
    for (const usr of usersNoServer) {
      try {
        await fetch(`${domain}/api/application/users/${usr.attributes.id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${plta}`,
          },
        });
        success++;
      } catch (e) {
        fail++;
      }
    }

    await ctx.reply(`✅ Selesai menghapus user tanpa server.\n\nBerhasil: ${success}\nGagal: ${fail}`);

  } catch (err) {
    console.error("Error delete:", err);
    ctx.reply("❌ Terjadi kesalahan saat menghapus user.");
  }
});
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// File Data
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

const PRODUCTS_FILE = path.join(__dirname, "src", "products.json");
const ORDERS_FILE = path.join(__dirname, "src", "orders.json");

if (!fs.existsSync(PRODUCTS_FILE)) fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify({}, null, 2));

function readProducts() { return JSON.parse(fs.readFileSync(PRODUCTS_FILE)); }
function saveProducts(arr) { fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(arr, null, 2)); }
function readOrders() { return JSON.parse(fs.readFileSync(ORDERS_FILE)); }
function saveOrders(obj) { fs.writeFileSync(ORDERS_FILE, JSON.stringify(obj, null, 2)); }
function readPremium() { return JSON.parse(fs.readFileSync(PREMIUM_FILE)); }

//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// Pterodactyl Function 
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

async function createUserAndServer({ username, product }) {
  const name = username + " Server";
  const memo = product?.ram;
  const cpu = product?.cpu;
  const disk = product?.disk;
  const spc =
    'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';

  const email = `${username}@private.id`;
  const password = `${username}7uytg`;

  let user, server;

  try {
    // 🔹 Buat user
    const response = await fetch(`${domain}/api/application/users`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        email,
        username,
        first_name: username,
        last_name: username,
        language: "en",
        password,
      }),
    });

    const data = await response.json();
    if (data.errors) {
      return { error: true, details: data.errors };
    }
    user = data.attributes;

    // 🔹 Buat server
    const response2 = await fetch(`${domain}/api/application/servers`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${plta}`,
      },
      body: JSON.stringify({
        name,
        description: "",
        user: user.id,
        egg: parseInt(egg),
        docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
        startup: spc,
        environment: {
          INST: "npm",
          USER_UPLOAD: "0",
          AUTO_UPDATE: "0",
          CMD_RUN: "npm start",
        },
        limits: {
          memory: memo,
          swap: 0,
          disk: disk,
          io: 500,
          cpu: cpu,
        },
        feature_limits: {
          databases: 5,
          backups: 5,
          allocations: 1,
        },
        deploy: {
          locations: [parseInt(loc)],
          dedicated_ip: false,
          port_range: [],
        },
      }),
    });

    const data2 = await response2.json();
    if (data2.errors) {
      return { error: true, details: data2.errors };
    }
    server = data2.attributes;

    return {
      error: false,
      username,
      password,
      email,
      url: `${domain}`,
      user,
      server,
    };
  } catch (error) {
    return { error: true, details: error.message };
  }
}
// === Tambahan: cek username sudah ada di panel
async function isUsernameTaken(username) {
  try {
    const resp = await fetch(`${domain}/api/application/users?filter[username]=${username}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${plta}`
      }
    });
    const data = await resp.json();
    return Array.isArray(data.data) && data.data.length > 0;
  } catch (e) {
    console.error("check username error:", e);
    return false;
  }
}
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//
// === Launch
//▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰//

bot.launch();
console.log(chalk.blue.bold(`
⠀⠀⠀⢸⣦⡀⠀⠀⠀⠀⢀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣏⠻⣶⣤⡶⢾⡿⠁⠀⢠⣄⡀⢀⣴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠀⠀⠀
⠀⠀⣀⣼⠷⠀⠀⠁⢀⣿⠃⠀⠀⢀⣿⣿⣿⣇⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠴⣾⣯⣅⣀⠀⠀⠀⠈⢻⣦⡀⠒⠻⠿⣿⡿⠿⠓⠂⠀⠀⢂⡇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠉⢻⡇⣤⣾⣿⣷⣿⣿⣤⠀⠀⣿⠁⠀⠀⠀⢀⣴⣿⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠸⣿⡿⠏⠀⢀⠀⠀⠿⣶⣤⣤⣤⣄⣀⣴⣿⡿⢻⣿⡆⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠟⠁⠀⢀⣼⠀⠀⠀⠹⣿⣟⠿⠿⠿⡿⠋⠀⠘⣿⣇⠀⠄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢳⣶⣶⣿⣿⣇⣀⠀⠀⠙⣿⣆⠀⠀⠀⠀⠀⠀⠛⠿⣿⣦⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⣹⣿⣿⣿⣿⠿⠋⠁⠀⣹⣿⠳⠀⠀⠀⠀⠀⠀⢀⣠⣽⣿⡿⠟⠃
⠀⠀⠀⠈⠀⢰⠿⠛⠻⢿⡇⠀⠀⠀⣰⣿⠏⠀⠀⢀⠀⠀⠁⣾⣿⠟⠋⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⠀⠀⣰⣿⣿⣾⣿⠿⢿⣷⣀⢀⣿⡇⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠠⠀⠀⠀⠋⠉⠁⠀⠀⠀⠀⠙⢿⣿⣿⠇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀`));
console.log(chalk.green.bold('[✅ ] Berhasil tersambung!\n\n'));
console.log(chalk.blue.bold('Thanks for using this script.'));
console.log(chalk.yellow.bold('- Develover: @nixcooll'));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));