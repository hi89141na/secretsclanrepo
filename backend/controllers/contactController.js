const Contact = require('../models/Contact');
const { createTransporter } = require('../config/emailConfig');
const User = require('../models/User');

// Submit contact form (public)
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({ 
      success: true, 
      message: 'Your message has been submitted successfully. We will get back to you soon.',
      data: contact 
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit contact form. Please try again later.' 
    });
  }
};

// Get all contacts (admin)
const getAllContacts = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .populate('adminReply.repliedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: contacts.length,
      data: contacts 
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts' 
    });
  }
};

// Get single contact (admin)
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('adminReply.repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: contact 
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contact' 
    });
  }
};

// Reply to contact (admin)
const replyToContact = async (req, res) => {
  try {
    const { replyMessage } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply message is required' 
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    // Send email
 const transporter = await createTransporter();

    const htmlTemplate = `
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0;">Reply to Your Inquiry</h1>
          <p style="margin: 10px 0 0 0;">SecretsClan E-Commerce</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #6b7280; margin: 0 0 10px 0;">Dear ${contact.name},</p>
            <p style="color: #6b7280; margin: 0 0 15px 0;">Thank you for contacting us regarding "${contact.subject}". Here is our response:</p>
            <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #667eea; white-space: pre-wrap;">${replyMessage}</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <p style="color: #9ca3af; font-size: 14px; margin: 0;"><strong>Your Original Message:</strong></p>
            <p style="color: #6b7280; margin: 10px 0 0 0; white-space: pre-wrap;">${contact.message}</p>
          </div>
        </div>
        <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          <p>This is an automated response from SecretsClan</p>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: htmlTemplate
    });

    // Update contact record
    contact.adminReply = {
      message: replyMessage,
      repliedBy: req.user._id,
      repliedAt: new Date()
    };
    contact.status = 'replied';
    await contact.save();

    const updatedContact = await Contact.findById(contact._id)
      .populate('adminReply.repliedBy', 'name email');

    res.status(200).json({ 
      success: true, 
      message: 'Reply sent successfully',
      data: updatedContact 
    });
  } catch (error) {
    console.error('Reply error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send reply' 
    });
  }
};

// Update contact status (admin)
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('adminReply.repliedBy', 'name email');

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Status updated successfully',
      data: contact 
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
};

// Delete contact (admin)
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact' 
    });
  }
};

module.exports = {
  submitContactForm,
  getAllContacts,
  getContactById,
  replyToContact,
  updateContactStatus,
  deleteContact
};
