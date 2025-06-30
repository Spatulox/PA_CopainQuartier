import nodemailer from "nodemailer";
import { config } from "./config";

interface SendResult {
  "Failed to send": string[];
  "Mail Sent": { max: number; sent: number };
}

export class NewsletterSender {
  private transporter: nodemailer.Transporter;
  private username: string;
  private fromEmail: string;

  constructor(username: string | null = null) {
    this.username = username || "CopainQuartier";
    this.fromEmail = "eatnowesgi@gmail.com";
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: this.fromEmail,
        pass: config.mailerParssword, 
      },
    });
  }

  async sendNewsletter(
    subject: string,
    htmlString: string,
    emailArray: string[]
  ): Promise<SendResult> {
    if (!emailArray || emailArray.length === 0) {
      throw new Error("Email can't be null");
    }

    const send = { max: emailArray.length, sent: 0 };
    const failed: string[] = [];

    for (const recipient of emailArray) {
      try {
        await this.transporter.sendMail({
          from: `"${this.username}" <${this.fromEmail}>`,
          to: recipient,
          subject: subject,
          html: htmlString,
        });
        send.sent += 1;
      } catch (err) {
        failed.push(recipient);
      }
    }

    return { "Failed to send": failed, "Mail Sent": send };
  }
}

/*
 * Exemple d'utilisation :
 * const newsletterSender = new NewsletterSender("Testing PA");
 * newsletterSender.sendNewsletter(
 *   "Manger des trucs",
 *   "J'aime bien les pâtes",
 *   ["destinataire1@example.com", "destinataire2@example.com"]
 * ).then(console.log);
 */
