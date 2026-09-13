const express = require('express');
const {
  createChatRequest,
  listPendingRequests,
  acceptRequest,
  addMessage,
  getChat
} = require('../services/chat');

const router = express.Router();

// POST /api/support/ai  (driver app)
router.post('/ai', async (req, res) => {
  const { message, driverId, driverName } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message required' });

  const lower = message.toLowerCase();
  let aiReply = 'I have noted your query. Forwarding to manager if needed.';
  if (lower.includes('route')) {
    aiReply = 'Route issue detected, notifying dispatcher.';
  } else if (lower.includes('payment')) {
    aiReply = 'Payment query detected, sending to accounts/manager.';
  } else if (lower.includes('weight')) {
    aiReply = 'Weight dispute noted; hardware scale + manager will review.';
  }

  const reqRecord = await createChatRequest({
    driverId: driverId || 'driver1',
    driverName: driverName || 'Driver',
    query: message
  });

  res.json({
    aiReply,
    requestId: reqRecord.id,
    status: reqRecord.status
  });
});

// GET /api/support/requests  (manager list)
router.get('/requests', async (req, res) => {
  const pending = await listPendingRequests();
  res.json(pending);
});

// POST /api/support/requests/:id/accept
router.post('/requests/:id/accept', async (req, res) => {
  const { managerId = 'manager1', managerName = 'Manager' } = req.body || {};
  const updated = await acceptRequest(req.params.id, managerId, managerName);
  if (!updated) return res.status(404).json({ error: 'Request not found' });
  res.json(updated);
});

// GET /api/support/chats/:chatId
router.get('/chats/:chatId', async (req, res) => {
  const chat = await getChat(req.params.chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

// POST /api/support/chats/:chatId/message
router.post('/chats/:chatId/message', async (req, res) => {
  const { sender, text } = req.body || {};
  if (!sender || !text) return res.status(400).json({ error: 'sender and text required' });

  const msg = await addMessage(req.params.chatId, sender, text);
  if (!msg) return res.status(404).json({ error: 'Chat not found' });
  res.status(201).json(msg);
});

module.exports = router;
