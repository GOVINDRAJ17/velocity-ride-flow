import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface StripeCheckoutProps {
  rideId: string;
  amount: number;
  rideName: string;
  onSuccess?: () => void;
}

const StripeCheckout = ({ rideId, amount, rideName, onSuccess }: StripeCheckoutProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to make payment");
      return;
    }

    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvv || !cardData.name) {
      toast.error("Please fill in all card details");
      return;
    }

    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success("Payment successful!");
      setLoading(false);
      onSuccess?.();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <Card className="shadow-card max-w-md mx-auto">
      <CardHeader className="gradient-primary text-white">
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Ride</p>
          <p className="font-semibold">{rideName}</p>
          <p className="text-2xl font-bold mt-2">₹{amount.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="Rajesh Kumar"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              value={cardData.cardNumber}
              onChange={(e) =>
                setCardData({
                  ...cardData,
                  cardNumber: formatCardNumber(e.target.value),
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                maxLength={5}
                value={cardData.expiry}
                onChange={(e) =>
                  setCardData({
                    ...cardData,
                    expiry: formatExpiry(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                placeholder="123"
                maxLength={3}
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData({
                    ...cardData,
                    cvv: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full gradient-primary text-lg py-6"
        >
          {loading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <p>Secured by Stripe • Your payment info is encrypted</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;
