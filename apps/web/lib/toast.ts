"use client";

// dead-simple toast: dispatch an event, <Toaster/> renders it. no lib.
export function toast(message: string, action?: { label: string; href: string }) {
  window.dispatchEvent(new CustomEvent("ckt-toast", { detail: { message, action } }));
}
