import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

export const isEmailConfigured = (): boolean => Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465, // 465 = SSL, 587 = STARTTLS
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string, text: string): Promise<void> => {
  await getTransporter().sendMail({ from: env.smtp.from, to, subject, html, text });
};
