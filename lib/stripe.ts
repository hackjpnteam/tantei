import Stripe from 'stripe';

let stripe: Stripe | null = null;

// Initialize Stripe only if environment variables are present
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    });
  } catch (error) {
    console.warn('Stripe initialization failed:', error);
  }
}

export const getStripe = (): Stripe | null => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    console.warn('Stripe not initialized despite having secret key');
  }
  return stripe;
};

export const createPaymentIntent = async (
  amountJPY: number,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent | null> => {
  const stripeInstance = getStripe();
  
  if (!stripeInstance) {
    console.error('Stripe is not configured. Please set STRIPE_SECRET_KEY');
    return null;
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amountJPY,
      currency: 'jpy',
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return null;
  }
};

export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent | null> => {
  const stripeInstance = getStripe();
  
  if (!stripeInstance) {
    console.error('Stripe is not configured');
    return null;
  }

  try {
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error);
    return null;
  }
};

export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string
): Stripe.Event | null => {
  const stripeInstance = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeInstance || !webhookSecret) {
    console.error('Stripe webhook not configured');
    return null;
  }

  try {
    const event = stripeInstance.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Failed to construct webhook event:', error);
    return null;
  }
};

export default stripe;