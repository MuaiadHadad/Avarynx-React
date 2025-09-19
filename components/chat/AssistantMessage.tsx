"use client";

import React, { memo } from "react";
import { useTypewriter } from "./useTypewriter";
import { marked } from "marked";
import DOMPurify from "dompurify";

export type AssistantMessageProps = {
  text: string;
  animate?: boolean;
  cps?: number; // characters per second
  className?: string;
};

function renderMarkdownSafe(md: string) {
  const raw = marked.parse(md, { breaks: true });
  const clean = DOMPurify.sanitize(typeof raw === "string" ? raw : String(raw));
  return { __html: clean };
}

function AssistantMessageBase({ text, animate = true, cps = 40, className }: AssistantMessageProps) {
  const shown = animate ? useTypewriter(text, { cps }) : text;

  return (
    <div className={className}>
      <div
        className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed"
        // We trust only sanitized HTML
        dangerouslySetInnerHTML={renderMarkdownSafe(shown)}
      />
      {/* Blinking caret while still streaming */}
      {animate && shown.length < text.length && (
        <span className="inline-block w-2 h-5 align-[-2px] ml-0.5 bg-white/70 animate-pulse" />
      )}
    </div>
  );
}

export const AssistantMessage = memo(AssistantMessageBase);

