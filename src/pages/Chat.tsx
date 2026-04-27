import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { whatsappLink, WHATSAPP_DISPLAY } from "@/lib/contact";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What sizes do your oxfords come in?",
  "How long is delivery to Mombasa?",
  "Do you accept M-Pesa?",
  "Recommend a carpet for a small living room",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "**Karibu Wajose!** 👋 I'm your shopping concierge. Ask me about sizes, fabrics, delivery, payments — anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > next.length) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (resp.status === 429) {
        toast.error("Too many messages — please slow down.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Try WhatsApp instead.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) upsertAssistant(delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Couldn't reach the assistant. Try WhatsApp instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact chat header */}
      <header className="sticky top-0 z-40 gradient-emerald text-secondary-foreground shadow-card">
        <div className="container mx-auto px-3 sm:px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-secondary" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="font-display text-base sm:text-lg font-black truncate">Wajose Concierge</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/85">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              {loading ? "typing…" : "Online · usually replies instantly"}
            </div>
          </div>
          <a
            href={whatsappLink("Hi, I was chatting on the app and need a human.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-grotesk uppercase tracking-wider bg-[#25D366]/20 hover:bg-[#25D366]/30 px-3 py-1.5 rounded-full transition"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-3 max-w-3xl w-full mx-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="h-8 w-8 mr-2 rounded-full gradient-emerald text-accent flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-secondary text-secondary-foreground rounded-br-sm"
                  : "bg-card border border-border rounded-bl-sm"
              }`}
            >
              {/* lightweight markdown — bold + line breaks */}
              {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} className="font-bold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="h-8 w-8 mr-2 rounded-full gradient-emerald text-accent flex items-center justify-center mt-1">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="h-2 w-2 bg-secondary/60 rounded-full animate-bounce" />
              <span className="h-2 w-2 bg-secondary/60 rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="h-2 w-2 bg-secondary/60 rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}

        {/* Suggestions only on first turn */}
        {messages.length === 1 && (
          <div className="pt-2">
            <div className="text-[11px] font-grotesk uppercase tracking-[0.22em] text-muted-foreground mb-2 px-1">
              Try asking
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs bg-card border border-border hover:border-secondary hover:bg-muted/50 rounded-full px-3 py-2 transition text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 bg-card border-t border-border p-2 sm:p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="max-w-3xl mx-auto flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about sizes, delivery, payments…"
            className="flex-1 resize-none max-h-32 rounded-2xl border-2 border-secondary/30 focus:border-primary bg-background px-4 py-3 text-sm outline-none transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center shadow-card transition"
            aria-label="Send"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
        <div className="text-center text-[10px] text-muted-foreground mt-1.5">
          Need a human?{" "}
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-[#128C7E] font-semibold underline">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Chat;
