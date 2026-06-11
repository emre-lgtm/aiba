import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_PORT || "465") === "465",   // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,   // Gmail: App Password (16 karakter)
  },
});
