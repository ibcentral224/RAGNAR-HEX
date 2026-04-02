const {
  getContentType,
  downloadMediaMessage,
} = require('@whiskeysockets/baileys');

const axios = require('axios');
const fs = require('fs');

// ─── Configuration ────────────────────────────────────────────────────────────
const PREFIXE = '.';
const NOM_BOT = '𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗';
const PROPRIETAIRE_NUM = '224621963059';
const PROPRIETAIRE_JID = '224621963059@s.whatsapp.net';
const DEVELOPPEUR = 'Ibrahim Sory Sacko';
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
  // Si c'est un message envoyé depuis son propre DM (self-chat), le sender = remoteJid
  if (msg.key.fromMe) return msg.key.remoteJid;
  return msg.key.participant || msg.key.remoteJid;
}

function isGroupe(msg) {
  return msg.key.remoteJid.endsWith('@g.us');
}

async function reply(sock, msg, text) {
  await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

async function isAdmin(sock, groupId, jid) {
  try {
    const meta = await sock.groupMetadata(groupId);
    return meta.participants.some(
      p => p.id === jid && (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch { return false; }
}

// ═══════════════════════════════════════════════════════════════════════════════
//                        GESTIONNAIRE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
async function handleCommands(sock, msg) {

  // ── Extraire le corps du message ───────────────────────────────────────────
  const body =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';

  // ── Vérifier le préfixe ────────────────────────────────────────────────────
  if (!body.startsWith(PREFIXE)) return;

  const args = body.slice(PREFIXE.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();
  const texte = args.join(' ');
  const from = msg.key.remoteJid;
  const sender = getSender(msg);
  const groupe = isGroupe(msg);

  console.log(`⚡ Commande reçue: "${cmd}" | texte: "${texte}" | depuis: ${from}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 MENU
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'menu') {
    const texteMenu = `╭──𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗──────⚔️
│ 𝗕𝗼𝘁 : ${NOM_BOT}
│ 𝗨𝗽𝘁𝗶𝗺𝗲 : ${getUptime()}
│ 𝗠𝗼𝗱𝗲 : Privé & Groupes
│ 𝗣𝗿𝗲𝗳𝗶𝘅𝗲 : .
│ 𝗣𝗿𝗼𝗽𝗿𝗶𝗲́𝘁𝗮𝗶𝗿𝗲 : Ibrahima Sory Sacko
│ 𝗗𝗲́𝘃𝗲𝗹𝗼𝗽𝗽𝗲𝘂𝗿 : Ibrahim Sory Sacko
│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${VERSION}
╰────────────────⚔️
⚔️────────────────⚔️
   🥷𝐑𝐀𝐆𝐍𝐀𝐑-𝐇𝐄𝐗🥷
⚔️────────────────⚔️
⚔️─────────────────⚔️
『 𝗠𝗘𝗡𝗨-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗺𝗲𝗻𝘂 → afficher le menu
│ ⬡ 𝗮𝗹𝗶𝘃𝗲 → état du bot
│ ⬡ 𝗱𝗲𝘃 → développeur
│ ⬡ 𝗮𝗹𝗹𝘃𝗮𝗿 → variables du bot
│ ⬡ 𝗽𝗶𝗻𝗴 → vitesse du bot
│ ⬡ 𝗼𝘄𝗻𝗲𝗿 → propriétaire
│ ⬡ 𝗵𝗲𝗹𝗽 → aide
│ ⬡ 𝗮𝗹𝗹𝗰𝗺𝗱𝘀 → toutes les commandes
╰─────────────────⚔️
⚔️─────────────────⚔️
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
⚔️─────────────────⚔️
『 𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗴𝗲𝘁𝗽𝗽 → photo de profil
│ ⬡ 𝗴𝗼𝗼𝗱𝗻𝗶𝗴𝗵𝘁 → bonne nuit
│ ⬡ 𝘄𝗰𝗴 → classement
│ ⬡ 𝗾𝘂𝗶𝘇𝘇 → quiz
│ ⬡ 𝗮𝗻𝗶𝗺𝗲 → image anime
│ ⬡ 𝗽𝗿𝗼𝗳𝗶𝗹𝗲 → ton profil
│ ⬡ 𝗰𝗼𝘂𝗽𝗹𝗲 → couple aléatoire
│ ⬡ 𝗽𝗼𝗹𝗹 → sondage
│ ⬡ 𝗲𝗺𝗼𝗷𝗶𝗺𝗶𝘅 → mélange emojis
╰─────────────────⚔️
⚔️─────────────────⚔️
『 𝗢𝗨𝗧𝗜𝗟𝗦-𝗥𝗔𝗚𝗡𝗔𝗥 』
│ ⬡ 𝗮𝘁𝘁𝗽 → texte en sticker
│ ⬡ 𝘁𝗼𝗶𝗺𝗮𝗴𝗲 → sticker en image
│ ⬡ 𝗴𝗶𝗺𝗮𝗴𝗲 → image web
│ ⬡ 𝗺𝗽𝟯 → convertir en MP3
│ ⬡ 𝘀𝘀 → capture d'écran
│ ⬡ 𝗳𝗮𝗻𝗰𝘆 → texte stylé
│ ⬡ 𝘂𝗿𝗹 → info lien
│ ⬡ 𝘀𝘁𝗶𝗰𝗸𝗲𝗿 → créer sticker
│ ⬡ 𝘁𝗮𝗸𝗲 → télécharger média
│ ⬡ 🥷 → un coup d'œil 
│ ⬡ 𝘃𝘃 → voire plus 
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
  // 📋 ALLCMDS
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'allcmds') {
    await reply(sock, msg, `⚔️ *TOUTES LES COMMANDES ${NOM_BOT}* ⚔️
Préfixe : *.*

*── 🤖 GÉNÉRAL ──*
.menu · .alive · .ping · .dev · .owner · .allvar · .help · .allcmds

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
.url [lien] · .take · .attp [texte]

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
    await reply(sock, msg, `⚔️ *AIDE - ${NOM_BOT}* ⚔️

*Comment utiliser le bot ?*

1️⃣ Toutes les commandes commencent par un *point (.)*
   Exemple : *.menu* · *.ping* · *.sticker*

2️⃣ Le bot répond en *privé* et dans les *groupes*

3️⃣ Pour *.sticker* → réponds à une image avec la commande

4️⃣ Commandes ON/OFF :
   *.antilink on* ou *.antilink off*

5️⃣ Pour les sondages :
   *.poll Question|Option1|Option2*

6️⃣ Pour tagger quelqu'un :
   *.getpp @contact*

*Commandes pour démarrer :*
• *.menu* → Menu complet avec image
• *.allcmds* → Liste toutes les commandes
• *.ping* → Tester si le bot répond
• *.alive* → Voir si le bot est actif

*Propriétaire :* Ibrahima Sory Sacko
*Version :* ${VERSION} | *Préfixe :* .

_Toutes les commandes sont publiques_ ✅
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
      await reply(sock, msg, `⚔️ *${NOM_BOT} EST ACTIF* ⚔️\n\n✅ Parfaitement opérationnel !\n⏱️ Uptime : ${getUptime()}`);
    }
    return;
  }

  if (cmd === 'ping') {
    const t = Date.now();
    await sock.sendMessage(from, { text: '🏓 ...' }, { quoted: msg });
    const latence = Date.now() - t;
    await reply(sock, msg, `🏓 *PONG !*\n⚡ Latence : *${latence}ms*\n✅ Bot opérationnel\n⚔️ ${NOM_BOT}`);
    return;
  }

  if (cmd === 'dev') {
    await reply(sock, msg, `👨‍💻 *DÉVELOPPEUR*\n\n⚔️ Nom : ${DEVELOPPEUR}\n📱 WhatsApp : +${PROPRIETAIRE_NUM}\n🤖 Bot : ${NOM_BOT}\n📌 Version : ${VERSION}\n\n_Créé avec ❤️_`);
    return;
  }

  if (cmd === 'owner') {
    await reply(sock, msg, `👑 *PROPRIÉTAIRE*\n\n⚔️ Nom : Ibrahima Sory Sacko\n📱 Contact : wa.me/${PROPRIETAIRE_NUM}\n\n_Pour toute question, contacte le propriétaire._`);
    return;
  }

  if (cmd === 'allvar') {
    await reply(sock, msg, `📊 *VARIABLES DU BOT*\n\n• Préfixe : ${PREFIXE}\n• Nom : ${NOM_BOT}\n• Version : ${VERSION}\n• Développeur : ${DEVELOPPEUR}\n• Uptime : ${getUptime()}\n• AntiLink : ${etat.antilink ? '✅ ON' : '❌ OFF'}\n• AntiSticker : ${etat.antisticker ? '✅ ON' : '❌ OFF'}\n• AntiGM : ${etat.antigm ? '✅ ON' : '❌ OFF'}\n• AntiDelete : ${etat.antidelete ? '✅ ON' : '❌ OFF'}`);
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
        text: `⚔️ *TAG TOUS LES MEMBRES* ⚔️\n\n${tags}\n\n${texte || ''}`.trim(),
        mentions: membres,
      }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Erreur.'); }
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
    } catch { await reply(sock, msg, '❌ Erreur.'); }
    return;
  }

  if (cmd === 'getall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const liste = meta.participants.map((p, i) => `${i + 1}. +${p.id.split('@')[0]}${p.admin ? ' 👮' : ''}`);
      await reply(sock, msg, `👥 *MEMBRES - ${meta.subject}*\nTotal : ${liste.length}\n\n${liste.join('\n')}`);
    } catch { await reply(sock, msg, '❌ Erreur.'); }
    return;
  }

  if (cmd === 'kickall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const botId = sock.user.id.replace(/:\d+/, '') + '@s.whatsapp.net';
      const aVirer = meta.participants.filter(p => p.id !== botId && p.id !== PROPRIETAIRE_JID).map(p => p.id);
      await reply(sock, msg, `⚠️ Exclusion de ${aVirer.length} membres en cours...`);
      for (const m of aVirer) {
        await sock.groupParticipantsUpdate(from, [m], 'remove').catch(() => {});
        await new Promise(r => setTimeout(r, 600));
      }
      await reply(sock, msg, '✅ Tous les membres ont été exclus !');
    } catch { await reply(sock, msg, '❌ Erreur kickall.'); }
    return;
  }

  if (cmd === 'add') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    if (!texte) return reply(sock, msg, '❌ Usage : .add 224XXXXXXXXX');
    const num = texte.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    try {
      await sock.groupParticipantsUpdate(from, [num], 'add');
      await reply(sock, msg, `✅ +${num.split('@')[0]} ajouté !`);
    } catch { await reply(sock, msg, '❌ Impossible d\'ajouter ce numéro.'); }
    return;
  }

  if (cmd === 'linkgc') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const code = await sock.groupInviteCode(from);
      await reply(sock, msg, `🔗 *Lien du groupe :*\nhttps://chat.whatsapp.com/${code}`);
    } catch { await reply(sock, msg, '❌ Impossible d\'obtenir le lien.'); }
    return;
  }

  if (cmd === 'groupinfo') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const meta = await sock.groupMetadata(from);
      const admins = meta.participants.filter(p => p.admin).length;
      const date = new Date(meta.creation * 1000).toLocaleDateString('fr-FR');
      await reply(sock, msg, `📊 *INFOS GROUPE*\n\n📛 Nom : ${meta.subject}\n👥 Membres : ${meta.participants.length}\n👮 Admins : ${admins}\n📅 Créé le : ${date}\n📝 Description : ${meta.desc || 'Aucune'}`);
    } catch { await reply(sock, msg, '❌ Erreur.'); }
    return;
  }

  if (cmd === 'group') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    if (args[0] === 'close') {
      await sock.groupSettingUpdate(from, 'announcement');
      await reply(sock, msg, '🔒 Groupe fermé. Seuls les admins peuvent écrire.');
    } else if (args[0] === 'open') {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await reply(sock, msg, '🔓 Groupe ouvert. Tout le monde peut écrire.');
    } else {
      await reply(sock, msg, '❌ Usage : .group close | .group open');
    }
    return;
  }

  if (cmd === 'acceptall') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans les groupes.');
    try {
      const demandes = await sock.groupRequestParticipantsList(from);
      if (!demandes.length) return reply(sock, msg, '📭 Aucune demande en attente.');
      await sock.groupRequestParticipantsUpdate(from, demandes.map(d => d.jid), 'approve');
      await reply(sock, msg, `✅ ${demandes.length} demande(s) acceptée(s) !`);
    } catch { await reply(sock, msg, '❌ Erreur.'); }
    return;
  }

  if (cmd === 'create') {
    if (!texte) return reply(sock, msg, '❌ Usage : .create NomDuGroupe');
    try {
      const g = await sock.groupCreate(texte, [PROPRIETAIRE_JID]);
      await reply(sock, msg, `✅ Groupe *${texte}* créé !\nID : ${g.id}`);
    } catch { await reply(sock, msg, '❌ Erreur création groupe.'); }
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
        caption: `📋 ${meta.participants.length} contacts exportés`,
      }, { quoted: msg });
      fs.unlinkSync(fichier);
    } catch { await reply(sock, msg, '❌ Erreur VCF.'); }
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🛡️ ON/OFF
  // ═══════════════════════════════════════════════════════════════════════════
  for (const sys of ['antilink', 'antisticker', 'antigm', 'antidelete']) {
    if (cmd === sys) {
      const noms = { antilink: 'AntiLink', antisticker: 'AntiSticker', antigm: 'AntiGM', antidelete: 'AntiDelete' };
      if (texte === 'on') {
        etat[sys] = true;
        await reply(sock, msg, `✅ ${noms[sys]} activé !`);
      } else if (texte === 'off') {
        etat[sys] = false;
        await reply(sock, msg, `❌ ${noms[sys]} désactivé.`);
      } else {
        await reply(sock, msg, `ℹ️ ${noms[sys]} : ${etat[sys] ? '✅ ON' : '❌ OFF'}\nUsage : .${sys} on | .${sys} off`);
      }
      return;
    }
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
    } catch { await reply(sock, msg, '❌ Pas de photo de profil ou profil privé.'); }
    return;
  }

  if (cmd === 'profile') {
    try {
      const pp = await sock.profilePictureUrl(sender, 'image').catch(() => null);
      const texteP = `👤 *TON PROFIL*\n\n📱 Numéro : +${sender.split('@')[0]}\n⚔️ Bot : ${NOM_BOT}`;
      if (pp) {
        await sock.sendMessage(from, { image: { url: pp }, caption: texteP }, { quoted: msg });
      } else {
        await reply(sock, msg, texteP + '\n_(Pas de photo de profil)_');
      }
    } catch { await reply(sock, msg, '❌ Impossible de charger le profil.'); }
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
    } catch { await reply(sock, msg, '❌ Erreur.'); }
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
    } catch { await reply(sock, msg, '❌ Erreur.'); }
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
      { q: 'Quel est le pays le plus grand du monde ?', r: 'Russie' },
    ];
    const q = qs[Math.floor(Math.random() * qs.length)];
    await reply(sock, msg, `🧠 *QUIZ ${NOM_BOT}*\n\n❓ ${q.q}\n\n_Réponds dans les 30 secondes !_\n\n||✅ Réponse : ${q.r}||`);
    return;
  }

  if (cmd === 'anime') {
    try {
      const endpoints = ['waifu', 'neko', 'shinobu', 'megumin'];
      const ep = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = await axios.get(`https://api.waifu.pics/sfw/${ep}`, { timeout: 8000 });
      await sock.sendMessage(from, {
        image: { url: res.data.url },
        caption: `🎌 *ANIME* ⚔️ ${NOM_BOT}`,
      }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Impossible de charger l\'image anime.'); }
    return;
  }

  if (cmd === 'poll') {
    if (!texte) return reply(sock, msg, '❌ Usage : .poll Question|Option1|Option2');
    const parts = texte.split('|');
    if (parts.length < 3) return reply(sock, msg, '❌ Il faut au moins 2 options.\nUsage : .poll Question|Opt1|Opt2');
    try {
      await sock.sendMessage(from, {
        poll: {
          name: parts[0].trim(),
          values: parts.slice(1).map(o => o.trim()),
          selectableCount: 1,
        },
      }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Erreur sondage.'); }
    return;
  }

  if (cmd === 'emojimix') {
    await reply(sock, msg, `😄 *EMOJI MIX*\n\n${texte || '😊+🔥'}\nRésultat : ${texte ? texte.replace(/\+/g, '') : '😊🔥'}\n\n⚔️ ${NOM_BOT}`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔧 OUTILS
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === 'sticker') {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply(sock, msg, '❌ Réponds à une image avec *.sticker*');
    const t = getContentType(quoted);
    if (!['imageMessage', 'videoMessage'].includes(t)) return reply(sock, msg, '❌ Réponds à une image ou vidéo.');
    try {
      const buf = await downloadMediaMessage(
        { message: quoted, key: msg.message.extendedTextMessage.contextInfo },
        'buffer', {},
        { logger: { info: () => {}, error: () => {} } }
      );
      await sock.sendMessage(from, { sticker: buf }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Erreur sticker. Essaie avec une image simple.'); }
    return;
  }

  if (cmd === 'toimage') {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted?.stickerMessage) return reply(sock, msg, '❌ Réponds à un sticker avec *.toimage*');
    try {
      const buf = await downloadMediaMessage(
        { message: quoted, key: {} }, 'buffer', {},
        { logger: { info: () => {}, error: () => {} } }
      );
      await sock.sendMessage(from, { image: buf, caption: '🖼️ Sticker → Image ⚔️' }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Erreur conversion.'); }
    return;
  }

  if (cmd === 'fancy') {
    if (!texte) return reply(sock, msg, '❌ Usage : .fancy [texte]');
    const bold = (t) => [...t].map(c => {
      const n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.indexOf(c);
      return n === -1 ? c : [...'𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'][n];
    }).join('');
    await reply(sock, msg, `✨ *TEXTE STYLÉ*\n\n${bold(texte)}\n\n${texte.split('').join(' ')}\n\n⚔️ ${NOM_BOT}`);
    return;
  }

  if (cmd === 'gimage') {
    if (!texte) return reply(sock, msg, '❌ Usage : .gimage [recherche]');
    try {
      await sock.sendMessage(from, {
        image: { url: `https://source.unsplash.com/800x600/?${encodeURIComponent(texte)}` },
        caption: `🔍 Image : *${texte}* ⚔️`,
      }, { quoted: msg });
    } catch { await reply(sock, msg, `❌ Impossible de trouver une image pour : ${texte}`); }
    return;
  }

  if (cmd === 'ss') {
    if (!texte) return reply(sock, msg, '❌ Usage : .ss [url]');
    try {
      const ssUrl = `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(texte)}`;
      await sock.sendMessage(from, {
        image: { url: ssUrl },
        caption: `📸 Capture : ${texte}`,
      }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Capture impossible.'); }
    return;
  }

  if (cmd === 'url') {
    if (!texte) return reply(sock, msg, '❌ Usage : .url [lien]');
    try {
      const domain = new URL(texte).hostname;
      await reply(sock, msg, `🔗 *INFO LIEN*\n\n📎 URL : ${texte}\n🌐 Domaine : ${domain}`);
    } catch { await reply(sock, msg, `🔗 Lien : ${texte}`); }
    return;
  }

  if (cmd === 'mp3') {
    await reply(sock, msg, '🎵 *Conversion MP3*\n\nRéponds à une vidéo avec *.mp3*\n⚠️ Fonctionne en local. Sur Render, ffmpeg est limité.');
    return;
  }

  if (cmd === 'take') {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply(sock, msg, '❌ Réponds à un média avec *.take*');
    try {
      const t = getContentType(quoted);
      const buf = await downloadMediaMessage(
        { message: quoted, key: {} }, 'buffer', {},
        { logger: { info: () => {}, error: () => {} } }
      );
      const exts = { imageMessage: 'jpg', videoMessage: 'mp4', audioMessage: 'mp3', documentMessage: 'bin' };
      const mimes = { imageMessage: 'image/jpeg', videoMessage: 'video/mp4', audioMessage: 'audio/mp4', documentMessage: 'application/octet-stream' };
      await sock.sendMessage(from, {
        document: buf,
        mimetype: mimes[t] || 'application/octet-stream',
        fileName: `ragnar_hex.${exts[t] || 'bin'}`,
        caption: `📥 Média récupéré ⚔️ ${NOM_BOT}`,
      }, { quoted: msg });
    } catch { await reply(sock, msg, '❌ Erreur récupération média.'); }
    return;
  }

  if (cmd === 'attp') {
    if (!texte) return reply(sock, msg, '❌ Usage : .attp [texte]');
    await reply(sock, msg, `🎨 *Texte en Sticker*\n\nTexte : "${texte}"\n\n⚠️ API externe requise. Utilise *.sticker* sur une image avec du texte.`);
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🥷 SPÉCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  if (cmd === '🥷') {
    await reply(sock, msg, `⚔️ *COMMANDE RAGNAR NINJA* ⚔️\n\n🥷 Cette fonction intercepte automatiquement toutes les *vues uniques* reçues par le bot et les transfère directement dans le *DM du propriétaire*.\n\n✅ Activée en permanence et en arrière-plan !\n\n⚔️ ${NOM_BOT}`);
    return;
  }

  if (cmd === 'vv') {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply(sock, msg, '❌ Réponds à une vue unique avec *.vv*');
    const t = getContentType(quoted);
    if (t === 'viewOnceMessage' || t === 'viewOnceMessageV2') {
      try {
        const inner = quoted.viewOnceMessage?.message || quoted.viewOnceMessageV2?.message;
        await sock.sendMessage(from, { forward: { ...msg, message: inner } }, { quoted: msg });
      } catch { await reply(sock, msg, '❌ Impossible d\'ouvrir cette vue unique.'); }
    } else {
      await reply(sock, msg, '❌ Ce message n\'est pas une vue unique.');
    }
    return;
  }

  if (cmd === 'delete') {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx) return reply(sock, msg, '❌ Réponds au message à supprimer avec *.delete*');
    try {
      await sock.sendMessage(from, {
        delete: { remoteJid: from, fromMe: false, id: ctx.stanzaId, participant: ctx.participant },
      });
    } catch { await reply(sock, msg, '❌ Impossible de supprimer.'); }
    return;
  }

  if (cmd === 'join') {
    if (!texte) return reply(sock, msg, '❌ Usage : .join [lien du groupe]');
    const match = texte.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
    if (!match) return reply(sock, msg, '❌ Lien invalide.');
    try {
      await sock.groupAcceptInvite(match[1]);
      await reply(sock, msg, '✅ Groupe rejoint !');
    } catch { await reply(sock, msg, '❌ Lien expiré ou invalide.'); }
    return;
  }

  if (cmd === 'leave') {
    if (!groupe) return reply(sock, msg, '❌ Uniquement dans un groupe.');
    await reply(sock, msg, `👋 Au revoir ! ⚔️ ${NOM_BOT}`);
    setTimeout(() => sock.groupLeave(from).catch(() => {}), 2000);
    return;
  }

  if (cmd === 'antidelete') {
    const val = texte;
    if (val === 'on') {
      etat.antidelete = true;
      await reply(sock, msg, '✅ AntiDelete activé ! Les messages supprimés seront renvoyés.');
    } else if (val === 'off') {
      etat.antidelete = false;
      await reply(sock, msg, '❌ AntiDelete désactivé.');
    } else {
      await reply(sock, msg, `ℹ️ AntiDelete : ${etat.antidelete ? '✅ ON' : '❌ OFF'}\nUsage : .antidelete on | .antidelete off`);
    }
    return;
  }
}

module.exports = { handleCommands, etat };
 
