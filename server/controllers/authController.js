import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const user = new User({ username, email, password });
      await user.save();

      const token = jwt.sign(
        { id: user._id, username: user.username, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user._id, username, email, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user._id, username: user.username, email, isAdmin: user.isAdmin } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `http://dockersphere.ovh/reset-password/${resetToken}`;
      await transporter.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: `Please click <a href="${resetUrl}">here</a> to reset your password.`
      });

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};