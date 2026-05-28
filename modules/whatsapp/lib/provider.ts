export type WhatsAppMessagePayload = {
  tenantId: string;
  to: string;
  body: string;
  bookingId?: string;
};

export interface WhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<void>;
}

export class DisabledWhatsAppProvider implements WhatsAppProvider {
  async sendMessage() {
    return;
  }
}
