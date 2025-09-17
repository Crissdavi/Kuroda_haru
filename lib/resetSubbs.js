import {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  Browsers
} from '@whiskeysockets/baileys';
import fs from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';
import { makeWASocket } from './simple.js';
import store from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JADIBTS_DIR = jadi;

globalThis.conns = globalThis.conns || [];

export async function startSub() {
  try {
    if (!fs.existsSync(JADIBTS_DIR)) {
      console.log(`${chalk.bold.whiteBright.bgRed('WARNING:')} ${chalk.bold.cyanBright(`No hay sub-bots previamente conectados`)}`);
      return;
    }

    const subBotDirs = fs.readdirSync(JADIBTS_DIR);
    let conectados = 0;

    for (const dir of subBotDirs) {
      const result = await startSubBotIfValid(dir);
      if (result === true) conectados++;
    }

    console.log(`${chalk.bold.whiteBright.bgGreen('INFO:')} ${chalk.bold.cyanBright(`Se reconectaron con éxito ${conectados} de ${subBotDirs.length} Subbots`)}`);
  } catch (error) {
    console.error("Error en startSub:", error);
  }
}

async function joinChannels(conn) {
  await conn.newsletterFollow("120363183614708156@newsletter");
}

async function startSubBotIfValid(subBotDir) {
  try {
    const credsPath = path.join(JADIBTS_DIR, subBotDir, "creds.json");
    if (!fs.existsSync(credsPath)) return false;

    const credsData = fs.readFileSync(credsPath, 'utf-8');
    const creds = JSON.parse(credsData);
    if (creds.fstop || !creds.noiseKey) {
      fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
      return false;
    }

    await startSubBot(subBotDir, credsData);
    return true;
  } catch {
    fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
    return false;
  }
}

async function startSubBot(subBotDir, credsData) {
  try {
    const subBotPath = path.join(JADIBTS_DIR, subBotDir);
    const { state, saveState, saveCreds } = await useMultiFileAuthState(subBotPath);

    const cacheableKeyStore = makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }));
    const { version } = await fetchLatestBaileysVersion();

    const socketOptions = {
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: cacheableKeyStore },
      waWebSocketUrl: 'wss://web.whatsapp.com/ws/chat?ED=CAIICA',
      logger: pino({ level: "silent" }),
      browser: Browsers.macOS("Desktop"),
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (msg) => {
        const userJid = jidNormalizedUser(msg.remoteJid);
        return await store.loadMessage(userJid, msg.id)?.message || '';
      },
      msgRetryCounterMap: {},
      version
    };

    let socket = makeWASocket(socketOptions);
    socket.isInit = false;
    socket.uptime = Date.now();

    socket.ev.on("connection.update", (update) => handleConnectionUpdate(socket, update, subBotDir));

    process.on('unhandledRejection', async (reason) => {
      const msg = reason?.message || '';
      if (msg.includes('Bad MAC') || msg.includes('Invalid bytes')) {
        const fullPath = path.join(JADIBTS_DIR, subBotDir);
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
          const index = globalThis.conns.indexOf(socket);
          if (index >= 0) globalThis.conns.splice(index, 1);
          if (socket.ws) socket.ws.close();
        } catch {}
      }
    });

    if (socket.cleanupTimer) clearInterval(socket.cleanupTimer);
    socket.cleanupTimer = setInterval(async () => {
      if (!socket.user) {
        try {
          socket.ws.close();
        } catch {}
        socket.ev.removeAllListeners();
        const index = globalThis.conns.indexOf(socket);
        if (index >= 0) {
          globalThis.conns.splice(index, 1);
        }
        clearInterval(socket.cleanupTimer);
      }
    }, 60000);

    await loadHandler(socket);

    globalThis.conns.push(socket);
    socket.uptime = Date.now();
  } catch {
    fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
  }
}

async function handleConnectionUpdate(socket, update, subBotDir) {
  const { connection, lastDisconnect, isNewLogin } = update;

  if (isNewLogin) socket.isInit = false;

  if (connection === "close") {
    await handleDisconnect(lastDisconnect, socket, subBotDir);
    socket.isInit = false;
  } else if (connection === "open") {
    socket.isInit = true;
    await joinChannels(socket);
  }
}

async function handleDisconnect(lastDisconnect, socket, subBotDir) {
  const reason = lastDisconnect?.error?.output?.statusCode;
  const disconnectReason = reason || lastDisconnect?.error?.output?.payload?.statusCode;

  if (reason === DisconnectReason.badSession) {
    fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
  } else if ([404, 403, 405, 401].includes(reason) || disconnectReason === DisconnectReason.loggedOut) {
    fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
  } else if ([428, DisconnectReason.timedOut, DisconnectReason.connectionClosed, DisconnectReason.connectionLost].includes(disconnectReason)) {
    await restartSubBot(socket, subBotDir);
  } else if (reason === 440 || reason === 408) {
    await restartSubBot(socket, subBotDir);
  } else {
    await restartSubBot(socket, subBotDir);
  }
}

async function restartSubBot(socket, subBotDir) {
  const credsPath = path.join(JADIBTS_DIR, subBotDir, "creds.json");
  if (!fs.existsSync(credsPath)) return;
  try {
    const credsData = fs.readFileSync(credsPath, 'utf-8');
    await startSubBot(subBotDir, credsData);
  } catch {
    fs.rmSync(path.join(JADIBTS_DIR, subBotDir), { recursive: true, force: true });
  }
}

async function loadHandler(socket) {
  const handlerPath = path.join(__dirname, "../handler.js");
  try {
    const handlerModule = await import(handlerPath + '?update=' + Date.now());
    if (handlerModule) {
      socket.handler = handlerModule.handler.bind(socket);
      socket.ev.removeAllListeners("messages.upsert");
      socket.ev.on("messages.upsert", socket.handler);
    }
  } catch {}
}

export async function checkSubBots() {
  for (const socket of globalThis.conns) {
    if (!socket.user || !socket.authState || !socket.authState.creds) {
      const index = globalThis.conns.indexOf(socket);
      if (index >= 0) globalThis.conns.splice(index, 1);
      continue;
    }

    const subBotDir = socket.authState.creds.me?.jid || 'Desconocido';
    if (!socket.isInit && !socket._reconnecting) {
      socket._reconnecting = true;
      await restartSubBot(socket, subBotDir);
      socket._reconnecting = false;
    }
  }
}

setInterval(checkSubBots, 60000);