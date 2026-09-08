const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getChats, createChat } = require('../controllers/chatController');

router.get('/', auth, getChats);
router.post('/', auth, createChat);

module.exports = router;
