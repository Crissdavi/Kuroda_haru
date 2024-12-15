import { query, where, collection, doc, getDoc, getDocs, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../database/clanes-db.js";

const handler = async (m, { conn }) => {
  
    const user = global.db.data.users[m.sender];

    let who = m.quoted
      ? m.quoted.sender
      : m.mentionedJid && m.mentionedJid[0]
      ? m.mentionedJid[0]
      : null;

    if (!who) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ Debes mencionar o responder al usuario que deseas degradar a miembro." },
        { quoted: m }
      );
    }

    const clanQuery = query(
      collection(db, "clanes"),
      where("miembros.lider", "==", m.sender)
    );
    const querySnapshot = await getDocs(clanQuery);

    if (querySnapshot.empty) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ No eres líder de ningún clan." },
        { quoted: m }
      );
    }

    const clanId = querySnapshot.docs[0].id;
    const clanRef = doc(db, "clanes", clanId);
    const clanSnap = await getDoc(clanRef);
    const clanData = clanSnap.data();

    if (clanData.miembros.lider !== m.sender) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ Solo el líder del clan puede degradar a un usuario a miembro." },
        { quoted: m }
      );
    }

    const isSubLeader =
      clanData.miembros.sub_lider === who ||
      (Array.isArray(clanData.miembros.sub_lider) && clanData.miembros.sub_lider.includes(who));

    if (!isSubLeader) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ El usuario mencionado no es un sublíder de tu clan." },
        { quoted: m }
      );
    }

    let updateData = {};

    if (clanData.miembros.sub_lider === who) {
      updateData["miembros.sub_lider"] = null;
    } else if (Array.isArray(clanData.miembros.sub_lider)) {
      updateData["miembros.sub_lider"] = arrayRemove(who);
    }
    if (!clanData.miembros.m_ids.includes(who)) {
      updateData["miembros.m_ids"] = arrayUnion(who);
    }

    await updateDoc(clanRef, updateData);

    return conn.sendMessage(
      m.chat,
      { text: `✅ El usuario @${who.split("@")[0]} ha sido degradado a miembro en el clan **${clanData.nombre}**.`, mentions: [who] },
      { quoted: fkontak }
    );

};

handler.command = ["cdegradar"];
export default handler;