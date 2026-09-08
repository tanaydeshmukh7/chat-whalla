const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getContacts,
  addContact,
  deleteContact,
} = require('../controllers/contactController');

router.get('/', auth, getContacts);
router.post('/', auth, addContact);
router.delete('/:id', auth, deleteContact);

module.exports = router;
