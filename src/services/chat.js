const { v4: uuid } = require('uuid');
const { readJson, writeJson } = require('./storage');

async function _readChats() {
  const raw = await readJson('chats.json');
  if (Array.isArray(raw)) return { chatRequests: [], chats: [] };
  return {
    chatRequests: raw.chatRequests || [],
    chats: raw.chats || []
  };
}

async function _writeChats(chatRequests, chats) {
  await writeJson('chats.json', { chatRequests, chats });
}

async function createChatRequest({ driverId, driverName, query }) {
  const { chatRequests, chats } = await _readChats();
  const id = uuid();
  const req = {
    id,
    driverId,
    driverName,
    query,
    status: 'pending',
    createdAt: Date.now()
  };
  chatRequests.push(req);
  await _writeChats(chatRequests, chats);
  return req;
}

async function listPendingRequests() {
  const { chatRequests } = await _readChats();
  return chatRequests.filter(r => r.status === 'pending');
}

async function acceptRequest(requestId, managerId, managerName) {
  const { chatRequests, chats } = await _readChats();
  const idx = chatRequests.findIndex(r => r.id === requestId);
  if (idx === -1) return null;

  chatRequests[idx].status = 'accepted';
  chatRequests[idx].managerId = managerId;
  chatRequests[idx].managerName = managerName;
  chatRequests[idx].acceptedAt = Date.now();

  chats.push({
    id: requestId,
    driverId: chatRequests[idx].driverId,
    managerId,
    messages: []
  });

  await _writeChats(chatRequests, chats);
  return chatRequests[idx];
}

async function addMessage(chatId, sender, text) {
  const { chatRequests, chats } = await _readChats();
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return null;
  const msg = {
    id: uuid(),
    sender,
    text,
    timestamp: Date.now()
  };
  chat.messages.push(msg);
  await _writeChats(chatRequests, chats);
  return msg;
}

async function getChat(chatId) {
  const { chats } = await _readChats();
  return chats.find(c => c.id === chatId) || null;
}

module.exports = {
  createChatRequest,
  listPendingRequests,
  acceptRequest,
  addMessage,
  getChat
};
