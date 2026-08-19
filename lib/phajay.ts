// lib/phajay.ts
const PHAJAY_API_KEY = process.env.PHAJAY_API_KEY || "";
const PHAJAY_API_URL = process.env.PHAJAY_API_URL || "https://sandbox-api.phajay.co/v1";

export interface PayoutPayload {
  reference_no: string;
  amount: number;
  currency: string;
  description: string;
  account_number?: string;
  bank_code?: string;
}

export async function createPhajayPayout(payload: PayoutPayload) {
  if (!PHAJAY_API_KEY) {
    throw new Error("Phajay API Key ບໍ່ໄດ້ຖືກຕັ້ງຄ່າໃນ Environment Variables");
  }

  const response = await fetch(`${PHAJAY_API_URL}/payout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${PHAJAY_API_KEY}`,
      "x-api-key": PHAJAY_API_KEY, // ບາງ Endpoint ຂອງ Phajay ອາດໃຊ້ x-api-key
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Phajay API Error Status: ${response.status}`);
  }

  return data;
}