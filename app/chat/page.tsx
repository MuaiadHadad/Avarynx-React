"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { ChatWebSocketManager } from "@/lib/websocket";
import clsx from "clsx";

function useChatWS() {
  const managerRef = useRef<ChatWebSocketManager | null>(null);
  const [state, setState] = useState<{
    status: "Disconnected" | "Connecting" | "Connected" | "Closing" | "Closed";
    error?: string;
  }>({ status: "Disconnected" });

  const connect = async () => {
    if (!managerRef.current) managerRef.current = new ChatWebSocketManager();
    setState({ status: "Connecting" });
    try {
      await managerRef.current.connect(
        () => {
          // message handler will be set via setOnMessage
        },
        (err) => {
          const msg = err instanceof Error ? err.message : (err as any)?.message || "WebSocket error";
          setState({ status: "Closed", error: msg });
        },
      );
      setState({ status: "Connected" });
    } catch (e) {
      setState({ status: "Closed", error: (e as Error)?.message || "Failed to connect" });
    }
  };

  const disconnect = () => {
    managerRef.current?.disconnect();
    setState({ status: "Closed" });
  };

  const isConnected = () => !!managerRef.current?.isConnected();
  const send = (payload: unknown) => managerRef.current?.sendMessage(payload);
  const setOnMessage = (cb: (m: unknown) => void) => {
    const mgr = managerRef.current;
    if (!mgr) return;
    mgr.connect(cb).catch(() => void 0);
  };

  return { connect, disconnect, isConnected, send, setOnMessage, state } as const;
}

export default function Page() {
  const { connect, disconnect, isConnected, send, setOnMessage, state } = useChatWS();
  const [input, setInput] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [log, setLog] = useState<string[]>([]);

  // Attach message handler once connected
  useEffect(() => {
    if (!isConnected()) return;
    setOnMessage((data) => {
      try {
        if (typeof data === "string") {
          setAssistantText((t) => t + data);
          setLog((l) => [...l, `str:${data.slice(0, 40)}`]);
          return;
        }
        const d = data as Record<string, unknown>;
        // Handle common streaming shapes
        const delta = (d.delta as string) || (d.text as string) || (d.content as string) || "";
        if (delta) {
          setAssistantText((t) => t + delta);
          setLog((l) => [...l, `obj:${delta.slice(0, 40)}`]);
          return;
        }
        // Fallback entire message as string
        const s = JSON.stringify(d);
        setAssistantText((t) => t + s);
        setLog((l) => [...l, `json:${s.slice(0, 40)}`]);
      } catch (e) {
        setLog((l) => [...l, `parse-error:${(e as Error).message}`]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected()]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAssistantText("");
    // Try a few common payload shapes
    send?.({ role: "user", content: input });
    send?.(input);
    setInput("");
  };

  const statusColor = useMemo(
    () =>
      state.status === "Connected"
        ? "text-emerald-500"
        : state.status === "Connecting"
        ? "text-amber-400"
        : "text-zinc-400",
    [state.status],
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] mx-auto max-w-3xl px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chat demo</h1>
        <div className="flex items-center gap-3">
          <span className={clsx("text-sm", statusColor)}>{state.status}</span>
          {state.status !== "Connected" ? (
            <button onClick={connect} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-sm">
              Conectar
            </button>
          ) : (
            <button onClick={disconnect} className="px-3 py-1.5 rounded bg-rose-600 text-white text-sm">
              Desconectar
            </button>
          )}
        </div>
      </header>

      <section className="rounded-lg border border-white/10 p-4 bg-white/5">
        <div className="text-xs text-zinc-400 mb-2">Assistente</div>
        <AssistantMessage text={assistantText || ""} animate cps={50} />
      </section>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-white/10 bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Escreva sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60"
          disabled={!isConnected()}
        >
          Enviar
        </button>
      </form>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}

      <details className="text-xs text-zinc-500">
        <summary>Debug</summary>
        <pre className="whitespace-pre-wrap break-words">{log.join("\n")}</pre>
      </details>
    </main>
  );
}
