const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMessages,
  sendMessage,
  markAsSeen,
} = require('../controllers/messageController');

router.get('/:chatId', auth, getMessages);
router.post('/', auth, sendMessage);
router.put('/seen/:chatId', auth, markAsSeen);

module.exports = router;
