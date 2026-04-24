import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
  return transporter;
}

export async function sendOrderConfirmationEmail(to, { orderNumber, totalAmount, paymentMethod, paymentStatus }) {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!t || !from || !to) {
    logger.info('Email skipped (SMTP not configured or no recipient)');
    return;
  }
  try {
    await t.sendMail({
      from,
      to,
      subject: `Order confirmed — ${orderNumber}`,
      text: `Your order ${orderNumber} has been received.\nTotal: ₹${totalAmount}\nPayment: ${paymentMethod} (${paymentStatus})\n\nThank you for shopping with OneStep Hub.`,
      html: `<p>Your order <strong>${orderNumber}</strong> has been received.</p>
        <p>Total: <strong>₹${totalAmount}</strong><br/>Payment: ${paymentMethod} (${paymentStatus})</p>
        <p>Thank you for shopping with OneStep Hub.</p>`,
    });
    logger.info(`Order confirmation email sent to ${to}`);
  } catch (e) {
    logger.warn(`Email send failed: ${e.message}`);
  }
}
