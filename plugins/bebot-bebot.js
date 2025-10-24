/*const {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion, 
    MessageRetryMap,
    makeCacheableSignalKeyStore, 
    jidNormalizedUser,
    PHONENUMBER_MCC
   } = await import('@whiskeysockets/baileys')
import moment from 'moment-timezone'
import NodeCache from 'node-cache'
import readline from 'readline'
import qrcode from "qrcode"
import chalk from "chalk"
import crypto from 'crypto'
import fs from "fs"
import pino from 'pino';
import * as ws from 'ws';
const { CONNECTING } = ws
import { Boom } from '@hapi/boom'
import { makeWASocket } from '../lib/simple.js';
import { startSub, checkSubBots } from '../lib/resetSubbs.js';

if (global.conns instanceof Array) console.log()
else global.conns = []

await startSub();
setInterval(() => { console.log(`${chalk.bold.whiteBright.bgGreen(' INFO :')} ${chalk.bold.cyanBright(`Verificando subbots y reconectandolos . . .`)}`);
checkSubBots();
}, 30000);

let handler = async (m, { conn: _conn, args, usedPrefix, command, isOwner, text }) => {

  let parent = args[0] && args[0] == 'plz' ? _conn : await global.conn
  
	//=====
  async function bbts() {
let phoneNumber = (t => (t = (t || m.sender.split('@')[0]).replace(/[^\d]/g, ''), t.startsWith('52') && !t.startsWith('521') ? '521' + t.slice(2) : t))((text || '').trim());

  let authFolderB = phoneNumber
  
if (!fs.existsSync(`./${jadi}/`+ authFolderB)) fs.mkdirSync(`./${jadi}/`+ authFolderB, { recursive: true });

if (args[0]) {
    try {
        const json = JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8'));
        fs.writeFileSync(`./${jadi}/` + authFolderB + "/creds.json", JSON.stringify(json, null, '\t'));
    } catch (e) {
    }
}
    
//--
const {state, saveState, saveCreds} = await useMultiFileAuthState(`./${jadi}/${authFolderB}`)
const msgRetryCounterMap = (MessageRetryMap) => { };
const msgRetryCounterCache = new NodeCache()
const {version} = await fetchLatestBaileysVersion();

const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  mobile: MethodMobile, 
  browser: ['Chrome (Linux)', '', ''],
  browser: [ "Ubuntu", "Chrome", "20.0.04" ], 
  auth: {
  creds: state.creds,
  keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true, 
  generateHighQualityLinkPreview: true, 
  getMessage: async (clave) => {
  let jid = jidNormalizedUser(clave.remoteJid)
  let msg = await store.loadMessage(jid, clave.id)
  return msg?.message || ""
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,   
  version
  }

//--
let conn = makeWASocket(connectionOptions)

if (methodCode && !conn.authState.creds.registered) {
    if (!phoneNumber) {
        process.exit(0);
    }
    let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!Object.keys(PHONENUMBER_MCC).some(v => cleanedNumber.startsWith(v))) {
        process.exit(0);
    }

    setTimeout(async () => {
        let codeBot = await conn.requestPairingCode(cleanedNumber);
        codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
         parent.sendFile(m.chat, 'https://i.ibb.co/SKKdvRb/code.jpg', 'qrcode.png', `Codigo : ${codeBot}`, m)
        rl.close();
    }, 3000);
}

conn.isInit = false

//---new
let isInit = true

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    if (isNewLogin) conn.isInit = true

    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
      let i = global.conns.indexOf(conn)
      if (i < 0) return console.log(await creloadHandler(true).catch(console.error))
      delete global.conns[i]
      global.conns.splice(i, 1)

     if (code !== DisconnectReason.connectionClosed){ 
        parent.sendMessage(conn.user.jid, {text : `Se intentará reconectar . . .`}, { quoted: m }) 
    } else {
        parent.sendMessage(m.chat, {text : `Se ha cerrado la sesión. vuelve a vincular el subbot manualmente.`}, { quoted: m })
    }
    }
    //----
    if (global.db.data == null) loadDatabase()

    if (connection == 'open') {
    conn.isInit = true
    conn.uptime = new Date()
    global.conns.push(conn)
    await parent.sendMessage(m.chat, {text : args[0] ? `Conectado con éxito!` : `Conectado con éxito!`}, { quoted: m })
    await sleep(5000)

	  }
 
  }

  setInterval(async () => {
    if (!conn.user) {
      try { conn.ws.close() } catch { }
      conn.ev.removeAllListeners()
      let i = global.conns.indexOf(conn)
      if (i < 0) return
      delete global.conns[i]
      global.conns.splice(i, 1)
    }}, 60000)
    

	
let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error(e)
}
if (restatConn) {
try { conn.ws.close() } catch { }
conn.ev.removeAllListeners()
conn = makeWASocket(connectionOptions)
isInit = true
}

if (!isInit) {
conn.ev.off('messages.upsert', conn.handler)
conn.ev.off('group-participants.update', conn.participantsUpdate)
conn.ev.off('groups.update', conn.groupsUpdate)
//conn.ev.off('message.delete', conn.onDelete)
conn.ev.off('call', conn.onCall)
conn.ev.off('connection.update', conn.connectionUpdate)
conn.ev.off('creds.update', conn.credsUpdate)
}
  
conn.welcome = global.conn.welcome + ''
conn.bye = global.conn.bye + ''
conn.spromote = global.conn.spromote + ''
conn.sdemote = global.conn.sdemote + ''

conn.handler = handler.handler.bind(conn)
conn.participantsUpdate = handler.participantsUpdate.bind(conn)
conn.groupsUpdate = handler.groupsUpdate.bind(conn)
//conn.onDelete = handler.deleteUpdate.bind(conn)
conn.connectionUpdate = connectionUpdate.bind(conn)
conn.credsUpdate = saveCreds.bind(conn, true)

conn.ev.on('messages.upsert', conn.handler)
conn.ev.on('group-participants.update', conn.participantsUpdate)
conn.ev.on('groups.update', conn.groupsUpdate)
//conn.ev.on('message.delete', conn.onDelete)
conn.ev.on('connection.update', conn.connectionUpdate)
conn.ev.on('creds.update', conn.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
}
bbts()

}
handler.help = ['serbot', 'code']
handler.tags = ['serbot']
handler.command = ['bebot', 'serbot', 'jadibot', 'botclone', 'code']

export default handler

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}*/