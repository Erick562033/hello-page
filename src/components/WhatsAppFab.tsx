import { useLocation } from "react-router-dom";
import { whatsappLink } from "@/lib/contact";

/**
 * Floating WhatsApp button — visible on every page except /chat and /auth
 * to avoid colliding with their own action bars.
 */
export const WhatsAppFab = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/chat") || pathname.startsWith("/auth")) return null;

  return (
    <a
      href={whatsappLink("Hi Wajose! I have a question about a product.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed z-40 right-4 bottom-20 md:bottom-6 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <span className="relative flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-elevated border-2 border-white hover:scale-110 transition-transform">
        {/* Inline WhatsApp glyph — keeps brand colour even without lucide */}
        <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.7 2.834.715h.144c.667 0 2.292-.214 2.66-1.43.124-.413.124-.815.085-1.143-.027-.156-.1-.213-.213-.27-.213-.114-2.56-1-2.717-1zM16.005 5C9.394 5 4.05 10.355 4.05 16.95c0 2.347.682 4.522 1.853 6.366l-1.78 5.21 5.4-1.726a11.86 11.86 0 0 0 6.502 1.926c6.61 0 11.97-5.36 11.97-11.96-.018-6.595-5.378-11.95-11.99-11.95M16.018 26.85c-1.997 0-3.94-.61-5.59-1.74l-2.84.92.927-2.752a9.853 9.853 0 0 1-1.91-5.83c0-5.45 4.45-9.9 9.9-9.9s9.9 4.45 9.9 9.9c-.005 5.467-4.456 9.9-9.917 9.9"/>
        </svg>
      </span>
    </a>
  );
};
