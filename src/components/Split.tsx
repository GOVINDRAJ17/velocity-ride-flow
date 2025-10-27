import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";

const Split = () => {
  const [totalAmount, setTotalAmount] = useState("50.00");
  const [participants, setParticipants] = useState([
    { id: 1, name: "You", email: "you@example.com", share: 0 },
  ]);

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now(), name: "", email: "", share: 0 },
    ]);
  };

  const removeParticipant = (id: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id));
    }
  };

  const calculateShare = () => {
    const amount = parseFloat(totalAmount) || 0;
    return (amount / participants.length).toFixed(2);
  };

  const handleSendRequest = () => {
    if (!totalAmount || participants.some((p) => !p.email)) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Payment split requests sent successfully!");
  };

  return (
    <section id="split" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Split Ride Cost</h2>
          <p className="text-muted-foreground text-lg">Share expenses easily with fellow riders</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Split Form */}
            <Card className="shadow-soft border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="text-primary" />
                  Ride Cost Details
                </CardTitle>
                <CardDescription>Enter the total amount and add participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="total">Total Ride Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      id="total"
                      type="number"
                      placeholder="0.00"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="pl-10 text-lg h-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Users size={20} />
                      Participants ({participants.length})
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addParticipant}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {participants.map((participant, index) => (
                      <div key={participant.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Participant {index + 1}</span>
                          {participants.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeParticipant(participant.id)}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Input
                            placeholder="Name"
                            value={participant.name}
                            onChange={(e) => {
                              const updated = [...participants];
                              updated[index].name = e.target.value;
                              setParticipants(updated);
                            }}
                            disabled={index === 0}
                          />
                          <Input
                            placeholder="Email or Phone"
                            value={participant.email}
                            onChange={(e) => {
                              const updated = [...participants];
                              updated[index].email = e.target.value;
                              setParticipants(updated);
                            }}
                            disabled={index === 0}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="shadow-soft border-2">
              <CardHeader>
                <CardTitle>Split Summary</CardTitle>
                <CardDescription>Review the split before sending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="gradient-primary text-white rounded-2xl p-6">
                  <div className="text-sm opacity-90 mb-2">Total Amount</div>
                  <div className="text-5xl font-bold mb-4">${totalAmount}</div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="opacity-90">Each person pays</span>
                      <span className="text-2xl font-bold">${calculateShare()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium mb-2">Breakdown</div>
                  {participants.map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                          {participant.name ? participant.name.charAt(0).toUpperCase() : index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{participant.name || `Participant ${index + 1}`}</div>
                          <div className="text-sm text-muted-foreground">{participant.email || "No email"}</div>
                        </div>
                      </div>
                      <div className="font-bold text-primary">${calculateShare()}</div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleSendRequest}
                  className="w-full gradient-primary text-primary-foreground hover:shadow-hover transition-smooth text-lg py-6"
                >
                  Send Payment Requests
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  All participants will receive a payment request via email or SMS
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Split;
