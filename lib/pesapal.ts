/** @deprecated Use lib/yo-payments.ts — Pesapal is no longer used. */
const PESAPAL_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://pay.pesapal.com/v3'
  : 'https://cybqa.pesapal.com/v3';

export async function getPesapalAuthToken() {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    }),
  });

  const data = await response.json();
  return data.token;
}

export async function registerPesapalIPN(token: string) {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/pesapal-ipn`,
      ipn_notification_type: 'GET',
    }),
  });

  return await response.json();
}

export async function submitPesapalOrder(token: string, orderDetails: any) {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(orderDetails),
  });

  return await response.json();
}

export async function getPesapalTransactionStatus(token: string, orderTrackingId: string) {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return await response.json();
}
