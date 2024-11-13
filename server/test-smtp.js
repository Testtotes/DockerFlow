require('dotenv').config();
const emailService = require('../services/emailService');

async function testEmail() {
  try {
    await emailService.sendNotification(
      'dynastie.amoussou.etu@gmail.com',
      'Ceci est un test de configuration SMTP pour DockerFlow'
    );
    console.log('Email de test envoyé avec succès');
  } catch (error) {
    console.error('Échec de l\'envoi de l\'email de test:', error);
  }
  process.exit();
}

testEmail();
