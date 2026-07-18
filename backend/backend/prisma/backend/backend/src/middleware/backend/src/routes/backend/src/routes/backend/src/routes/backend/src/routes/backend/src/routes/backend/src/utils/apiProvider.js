import { API_PROVIDER } from '../config.js';

export async function placeOrderWithProvider(service, link, quantity) {
  if (!API_PROVIDER.baseURL || !API_PROVIDER.apiKey) {
    console.log('No API provider configured - simulating order placement');
    return { orderId: `SIM-${Date.now()}` };
  }

  try {
    const response = await fetch(`${API_PROVIDER.baseURL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_PROVIDER.apiKey}`
      },
      body: JSON.stringify({
        service: service.providerServiceId,
        link,
        quantity
      })
    });

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Provider API error:', error);
    throw error;
  }
}

export async function getOrderStatus(providerOrderId) {
  if (!API_PROVIDER.baseURL || !API_PROVIDER.apiKey) {
    return { status: 'processing' };
  }

  try {
    const response = await fetch(`${API_PROVIDER.baseURL}/order/${providerOrderId}`, {
      headers: { 'Authorization': `Bearer ${API_PROVIDER.apiKey}` }
    });

    if (!response.ok) {
      throw new Error(`Provider API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Provider API status check error:', error);
    return { status: 'unknown' };
  }
}
