import { doc, getDoc, updateDoc, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../database/clanes-db.js";

const handler = async (m, { conn }) => {
  try {
    const user = global.db.data.users[m.sender];
    const userLevel = user.level || 1;

    const clanQuery = query(
      collection(db, "clanes"),
      where("miembros.m_ids", "array-contains", m.sender)
    );
    const querySnapshot = await getDocs(clanQuery);

    if (querySnapshot.empty) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ No perteneces a ningún clan actualmente." },
        { quoted: m }
      );
    }

    const clanId = querySnapshot.docs[0].id;
    const clanRef = doc(db, "clanes", clanId);
    const clanSnap = await getDoc(clanRef);
    const clanData = clanSnap.data();

    if (clanData.miembros.lider === m.sender) {
      return conn.sendMessage(
        m.chat,
        { text: "⚠️ No puedes salir de tu clan porque eres el líder. Usa un comando para transferir el liderazgo antes de salir." },
        { quoted: m }
      );
    }

    let updateData = {
      "miembros.m_ids": arrayRemove(m.sender),
      m_count: clanData.m_count - 1,
      poder: Math.max(0, clanData.poder - userLevel),
    };

    if (clanData.miembros.sub_lider === m.sender) {
      updateData["miembros.sub_lider"] = null;
    } else if (
      Array.isArray(clanData.miembros.sub_lider) &&
      clanData.miembros.sub_lider.includes(m.sender)
    ) {
      updateData["miembros.sub_lider"] = arrayRemove(m.sender);
    }

    await updateDoc(clanRef, updateData);

    return conn.sendMessage(
      m.chat,
      { text: `✅ Has salido del clan **${clanData.nombre}**.\n\n🛡️ Poder del clan reducido en -${userLevel}.` },
      { quoted: m }
    );
  } catch (error) {
    console.error(error);
    conn.sendMessage(
      m.chat,
      { text: "⚠️ Ocurrió un error al intentar salir del clan." },
      { quoted: m }
    );
  }
};

handler.command = ['cleave'];
export default handler;