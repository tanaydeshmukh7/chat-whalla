const Contact = require('../models/Contact');
const User = require('../models/User');

/**
 * Get all contacts for the current user
 * GET /api/contacts
 */
const getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ owner: req.userId })
      .populate('contact', 'name phone avatar about isOnline lastSeen')
      .sort({ savedName: 1 });

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new contact by phone number
 * POST /api/contacts
 */
const addContact = async (req, res, next) => {
  try {
    const { phone, savedName } = req.body;

    if (!phone || !savedName) {
      return res
        .status(400)
        .json({ message: 'Phone number and name are required' });
    }

    // Find the user by phone number
    const contactUser = await User.findOne({ phone });

    if (!contactUser) {
      return res.status(404).json({
        message: 'This phone number is not registered on Chaat Whalla',
      });
    }

    // Prevent adding yourself
    if (contactUser._id.toString() === req.userId) {
      return res.status(400).json({ message: "You can't add yourself as a contact" });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      owner: req.userId,
      contact: contactUser._id,
    });

    if (existingContact) {
      return res.status(400).json({ message: 'Contact already exists' });
    }

    const contact = await Contact.create({
      owner: req.userId,
      contact: contactUser._id,
      savedName,
    });

    // Populate the contact user data before returning
    const populatedContact = await Contact.findById(contact._id).populate(
      'contact',
      'name phone avatar about isOnline lastSeen'
    );

    res.status(201).json({ contact: populatedContact });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a contact
 * DELETE /api/contacts/:id
 */
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId,
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getContacts, addContact, deleteContact };
