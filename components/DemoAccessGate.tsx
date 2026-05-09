"use client";

import { FormEvent, useEffect, useState } from "react";

const SESSION_KEY = "memory-assistant-demo-unlocked";
const DEMO_PASSWORD = "memory2026";

type DemoAccessGateProps = {
  children: React.ReactNode;
};

export default function DemoAccessGate({ children }: DemoAccessGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isUnlocked = window.sessionStorage.getItem(SESSION_KEY) === "true";
    setUnlocked(isUnlocked);
  }, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (password === DEMO_PASSWORD) {
      setUnlocked(true);
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setError("");
      return;
    }

    setError("Incorrect password. Please try again.");
  };

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-bg/95 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-lg">
          <h1 className="text-2xl font-semibold text-brand-text">Demo Access</h1>
          <p className="mt-2 text-sm text-brand-muted">Enter the demo password to continue.</p>
          <label className="mt-4 block text-sm text-brand-muted">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
            />
          </label>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-brand-primary px-4 py-3 text-base font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass"
          >
            Enter demo
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

