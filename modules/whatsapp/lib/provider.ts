import { env } from "@/lib/env";

export type WhatsAppMessagePayload = {
  tenantId: string;
  to: string;
  body: string;
  bookingId?: string;
  from?: string | null;
};

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<void>;
}

export class DisabledWhatsAppProvider implements WhatsAppProvider {
  async sendMessage() {
    return;
  }
}

function toTwilioWhatsAppNumber(value: string) {
  return value.startsWith("whatsapp:") ? value : `whatsapp:${value}`;
}

export class TwilioWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload) {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !payload.from) {
      throw new Error("Twilio WhatsApp credentials are not configured.");
    }

    const body = new URLSearchParams({
      From: toTwilioWhatsAppNumber(payload.from),
      To: toTwilioWhatsAppNumber(payload.to),
      Body: payload.body,
    });
    const auth = Buffer.from(
      `${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`
    ).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Twilio WhatsApp send failed with ${response.status}: ${responseText}`
      );
    }
  }
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload) {
    if (!env.META_WHATSAPP_ACCESS_TOKEN || !env.META_WHATSAPP_PHONE_NUMBER_ID) {
      throw new Error("Meta WhatsApp credentials are not configured.");
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.META_WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: payload.to.replace(/^\+/, ""),
          type: "text",
          text: {
            body: payload.body,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Meta WhatsApp send failed with ${response.status}.`);
    }
  }
}

export function createWhatsAppProvider(
  provider: "disabled" | "twilio" | "meta"
): WhatsAppProvider {
  if (provider === "twilio") return new TwilioWhatsAppProvider();
  if (provider === "meta") return new MetaWhatsAppProvider();
  return new DisabledWhatsAppProvider();
}
