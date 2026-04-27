import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderStatus = "placed" | "confirmed" | "packed" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem {
  variantId: string;
  title: string;
  image?: string | null;
  quantity: number;
  price: { amount: string; currencyCode: string };
}

export interface OrderEvent {
  status: OrderStatus;
  at: number;
  note?: string;
}

export interface Order {
  id: string;            // human-friendly e.g. WJ-20260427-3F2A
  createdAt: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentMethod: "mpesa" | "airtel" | "card" | "cod";
  delivery: { name: string; phone: string; address: string; city: string; region?: string };
  timeline: OrderEvent[];
  estimatedDelivery: number;
}

interface OrdersStore {
  orders: Order[];
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "timeline" | "estimatedDelivery">) => Order;
  updateStatus: (id: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (id: string) => void;
  getOrder: (id: string) => Order | undefined;
  seedIfEmpty: () => void;
}

const makeId = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `WJ-${ymd}-${rand}`;
};

const DAY = 86_400_000;

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (input) => {
        const now = Date.now();
        const order: Order = {
          ...input,
          id: makeId(),
          createdAt: now,
          status: "placed",
          timeline: [{ status: "placed", at: now, note: "Order received" }],
          estimatedDelivery: now + 4 * DAY,
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },

      updateStatus: (id, status, note) => {
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now(), note }] }
              : o
          ),
        });
      },

      cancelOrder: (id) => get().updateStatus(id, "cancelled", "Cancelled by customer"),

      getOrder: (id) => get().orders.find((o) => o.id === id),

      seedIfEmpty: () => {
        if (get().orders.length > 0) return;
        const now = Date.now();
        const sample: Order[] = [
          {
            id: "WJ-20260420-A1B2",
            createdAt: now - 7 * DAY,
            status: "delivered",
            items: [
              {
                variantId: "demo-1",
                title: "Ankara Print Maxi Dress",
                quantity: 1,
                price: { amount: "3499", currencyCode: "KES" },
              },
            ],
            subtotal: 3499,
            shipping: 0,
            total: 3499,
            currency: "KES",
            paymentMethod: "mpesa",
            delivery: { name: "Sample Customer", phone: "+254700000000", address: "Kilimani", city: "Nairobi" },
            timeline: [
              { status: "placed", at: now - 7 * DAY },
              { status: "confirmed", at: now - 7 * DAY + 3600_000 },
              { status: "packed", at: now - 6 * DAY },
              { status: "shipped", at: now - 5 * DAY },
              { status: "out_for_delivery", at: now - 4 * DAY },
              { status: "delivered", at: now - 4 * DAY + 6 * 3600_000, note: "Left at front desk" },
            ],
            estimatedDelivery: now - 4 * DAY,
          },
          {
            id: "WJ-20260425-C3D4",
            createdAt: now - 2 * DAY,
            status: "shipped",
            items: [
              {
                variantId: "demo-2",
                title: "Kitenge Two-Piece Set",
                quantity: 1,
                price: { amount: "5200", currencyCode: "KES" },
              },
              {
                variantId: "demo-3",
                title: "Beaded Maasai Sandals",
                quantity: 2,
                price: { amount: "1800", currencyCode: "KES" },
              },
            ],
            subtotal: 8800,
            shipping: 0,
            total: 8800,
            currency: "KES",
            paymentMethod: "card",
            delivery: { name: "Sample Customer", phone: "+254700000000", address: "Westlands", city: "Nairobi" },
            timeline: [
              { status: "placed", at: now - 2 * DAY },
              { status: "confirmed", at: now - 2 * DAY + 1800_000 },
              { status: "packed", at: now - 1.5 * DAY },
              { status: "shipped", at: now - 1 * DAY, note: "Picked up by courier" },
            ],
            estimatedDelivery: now + 2 * DAY,
          },
        ];
        set({ orders: sample });
      },
    }),
    {
      name: "wajose-orders",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const STATUS_META: Record<OrderStatus, { label: string; color: string; step: number }> = {
  placed:           { label: "Placed",           color: "bg-muted text-muted-foreground",          step: 1 },
  confirmed:        { label: "Confirmed",        color: "bg-secondary/15 text-secondary",          step: 2 },
  packed:           { label: "Packed",           color: "bg-accent/30 text-secondary",             step: 3 },
  shipped:          { label: "Shipped",          color: "bg-primary/15 text-primary",              step: 4 },
  out_for_delivery: { label: "Out for delivery", color: "bg-primary/25 text-primary",              step: 5 },
  delivered:        { label: "Delivered",        color: "bg-success/20 text-success",              step: 6 },
  cancelled:        { label: "Cancelled",        color: "bg-destructive/15 text-destructive",      step: 0 },
};

export const STATUS_FLOW: OrderStatus[] = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
