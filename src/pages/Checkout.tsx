import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Smartphone, CreditCard, Banknote, Truck, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useCartStore } from "@/stores/cartStore";
import { useOrdersStore } from "@/stores/ordersStore";

type Method = "mpesa" | "card" | "airtel" | "cod";

const METHODS: { id: Method; name: string; tag: string; icon: React.ComponentType<{ className?: string }>; accent: string }[] = [
  { id: "mpesa", name: "M-Pesa", tag: "STK Push to your phone", icon: Smartphone, accent: "bg-[#4CAF50]" },
  { id: "airtel", name: "Airtel Money", tag: "Pay from your Airtel line", icon: Smartphone, accent: "bg-[#E60000]" },
  { id: "card", name: "Card", tag: "Visa, Mastercard", icon: CreditCard, accent: "bg-secondary" },
  { id: "cod", name: "Cash on Delivery", tag: "Pay the rider on arrival", icon: Banknote, accent: "bg-amber-600" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "KES";
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const total = subtotal + shipping;

  const [method, setMethod] = useState<Method>("mpesa");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city) {
      toast.error("Fill in all delivery details");
      return;
    }
    if ((method === "mpesa" || method === "airtel") && !phone.match(/^(\+?254|0)?[17]\d{8}$/)) {
      toast.error("Enter a valid Kenyan phone number");
      return;
    }
    setSubmitting(true);
    // UI only — simulate processing
    await new Promise((r) => setTimeout(r, 1400));

    const newOrder = addOrder({
      items: items.map((i) => ({
        variantId: i.variantId,
        title: i.product.node.title,
        image: i.product.node.images.edges[0]?.node?.url ?? null,
        quantity: i.quantity,
        price: { amount: i.price.amount, currencyCode: i.price.currencyCode },
      })),
      subtotal,
      shipping,
      total,
      currency,
      paymentMethod: method,
      delivery: { name, phone, address, city },
    });

    setOrderId(newOrder.id);
    clearCart();
    setSubmitting(false);
    setDone(true);
    toast.success(
      method === "mpesa"
        ? "Check your phone for the M-Pesa prompt"
        : method === "airtel"
        ? "Confirm the Airtel Money prompt on your phone"
        : method === "card"
        ? "Card payment received (demo)"
        : "Order confirmed — pay on delivery"
    );
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <StoreHeader />
        <div className="container mx-auto px-4 py-12 max-w-md text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-black text-secondary">Asante sana!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your order has been placed. Track every step from packing to your door.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground mt-2 font-grotesk">
              Order <span className="font-bold text-secondary">#{orderId}</span>
            </p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            {orderId && (
              <button
                onClick={() => navigate(`/orders/${orderId}`)}
                className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-grotesk uppercase tracking-wider text-xs font-bold"
              >
                Track order
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="border-2 border-secondary/30 text-secondary rounded-full px-6 py-3 font-grotesk uppercase tracking-wider text-xs font-bold hover:bg-secondary/5 transition"
            >
              Continue shopping
            </button>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">Checkout</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-secondary mt-3">
          Checkout <span className="text-primary">.</span>
        </h1>
      </section>

      <form onSubmit={handlePay} className="container mx-auto px-4 mt-5 grid lg:grid-cols-[1fr_360px] gap-5">
        {/* Left — delivery + method */}
        <div className="space-y-5">
          {/* Delivery */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4" /> Delivery details
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="rounded-xl border-2 border-border focus:border-primary bg-background px-3 py-2.5 text-sm outline-none" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g. 0712345678)" className="rounded-xl border-2 border-border focus:border-primary bg-background px-3 py-2.5 text-sm outline-none" />
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street / estate / building" className="sm:col-span-2 rounded-xl border-2 border-border focus:border-primary bg-background px-3 py-2.5 text-sm outline-none" />
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Town / city" className="rounded-xl border-2 border-border focus:border-primary bg-background px-3 py-2.5 text-sm outline-none" />
              <select className="rounded-xl border-2 border-border focus:border-primary bg-background px-3 py-2.5 text-sm outline-none">
                <option>Nairobi region</option>
                <option>Coast region</option>
                <option>Western region</option>
                <option>Rift Valley region</option>
                <option>Eastern region</option>
              </select>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Payment method
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`relative flex items-center gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition ${
                      active ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-secondary/50 bg-background"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl ${m.accent} text-white flex items-center justify-center shrink-0`}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black text-secondary text-sm">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.tag}</div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${active ? "border-primary bg-primary" : "border-border"}`}>
                      {active && <span className="block h-full w-full rounded-full bg-card scale-50" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Method-specific input */}
            {(method === "mpesa" || method === "airtel") && (
              <div className="mt-4 rounded-xl bg-muted/40 border border-border p-3">
                <label className="text-[11px] font-grotesk uppercase tracking-wider text-muted-foreground">
                  {method === "mpesa" ? "M-Pesa number" : "Airtel Money number"}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={method === "mpesa" ? "0712 345 678" : "0732 345 678"}
                  className="mt-1 w-full rounded-lg border-2 border-border focus:border-primary bg-background px-3 py-2 text-sm outline-none"
                />
                <p className="text-[11px] text-muted-foreground mt-2">
                  You'll receive an STK push to confirm the payment.
                </p>
              </div>
            )}
            {method === "card" && (
              <div className="mt-4 rounded-xl bg-muted/40 border border-border p-3 space-y-2">
                <input placeholder="Card number" className="w-full rounded-lg border-2 border-border focus:border-primary bg-background px-3 py-2 text-sm outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM/YY" className="rounded-lg border-2 border-border focus:border-primary bg-background px-3 py-2 text-sm outline-none" />
                  <input placeholder="CVV" className="rounded-lg border-2 border-border focus:border-primary bg-background px-3 py-2 text-sm outline-none" />
                </div>
              </div>
            )}
            {method === "cod" && (
              <p className="mt-3 text-xs text-muted-foreground">
                Have the exact cash ready when the rider arrives. KES 100 handling fee applies.
              </p>
            )}
          </div>
        </div>

        {/* Right — summary */}
        <aside className="space-y-3 lg:sticky lg:top-24 self-start">
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-3">Order summary</h2>
            <div className="text-sm space-y-2 mb-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Items ({totalItems})</span>
                <span>{currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `${currency} ${shipping}`}</span>
              </div>
              <div className="flex justify-between font-display font-black text-secondary text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>{currency} {total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground rounded-full py-3 font-grotesk font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-card transition"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {submitting ? "Processing…" : `Pay ${currency} ${total.toFixed(0)}`}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Secure checkout · Your details are protected
            </p>
          </div>
        </aside>
      </form>

      <MobileBottomNav />
    </div>
  );
};

export default Checkout;
