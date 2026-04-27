import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Package,
  Truck,
  Home,
  ClipboardCheck,
  PackageCheck,
  XCircle,
  Phone,
  MapPin,
  Copy,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useOrdersStore, STATUS_META, STATUS_FLOW, type OrderStatus } from "@/stores/ordersStore";
import { whatsappLink } from "@/lib/contact";

const stepIcon: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  placed: ClipboardCheck,
  confirmed: CheckCircle2,
  packed: PackageCheck,
  shipped: Package,
  out_for_delivery: Truck,
  delivered: Home,
  cancelled: XCircle,
};

const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const OrderDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const cancelOrder = useOrdersStore((s) => s.cancelOrder);
  const seedIfEmpty = useOrdersStore((s) => s.seedIfEmpty);

  useEffect(() => {
    seedIfEmpty();
  }, [seedIfEmpty]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <StoreHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-black text-secondary">Order not found</h1>
          <p className="text-sm text-muted-foreground mt-2">We couldn't find an order with that ID.</p>
          <Link
            to="/orders"
            className="inline-flex mt-5 bg-primary text-primary-foreground rounded-full px-5 py-3 font-grotesk uppercase text-xs font-bold tracking-wider"
          >
            Back to orders
          </Link>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  const meta = STATUS_META[order.status];
  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? 0 : meta.step;
  const progressPct = isCancelled ? 0 : Math.round((currentStep / STATUS_FLOW.length) * 100);

  const copyId = async () => {
    await navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied");
  };

  const whatsappTrack = () => {
    window.open(whatsappLink(`Hi Wajose, please update me on order ${order.id}.`), "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 texture-paper">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground flex-wrap">
          <Link to="/" className="flex items-center gap-1 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/orders" className="hover:text-primary">Orders</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold truncate max-w-[160px]">{order.id}</span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-secondary leading-tight">
              Tracking <span className="text-primary">.</span>
            </h1>
            <button
              onClick={copyId}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-grotesk text-muted-foreground hover:text-primary transition"
            >
              #{order.id} <Copy className="h-3 w-3" />
            </button>
          </div>
          <span className={`text-[10px] font-grotesk font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.color}`}>
            {meta.label}
          </span>
        </div>
      </section>

      <main className="container mx-auto px-4 mt-5 grid lg:grid-cols-[1fr_360px] gap-5">
        {/* Left — tracker + timeline */}
        <div className="space-y-4">
          {/* Progress bar */}
          {!isCancelled && (
            <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
              <div className="flex justify-between text-[10px] font-grotesk font-bold uppercase tracking-wider text-muted-foreground mb-2">
                <span>Placed</span>
                <span>Delivered</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-secondary font-display font-bold">
                {order.status === "delivered"
                  ? "🎉 Your order has been delivered"
                  : `Estimated delivery: ${new Date(order.estimatedDelivery).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}`}
              </p>
            </div>
          )}

          {/* Step tracker */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-4">Journey</h2>

            {isCancelled ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-grotesk font-bold uppercase text-xs tracking-wider">This order was cancelled</span>
              </div>
            ) : (
              <ol className="space-y-3">
                {STATUS_FLOW.map((s, i) => {
                  const Icon = stepIcon[s];
                  const reached = STATUS_META[order.status].step >= STATUS_META[s].step;
                  const event = order.timeline.find((e) => e.status === s);
                  return (
                    <li key={s} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        reached ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className={`font-display font-bold text-sm ${reached ? "text-secondary" : "text-muted-foreground"}`}>
                          {STATUS_META[s].label}
                        </div>
                        {event ? (
                          <div className="text-[11px] text-muted-foreground">
                            {formatDateTime(event.at)}{event.note ? ` · ${event.note}` : ""}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground/70 italic">Pending</div>
                        )}
                      </div>
                      {i < STATUS_FLOW.length - 1 && reached && (
                        <Circle className="hidden" />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Items */}
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-3">Items ({order.items.length})</h2>
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.variantId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {it.image ? (
                      <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display font-bold text-secondary truncate">{it.title}</div>
                    <div className="text-[11px] text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div className="font-display font-black text-primary text-sm shrink-0">
                    {it.price.currencyCode} {(parseFloat(it.price.amount) * it.quantity).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right — summary, delivery, actions */}
        <aside className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-3">Summary</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{order.currency} {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>{order.shipping === 0 ? "FREE" : `${order.currency} ${order.shipping}`}</span>
              </div>
              <div className="flex justify-between font-display font-black text-secondary text-lg pt-2 border-t border-border">
                <span>Total</span><span>{order.currency} {order.total.toLocaleString()}</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider font-grotesk text-muted-foreground pt-2">
                Paid via <span className="text-secondary font-bold">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-soft">
            <h2 className="font-display font-black text-secondary mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Delivery
            </h2>
            <div className="text-sm text-foreground font-medium">{order.delivery.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{order.delivery.address}</div>
            <div className="text-xs text-muted-foreground">{order.delivery.city}{order.delivery.region ? `, ${order.delivery.region}` : ""}</div>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" /> {order.delivery.phone}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={whatsappTrack}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-3 font-grotesk font-bold uppercase tracking-wider text-xs shadow-card hover:opacity-95 transition"
            >
              <MessageCircle className="h-4 w-4" /> Chat support on WhatsApp
            </button>
            {!isCancelled && order.status !== "delivered" && order.status !== "shipped" && order.status !== "out_for_delivery" && (
              <button
                onClick={() => {
                  cancelOrder(order.id);
                  toast.success("Order cancelled");
                  navigate("/orders");
                }}
                className="w-full inline-flex items-center justify-center gap-2 border-2 border-destructive/40 text-destructive rounded-full py-3 font-grotesk font-bold uppercase tracking-wider text-xs hover:bg-destructive/10 transition"
              >
                <XCircle className="h-4 w-4" /> Cancel order
              </button>
            )}
          </div>
        </aside>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default OrderDetail;
