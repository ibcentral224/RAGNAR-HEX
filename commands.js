const {
  getContentType,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');

const axios = require('axios');
const fs = require('fs');

// ─── Configuration ────────────────────────────────────────────────────────────
const PREFIXE = '.';
const NOM_BOT = '𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗';
const PROPRIETAIRE_NUM = '224613726037';
const PROPRIETAIRE_JID = '224613726037@s.whatsapp.net';
const PROPRIETAIRE_NOM = '𝐑𝐀𝐆𝐍𝐀𝐑 𝐋𝐎𝐓𝐇𝐁𝐑𝐎𝐊';
const DEVELOPPEUR = 'IbSacko';
const IMAGE_MENU = 'https://i.ibb.co/5Xjhk7xV/IMG-20260401-WA1023.jpg';
const VERSION = '1.0';

// ─── Système ON/OFF ───────────────────────────────────────────────────────────
const etat = {
  antilink: false,
  antisticker: false,
  antigm: false,
  antidelete: false,
};

// ─── Uptime ───────────────────────────────────────────────────────────────────
const START_TIME = Date.now();
function getUptime() {
  const sec = Math.floor((Date.now() - START_TIME) / 1000);
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600) % 24;
  const j = Math.floor(sec / 86400);
  if (j > 0) return `${j}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec % 60}s`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getSender(msg) {
  if (msg.key.fromMe) return PROPRIETAIRE_JID;
  return msg.key.participant || msg.key.remoteJid;
}

function isGroupe(msg) {
  return msg.key.remoteJid.endsWith('@g.us');
}

async function reply(sock, msg, text) {
  try {
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  } catch (e) {
    console.error('Erreur reply:', e.message);
  }
}

// ─── Télécharger média du message cité ───────────────────────────────────────
async function getQuotedMedia(sock, msg) {
  // Cherche le message cité
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMsg = ctx?.quotedMessage;
  if (!quotedMsg) return null;

  // Reconstruire un faux message pour downloadMediaMessage
  const fakeMsg = {
    key: {
      remoteJid: msg.key.remoteJid,
      id: ctx.stanzaId,
      participant: ctx.participant,
    },
    message: quotedMsg,
  };

  const type = getContentType(quotedMsg);
  if (!type) return null;

  try {
    const buffer = await downloadMediaMessage(fakeMsg, 'buffer', {}, {
      logger: { info: () => {}, error: () => {}, warn: () => {} },
      reuploadRequest: sock.updateMediaMessage,
    });
    return { buffer, type };
  } catch (e) {
    console.error('Erreur téléchargement média:', e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                        GESTIONNAIRE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
async function handleCommands(sock, msg) {

  // Extraire le texte du message
  const body =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    msg.message?.stickerMessage ? '' : '' || '';

  const rawBody =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';

  // Vérifier le préfixe
  if (!rawBody.startsWith(PREFIXE)) return;

  const args = rawBody.slice(PREFIXE.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const texte = args.join(' ');
  const from = msg.key.remoteJid;
  const sender = getSender(msg);
  const groupe = isGroupe(msg);

  console.log(`⚡ CMD: "${cmd}" | texte: "${texte}" | from: ${from} | sender: ${sender}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 MENU
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'menu') {
    const texteMenu =
`╭──𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗─────⚔️
│ 𝗕𝗼𝘁 : ${NOM_BOT}
│ 𝗨𝗽𝘁𝗶𝗺𝗲 : ${getUptime()}
│ 𝗠𝗼𝗱𝗲 : Public - Tous les chats
│ 𝗣𝗿𝗲𝗳𝗶𝘅𝗲 : .
│ 𝗣𝗿𝗼𝗽𝗿𝗶𝗲́𝘁𝗮𝗶𝗿𝗲 : ${PROPRIETAIRE_NOM}
│ 𝗗𝗲́𝘃𝗲𝗹𝗼𝗽𝗽𝗲𝘂𝗿 : ${DEVELOPPEUR}
│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${VERSION}
╰───────────────⚔️
⚔️───────────────⚔️
          𝐂𝐄𝐍𝐓𝐑𝐀𝐋-𝐇𝐄𝐗 
⚔️───────────────⚔️
⚔️───────────────⚔️
『 𝗠𝗘𝗡𝗨-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗺𝗲𝗻𝘂 → le menu
│ ⬡ 𝗮𝗹𝗶𝘃𝗲 → état du bot
│ ⬡ 𝗱𝗲𝘃 → développeur
│ ⬡ 𝗮𝗹𝗹𝘃𝗮𝗿 → variables du bot
│ ⬡ 𝗽𝗶𝗻𝗴 → vitesse du bot
│ ⬡ 𝗼𝘄𝗻𝗲𝗿 → propriétaire
│ ⬡ 𝗵𝗲𝗹𝗽 → aide
│ ⬡ 𝗮𝗹𝗹𝗰𝗺𝗱𝘀 → les commandes
╰─────────────────⚔️
⚔️────────────────⚔️
『 𝗚𝗥𝗢𝗨𝗣𝗘𝗦-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗸𝗶𝗰𝗸𝗮𝗹𝗹 → exclure tous
│ ⬡ 𝘁𝗮𝗴𝗮𝗱𝗺𝗶𝗻 → mention admins
│ ⬡ 𝗮𝗰𝗰𝗲𝗽𝘁𝗮𝗹𝗹 → accepter tous
│ ⬡ 𝘁𝗮𝗴𝗮𝗹𝗹 → mentionner tous
│ ⬡ 𝗴𝗲𝘁𝗮𝗹𝗹 → liste membres
│ ⬡ 𝗴𝗿𝗼𝘂𝗽 𝗰𝗹𝗼𝘀𝗲 → fermer groupe
│ ⬡ 𝗴𝗿𝗼𝘂𝗽 𝗼𝗽𝗲𝗻 → ouvrir groupe
│ ⬡ 𝗮𝗱𝗱 → ajouter membre
│ ⬡ 𝘃𝗰𝗳 → contacts VCF
│ ⬡ 𝗹𝗶𝗻𝗸𝗴𝗰 → lien du groupe
│ ⬡ 𝗮𝗻𝘁𝗶𝗹𝗶𝗻𝗸 → anti-lien
│ ⬡ 𝗮𝗻𝘁𝗶𝘀𝘁𝗶𝗰𝗸𝗲𝗿 → anti-sticker
│ ⬡ 𝗮𝗻𝘁𝗶𝗴𝗺 → anti-mention
│ ⬡ 𝗰𝗿𝗲𝗮𝘁𝗲 → créer groupe
│ ⬡ 𝗴𝗿𝗼𝘂𝗽𝗶𝗻𝗳𝗼 → infos groupe
╰─────────────────⚔️
⚔️────────────────⚔️
『 𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗴𝗲𝘁𝗽𝗽 → profil
│ ⬡ 𝗴𝗼𝗼𝗱𝗻𝗶𝗴𝗵𝘁 → bonne nuit
│ ⬡ 𝘄𝗰𝗴 → classement
│ ⬡ 𝗾𝘂𝗶𝘇𝘇 → quiz
│ ⬡ 𝗮𝗻𝗶𝗺𝗲 → image anime
│ ⬡ 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 → ton profil
│ ⬡ 𝗰𝗼𝘂𝗽𝗹𝗲 → couple aléatoire
│ ⬡ 𝗽𝗼𝗹𝗹 → sondage
│ ⬡ 𝗲𝗺𝗼𝗷𝗶𝗺𝗶𝘅 → mélange emojis
╰─────────────────⚔️
⚔️────────────────⚔️
『 𝗢𝗨𝗧𝗜𝗟𝗦-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝘀𝘁𝗶𝗰𝗸𝗲𝗿 → créer sticker
│ ⬡ 𝘁𝗼𝗶𝗺𝗮𝗴𝗲 → sticker en image
│ ⬡ 𝗴𝗶𝗺𝗮𝗴𝗲 → image web
│ ⬡ 𝗺𝗽𝟯 → convertir en MP3
│ ⬡ 𝘀𝘀 → capture d'écran
│ ⬡ 𝗳𝗮𝗻𝗰𝘆 → texte stylé
│ ⬡ 𝘂𝗿𝗹 → info lien
│ ⬡ 𝘁𝗮𝗸𝗲 → télécharger média
│ ⬡ 🥷 → coup d'œil 
│ ⬡ 𝘃𝘃 → version v
│ ⬡ 𝗮𝗻𝘁𝗶𝗱𝗲𝗹𝗲𝘁𝗲 → anti-suppression
│ ⬡ 𝗱𝗲𝗹𝗲𝘁𝗲 → supprimer message
│ ⬡ 𝗷𝗼𝗶𝗻 → rejoindre groupe
│ ⬡ 𝗹𝗲𝗮𝘃𝗲 → quitter groupe
╰─────────────────⚔️`;

    try {
      await sock.sendMessage(from, {
        image: { url: IMAGE_MENU },
        caption: texteMenu,
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, texteMenu);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 ALLCMDS
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'allcmds') {
    await reply(sock, msg,
`⚔️ *TOUTES LES COMMANDES ${NOM_BOT}* ⚔️
Préfixe : *.*

*── 🤖 GÉNÉRAL ──*
.menu .alive .ping .dev .owner .allvar .help .allcmds

*── 👥 GROUPES ──*
.tagall · .tagadmin · .getall · .kickall
.add [num] · .linkgc · .groupinfo
.group close · .group open
.acceptall · .create [nom] · .vcf
.antilink [on/off] · .antisticker [on/off]
.antigm [on/off] · .antidelete [on/off]

*── 🎮 DIVERTISSEMENT ──*
.getpp · .goodnight · .wcg · .quizz
.anime · .profile · .couple
.poll Question|Opt1|Opt2 · .emojimix

*── 🔧 OUTILS ──*
.sticker · .toimage · .fancy [texte]
.mp3 · .ss [url] · .gimage [texte]
.url [lien] · .take

*── 🥷 SPÉCIAL ──*
.🥷 · .vv · .delete · .join [lien] · .leave

_Toutes les commandes sont publiques_ ✅
⚔️ *RAGNAR-HEX* ⚔️`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ❓ HELP
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'help') {
    await reply(sock, msg,
`⚔️ *AIDE - ${NOM_BOT}* ⚔️

*Comment utiliser le bot ?*

1️⃣ Toutes les commandes commencent par un *point (.)*
   Exemples : *.menu* · *.ping* · *.sticker*

2️⃣ Le bot répond en *privé* et dans les *groupes*

3️⃣ Pour *.sticker* → envoie une image avec *.sticker* en légende, OU réponds à une image avec *.sticker*

4️⃣ Commandes ON/OFF :
   *.antilink on* ou *.antilink off*

5️⃣ Pour les sondages :
   *.poll Question|Option1|Option2*

*Propriétaire :* ${PROPRIETAIRE_NOM}
*Version :* ${VERSION} | *Préfixe :* .
⚔️ *RAGNAR-HEX* ⚔️`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🤖 GÉNÉRAL
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'alive') {
    try {
      await sock.sendMessage(from, {
        image: { url: IMAGE_MENU },
        caption: `⚔️ *${NOM_BOT} EST ACTIF* ⚔️\n\n✅ Le bot fonctionne parfaitement !\n⏱️ Uptime : ${getUptime()}\n📌 Préfixe : .\n🔖 Version : ${VERSION}\n\n⚔️ *RAGNAR-HEX* ⚔️`,
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, `⚔️ *${NOM_BOT} EST ACTIF* ⚔️\n✅ En ligne depuis : ${getUptime()}`);
    }
    return;
  }

  if (cmd === 'ping') {
    const t = Date.now();
    await reply(sock, msg, `🏓 *PONG !*\n⚡ Latence : *${Date.now() - t}ms*\n✅ Bot opérationnel\n⚔️ ${NOM_BOT}`);
    return;
  }

  if (cmd === 'dev') {
    await reply(sock, msg,
`👨‍💻 *DÉVELOPPEUR*

⚔️ Nom : ${DEVELOPPEUR}
📱 WhatsApp : +${PROPRIETAIRE_NUM}
🤖 Bot : ${NOM_BOT}
📌 Version : ${VERSION}`);
    return;
  }

  if (cmd === 'owner') {
    await reply(sock, msg,
`👑 *PROPRIÉTAIRE*

⚔️ Nom : ${PROPRIETAIRE_NOM}
📱 Contact : wa.me/${PROPRIETAIRE_NUM}`);
    return;
  }

  if (cmd === 'allvar') {
    await reply(sock, msg,
`📊 *VARIABLES DU BOT*

• Préfixe : ${PREFIXE}
• Nom : ${NOM_BOT}
• Version : ${VERSION}
• Propriétaire : ${PROPRIETAIRE_NOM}
• Uptime : ${getUptime()}
• AntiLink : ${etat.antilink ? '✅ ON' : '❌ OFF'}
• AntiSticker : ${etat.antisticker ? '✅ ON' : '❌ OFF'}
• AntiGM : ${etat.antigm ? '✅ ON' : '❌ OFF'}
• AntiDelete : ${etat.antidelete ? '✅ ON' : '❌ OFF'}`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👥 GROUPES
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'tagall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const membres = meta.participants.map(p => p.id);
      const tags = membres.map(m => `@${m.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, {
        text: `⚔️ *TAG TOUS LES MEMBRES* ⚔️\n\n${tags}${texte ? '\n\n' + texte : ''}`,
        mentions: membres,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'tagadmin') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const admins = meta.participants.filter(p => p.admin).map(p => p.id);
      if (!admins.length) return reply(sock, msg, '❌ Aucun admin trouvé.');
      await sock.sendMessage(from, {
        text: `👮 *TAG ADMINS* 👮\n\n${admins.map(m => `@${m.split('@')[0]}`).join(' ')}`,
        mentions: admins,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'getall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const liste = meta.participants.map((p, i) =>
        `${i + 1}. +${p.id.split('@')[0]}${p.admin ? ' 👮' : ''}`
      );
      await reply(sock, msg,
        `👥 *MEMBRES - ${meta.subject}*\nTotal : ${liste.length}\n\n${liste.join('\n')}`
      );
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'kickall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
      const aVirer = meta.participants
        .filter(p => p.id !== botId && p.id !== PROPRIETAIRE_JID)
        .map(p => p.id);
      await reply(sock, msg, `⚠️ Exclusion de ${aVirer.length} membres...`);
      for (const m of aVirer) {
        await sock.groupParticipantsUpdate(from, [m], 'remove').catch(() => {});
        await new Promise(r => setTimeout(r, 700));
      }
      await reply(sock, msg, '✅ Tous les membres ont été exclus !');
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'add') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    if (!texte) return reply(sock, msg, '❌ Usage : .add 224XXXXXXXXX');
    const num = texte.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    try {
      await sock.groupParticipantsUpdate(from, [num], 'add');
      await reply(sock, msg, `✅ +${num.split('@')[0]} ajouté !`);
    } catch (e) {
      await reply(sock, msg, '❌ Impossible d\'ajouter. Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'linkgc') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const code = await sock.groupInviteCode(from);
      await reply(sock, msg, `🔗 *Lien du groupe :*\nhttps://chat.whatsapp.com/${code}`);
    } catch (e) {
      await reply(sock, msg, '❌ Impossible d\'obtenir le lien. Le bot doit être admin.');
    }
    return;
  }

  if (cmd === 'groupinfo') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const admins = meta.participants.filter(p => p.admin).length;
      const date = new Date(meta.creation * 1000).toLocaleDateString('fr-FR');
      await reply(sock, msg,
`📊 *INFOS GROUPE*

📛 Nom : ${meta.subject}
👥 Membres : ${meta.participants.length}
👮 Admins : ${admins}
📅 Créé le : ${date}
📝 Description : ${meta.desc || 'Aucune'}`);
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'group') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      if (texte === 'close') {
        await sock.groupSettingUpdate(from, 'announcement');
        await reply(sock, msg, '🔒 Groupe fermé. Seuls les admins peuvent écrire.');
      } else if (texte === 'open') {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await reply(sock, msg, '🔓 Groupe ouvert. Tout le monde peut écrire.');
      } else {
        await reply(sock, msg, '❌ Usage : .group close | .group open');
      }
    } catch (e) {
      await reply(sock, msg, '❌ Le bot doit être admin pour cette commande.');
    }
    return;
  }

  if (cmd === 'acceptall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const demandes = await sock.groupRequestParticipantsList(from);
      if (!demandes || !demandes.length) return reply(sock, msg, '📭 Aucune demande en attente.');
      await sock.groupRequestParticipantsUpdate(from, demandes.map(d => d.jid), 'approve');
      await reply(sock, msg, `✅ ${demandes.length} demande(s) acceptée(s) !`);
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'create') {
    if (!texte) return reply(sock, msg, '❌ Usage : .create NomDuGroupe');
    try {
      const g = await sock.groupCreate(texte, [PROPRIETAIRE_JID]);
      await reply(sock, msg, `✅ Groupe *${texte}* créé !\nID : ${g.id}`);
    } catch (e) {
      await reply(sock, msg, '❌ Erreur création : ' + e.message);
    }
    return;
  }

  if (cmd === 'vcf') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      let vcf = '';
      meta.participants.forEach((p, i) => {
        vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:Membre ${i + 1}\nTEL:+${p.id.split('@')[0]}\nEND:VCARD\n`;
      });
      const fichier = `/tmp/vcf_${Date.now()}.vcf`;
      fs.writeFileSync(fichier, vcf);
      await sock.sendMessage(from, {
        document: fs.readFileSync(fichier),
        mimetype: 'text/vcard',
        fileName: `membres_${meta.subject}.vcf`,
        caption: `📋 ${meta.participants.length} contacts exportés ⚔️`,
      }, { quoted: msg });
      fs.unlinkSync(fichier);
    } catch (e) {
      await reply(sock, msg, '❌ Erreur VCF : ' + e.message);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ ON/OFF
  // ═══════════════════════════════════════════════════════════════════════════
  const systemes = {
    antilink: 'AntiLink',
    antisticker: 'AntiSticker',
    antigm: 'AntiGM',
    antidelete: 'AntiDelete',
  };

  if (systemes[cmd]) {
    const nom = systemes[cmd];
    if (texte === 'on') {
      etat[cmd] = true;
      await reply(sock, msg, `✅ ${nom} activé !`);
    } else if (texte === 'off') {
      etat[cmd] = false;
      await reply(sock, msg, `❌ ${nom} désactivé.`);
    } else {
      await reply(sock, msg, `ℹ️ ${nom} : ${etat[cmd] ? '✅ ON' : '❌ OFF'}\nUsage : .${cmd} on | .${cmd} off`);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎮 DIVERTISSEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'goodnight') {
    const msgs = [
      '🌙 Bonne nuit ! Que tes rêves soient doux ⭐',
      '😴 Repose-toi bien, demain sera meilleur 🌙',
      '🌙 Bonne nuit à tous ! ⚔️ RAGNAR-HEX',
      '💤 La nuit porte conseil... Bonne nuit ! ✨',
    ];
    await reply(sock, msg, msgs[Math.floor(Math.random() * msgs.length)]);
    return;
  }

  if (cmd === 'getpp') {
    let cible = sender;
    const mentionnes = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentionnes?.length) cible = mentionnes[0];
    try {
      const pp = await sock.profilePictureUrl(cible, 'image');
      await sock.sendMessage(from, {
        image: { url: pp },
        caption: `📸 Photo de profil de @${cible.split('@')[0]}`,
        mentions: [cible],
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, '❌ Pas de photo de profil ou profil privé.');
    }
    return;
  }

  if (cmd === 'profile') {
    try {
      const pp = await sock.profilePictureUrl(sender, 'image').catch(() => null);
      const texteP = `👤 *TON PROFIL*\n\n📱 Numéro : +${sender.split('@')[0]}\n⚔️ Bot : ${NOM_BOT}`;
      if (pp) {
        await sock.sendMessage(from, { image: { url: pp }, caption: texteP }, { quoted: msg });
      } else {
        await reply(sock, msg, texteP + '\n_(Pas de photo)_');
      }
    } catch {
      await reply(sock, msg, '❌ Impossible de charger le profil.');
    }
    return;
  }

  if (cmd === 'couple') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const m = meta.participants;
      if (m.length < 2) return reply(sock, msg, '❌ Pas assez de membres.');
      const a = m[Math.floor(Math.random() * m.length)];
      let b = m[Math.floor(Math.random() * m.length)];
      while (b.id === a.id) b = m[Math.floor(Math.random() * m.length)];
      await sock.sendMessage(from, {
        text: `💑 *COUPLE DU JOUR* 💑\n\n❤️ @${a.id.split('@')[0]}\n🤝 avec\n❤️ @${b.id.split('@')[0]}\n\n_Félicitations !_ ⚔️`,
        mentions: [a.id, b.id],
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'wcg') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const top = [...meta.participants].sort(() => Math.random() - 0.5).slice(0, 5);
      const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
      let txt = `🏆 *CLASSEMENT DU GROUPE* 🏆\n\n`;
      top.forEach((m, i) => {
        txt += `${emojis[i]} @${m.id.split('@')[0]} — ${Math.floor(Math.random() * 9000) + 1000} pts\n`;
      });
      await sock.sendMessage(from, { text: txt, mentions: top.map(m => m.id) }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'quizz') {
    const qs = [
      { q: 'Quelle est la capitale de la Guinée ?', r: 'Conakry' },
      { q: 'Combien font 7 × 8 ?', r: '56' },
      { q: 'Quel est le plus grand océan du monde ?', r: 'Pacifique' },
      { q: 'En quelle année a commencé la 1ère Guerre mondiale ?', r: '1914' },
      { q: 'Combien de continents y a-t-il ?', r: '7' },
      { q: 'Quel est l\'animal terrestre le plus rapide ?', r: 'Guépard' },
      { q: 'Quelle est la capitale de la France ?', r: 'Paris' },
      { q: 'Quel est le pays le plus peuplé du monde ?', r: 'Inde' },
      { q: 'Quelle est la monnaie du Japon ?', r: 'Yen' },
      { q: 'Combien de côtés a un hexagone ?', r: '6' },
    ];
    const q = qs[Math.floor(Math.random() * qs.length)];
    await reply(sock, msg,
      `🧠 *QUIZ ${NOM_BOT}*\n\n❓ ${q.q}\n\n_Réponds dans les 30 secondes !_\n\n||✅ Réponse : ${q.r}||`
    );
    return;
  }

  if (cmd === 'anime') {
    try {
      const endpoints = ['waifu', 'neko', 'shinobu', 'megumin', 'wave'];
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await axios.get(`https://api.waifu.pics/sfw/${ep}`, { timeout: 8000 });
      await sock.sendMessage(from, {
        image: { url: res.data.url },
        caption: `🎌 *ANIME* ⚔️ ${NOM_BOT}`,
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, '❌ Impossible de charger l\'image anime. Réessaie !');
    }
    return;
  }

  if (cmd === 'poll') {
    if (!texte) return reply(sock, msg, '❌ Usage : .poll Question|Option1|Option2');
    const parts = texte.split('|');
    if (parts.length < 3) return reply(sock, msg, '❌ Il faut au moins 2 options.\nExemple : .poll Qui est le meilleur ?|Ragnar|Bjorn');
    try {
      await sock.sendMessage(from, {
        poll: {
          name: parts[0].trim(),
          values: parts.slice(1).map(o => o.trim()),
          selectableCount: 1,
        },
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur sondage : ' + e.message);
    }
    return;
  }

  if (cmd === 'emojimix') {
    if (!texte) return reply(sock, msg, '❌ Usage : .emojimix 😊+🔥');
    await reply(sock, msg, `😄 *EMOJI MIX*\n\nEmojis : ${texte}\nRésultat : ${texte.replace(/\+/g, '')} ⚔️`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 OUTILS
  // ═══════════════════════════════════════════════════════════════════════════

  if (cmd === 'sticker') {
    // Accepter : image envoyée directement avec .sticker en caption OU réponse à une image
    let buffer = null;
    let mediaType = null;

    // Cas 1 : image envoyée directement avec la commande en caption
    const directType = getContentType(msg.message);
    if (directType === 'imageMessage' || directType === 'videoMessage') {
      try {
        buffer = await downloadMediaMessage(msg, 'buffer', {}, {
          logger: { info: () => {}, error: () => {}, warn: () => {} },
          reuploadRequest: sock.updateMediaMessage,
        });
        mediaType = directType;
      } catch (e) {
        console.error('Erreur dl direct:', e.message);
      }
    }

    // Cas 2 : réponse à une image/vidéo
    if (!buffer) {
      const media = await getQuotedMedia(sock, msg);
      if (media && (media.type === 'imageMessage' || media.type === 'videoMessage')) {
        buffer = media.buffer;
        mediaType = media.type;
      }
    }

    if (!buffer) {
      return reply(sock, msg, '❌ Envoie une image avec *.sticker* en légende, OU réponds à une image avec *.sticker*');
    }

    try {
      await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur sticker : ' + e.message);
    }
    return;
  }

  if (cmd === 'toimage') {
    const media = await getQuotedMedia(sock, msg);
    if (!media || media.type !== 'stickerMessage') {
      // Essai direct
      const directType = getContentType(msg.message);
      if (directType !== 'stickerMessage') {
        return reply(sock, msg, '❌ Réponds à un sticker avec *.toimage*');
      }
      try {
        const buf = await downloadMediaMessage(msg, 'buffer', {}, {
          logger: { info: () => {}, error: () => {}, warn: () => {} },
          reuploadRequest: sock.updateMediaMessage,
        });
        await sock.sendMessage(from, { image: buf, caption: '🖼️ Sticker → Image ⚔️' }, { quoted: msg });
      } catch (e) {
        await reply(sock, msg, '❌ Erreur : ' + e.message);
      }
      return;
    }
    try {
      await sock.sendMessage(from, { image: media.buffer, caption: '🖼️ Sticker → Image ⚔️' }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  if (cmd === 'fancy') {
    if (!texte) return reply(sock, msg, '❌ Usage : .fancy [texte]');
    const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bold = [...'𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'];
    const toBold = t => [...t].map(c => { const i = map.indexOf(c); return i === -1 ? c : bold[i]; }).join('');
    await reply(sock, msg,
      `✨ *TEXTE STYLÉ*\n\n*Gras :* ${toBold(texte)}\n*Espacé :* ${texte.split('').join(' ')}\n*Majuscules :* ${texte.toUpperCase()}\n\n⚔️ ${NOM_BOT}`
    );
    return;
  }

  if (cmd === 'gimage') {
    if (!texte) return reply(sock, msg, '❌ Usage : .gimage [recherche]');
    try {
      await sock.sendMessage(from, {
        image: { url: `https://source.unsplash.com/800x600/?${encodeURIComponent(texte)}` },
        caption: `🔍 Image pour : *${texte}* ⚔️`,
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, `❌ Impossible de trouver une image pour : ${texte}`);
    }
    return;
  }

  if (cmd === 'ss') {
    if (!texte) return reply(sock, msg, '❌ Usage : .ss [url du site]');
    try {
      const ssUrl = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(texte)}`;
      await sock.sendMessage(from, {
        image: { url: ssUrl },
        caption: `📸 Capture de : ${texte} ⚔️`,
      }, { quoted: msg });
    } catch {
      await reply(sock, msg, '❌ Capture impossible. Vérifie l\'URL.');
    }
    return;
  }

  if (cmd === 'url') {
    if (!texte) return reply(sock, msg, '❌ Usage : .url [lien]');
    try {
      const domain = new URL(texte).hostname;
      await reply(sock, msg, `🔗 *INFO LIEN*\n\n📎 URL : ${texte}\n🌐 Domaine : ${domain}\n⚔️ ${NOM_BOT}`);
    } catch {
      await reply(sock, msg, `🔗 Lien reçu : ${texte}`);
    }
    return;
  }

  if (cmd === 'mp3') {
    await reply(sock, msg,
      '🎵 *Conversion MP3*\n\nEnvoie une vidéo avec *.mp3* en légende.\n\n⚠️ Nécessite ffmpeg. Disponible en hébergement local uniquement.'
    );
    return;
  }

  if (cmd === 'take') {
    let buffer = null;
    let type = null;

    // Essai direct
    const directType = getContentType(msg.message);
    if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(directType)) {
      try {
        buffer = await downloadMediaMessage(msg, 'buffer', {}, {
          logger: { info: () => {}, error: () => {}, warn: () => {} },
          reuploadRequest: sock.updateMediaMessage,
        });
        type = directType;
      } catch {}
    }

    // Essai via réponse
    if (!buffer) {
      const media = await getQuotedMedia(sock, msg);
      if (media) { buffer = media.buffer; type = media.type; }
    }

    if (!buffer) return reply(sock, msg, '❌ Envoie un média avec *.take* ou réponds à un média.');

    const exts = { imageMessage: 'jpg', videoMessage: 'mp4', audioMessage: 'mp3', documentMessage: 'bin', stickerMessage: 'webp' };
    const mimes = { imageMessage: 'image/jpeg', videoMessage: 'video/mp4', audioMessage: 'audio/mp4', documentMessage: 'application/octet-stream', stickerMessage: 'image/webp' };

    try {
      await sock.sendMessage(from, {
        document: buffer,
        mimetype: mimes[type] || 'application/octet-stream',
        fileName: `ragnar_hex_${Date.now()}.${exts[type] || 'bin'}`,
        caption: `📥 Média récupéré ⚔️ ${NOM_BOT}`,
      }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Erreur : ' + e.message);
    }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🥷 SPÉCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === '🥷') {
    await reply(sock, msg,
      `⚔️ *COMMANDE NINJA* ⚔️\n\n🥷 Les vues uniques reçues par le bot sont interceptées automatiquement et envoyées dans ton DM.\n\n✅ Activée en permanence !\n⚔️ ${NOM_BOT}`
    );
    return;
  }

  if (cmd === 'vv') {
    // Chercher le message cité
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.quotedMessage) return reply(sock, msg, '❌ Réponds à une vue unique avec *.vv*');
    const quoted = ctx.quotedMessage;
    const t = getContentType(quoted);
    const isViewOnce = t === 'viewOnceMessage' || t === 'viewOnceMessageV2' || t === 'viewOnceMessageV2Extension';
    if (!isViewOnce) return reply(sock, msg, '❌ Ce message n\'est pas une vue unique.');
    try {
      const inner = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message || quoted.viewOnceMessageV2Extension?.message;
      await sock.sendMessage(from, { forward: { ...msg, message: inner } }, { quoted: msg });
    } catch (e) {
      await reply(sock, msg, '❌ Impossible d\'ouvrir : ' + e.message);
    }
    return;
  }

  if (cmd === 'delete') {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) return reply(sock, msg, '❌ Réponds au message à supprimer avec *.delete*');
    try {
      await sock.sendMessage(from, {
        delete: {
          remoteJid: from,
          fromMe: false,
          id: ctx.stanzaId,
          participant: ctx.participant,
        },
      });
    } catch (e) {
      await reply(sock, msg, '❌ Impossible de supprimer : ' + e.message);
    }
    return;
  }

  if (cmd === 'join') {
    if (!texte) return reply(sock, msg, '❌ Usage : .join [lien du groupe]');
    const match = texte.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
    if (!match) return reply(sock, msg, '❌ Lien invalide.\nExemple : https://chat.whatsapp.com/XXXXXX');
    try {
      await sock.groupAcceptInvite(match[1]);
      await reply(sock, msg, '✅ Groupe rejoint avec succès !');
    } catch (e) {
      await reply(sock, msg, '❌ Lien expiré ou invalide : ' + e.message);
    }
    return;
  }

  if (cmd === 'leave') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans un groupe.');
    await reply(sock, msg, `👋 Au revoir ! ⚔️ ${NOM_BOT}`);
    setTimeout(() => sock.groupLeave(from).catch(() => {}), 2000);
    return;
  }
}

module.exports = { handleCommands, etat };
