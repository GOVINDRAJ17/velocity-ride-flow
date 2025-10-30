import { useEffect, useMemo, useState } from 'react';
import { useStripe, useElements, CardElement, ElementsConsumer } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

// NOTE: For a real app, create payment intents on your server with your Stripe secret key.
// Here we call a placeholder endpoint. Replace with your own backend or Cloud Functions.
const BACKEND_BASE = import.meta.env.VITE_API_BASE || '';

const CardSection = () => (
  <div className="p-4 rounded-xl bg-muted/40">
    <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
  </div>
);

const CheckoutInner = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { status: 'success' | 'error'; message: string }>(null);

  const amount = 1999; // in cents

  const createPaymentIntent = async () => {
    // This should be your server. For demo purposes, we simulate a client secret.
    const res = await fetch(`${BACKEND_BASE}/create-payment-intent`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, currency: 'usd' }) });
    if (!res.ok) throw new Error('Failed to create payment intent');
    return res.json();
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    try {
      setLoading(true);
      const { clientSecret } = await createPaymentIntent();
      const card = elements.getElement(CardElement);
      if (!card) throw new Error('Card element not found');
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
      if (error) throw error;
      if (paymentIntent?.status === 'succeeded') setResult({ status: 'success', message: 'Payment successful!' });
      else setResult({ status: 'error', message: 'Payment not completed.' });
    } catch (e: any) {
      setResult({ status: 'error', message: e.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardSection />
      <Button className="w-full" onClick={handleSubmit} disabled={!stripe || loading}>
        {loading ? 'Processing…' : 'Pay $19.99'}
      </Button>
      {result && (
        <div className={`text-center p-3 rounded-lg ${result.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="p-4 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-6">Enter your card details to make a one-time payment.</p>
      <CheckoutInner />
    </motion.div>
  );
};

export default Checkout;
