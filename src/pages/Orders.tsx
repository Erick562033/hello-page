import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Package, MapPin, Smartphone, CreditCard, Banknote, ShoppingBag, Sparkles } from "lucide-react";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useOrdersStore, STATUS_META } from "@/stores/ordersStore";

const methodIcon = (m: string) => {
  switch (m) {
    case "mpesa":
    case "airtel":
      return Smartphone;
    case "card":
      return CreditCard;
    default:
      return Banknote;
  }
};

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const Orders = () => {
  const orders = useOrdersStore((s) => s.orders);
  const seedIfEmpty = useOrdersStore((s) => s.seedIfEmpty);

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/account" className="hover:text-primary">Account</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">Orders</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-3xl md:text-4xl font-black text-secondary">
              My <em className="not-italic text-primary">orders</em>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Track every parcel from packing to your door.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-accent/20 text-secondary text-xs font-grotesk font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0">
            <Package className="h-3.5 w-3.5" /> {orders.length}
          </span>
        </div>
      </section>

      <main className="container mx-auto px-4 mt-5 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="h-9 w-9 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-black text-secondary">No orders yet</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Once you place your first order, you'll be able to track it right here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 mt-5 bg-primary text-primary-foreground rounded-full px-5 py-3 font-grotesk font-semibold uppercase tracking-wider text-xs shadow-card"
            >
              <Sparkles className="h-3.5 w-3.5" /> Start shopping
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const Icon = methodIcon(o.paymentMethod);
            const meta = STATUS_META[o.status];
            return (
              <Link
                key={o.id}
                to={`/orders/${o.id}`}
                className="block bg-card rounded-2xl border border-border shadow-soft hover:shadow-elevated transition p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-[11px] font-grotesk uppercase tracking-wider text-muted-foreground">
                      Order #{o.id}
                    </div>
                    <div className="font-display font-black text-secondary text-lg mt-0.5">
                      {o.currency} {o.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Placed {formatDate(o.createdAt)} · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`text-[10px] font-grotesk font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 min-w-0 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{o.delivery.address}, {o.delivery.city}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="uppercase font-bold tracking-wider text-[10px]">{o.paymentMethod}</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {o.status === "delivered"
                      ? "Delivered"
                      : o.status === "cancelled"
                      ? "Cancelled"
                      : `ETA ${formatDate(o.estimatedDelivery)}`}
                  </span>
                  <span className="text-xs font-grotesk font-bold text-primary inline-flex items-center gap-1">
                    Track <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Orders;
