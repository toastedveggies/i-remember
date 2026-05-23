"use client";

import { useEffect, useMemo, useState } from "react";
import ResponseCard from "@/components/ResponseCard";
import ScenarioSelector from "@/components/ScenarioSelector";
import { describeScenarioLocation } from "@/data/demoData";
import {
  appendSystemEvent,
  createEvent,
  demoScenarios,
  findScenario,
  generateId,
  initialDemoState,
  normalizeDemoState,
  setActiveCaregiverId,
  setIndependentMode,
  storageKey,
  type DemoState,
  type PronounSet,
  type TrustedLocation
} from "@/data/demoState";
import { clearTrustedLocation, loadTrustedLocations, saveTrustedLocation } from "@/lib/places";
import { loadProfile, saveCaregiverName, saveProfile } from "@/lib/profile";
import { clearSeedData, seedDemoData } from "@/lib/seedData";
import { supabase } from "@/lib/supabaseClient";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

type RosterEntry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relationship_label: string | null;
  role: "primary" | "family" | "read_only";
  is_primary_contact: boolean;
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  relationship_label: string;
  role: "primary" | "family" | "read_only";
  is_primary_contact: boolean;
};

function loadState(): DemoState {
  if (typeof window === "undefined") {
    return initialDemoState;
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return initialDemoState;
  }

  try {
    return normalizeDemoState(JSON.parse(raw));
  } catch {
    return initialDemoState;
  }
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState>(initialDemoState);
  const [resetMessage, setResetMessage] = useState("");
  const [activityCount, setActivityCount] = useState<number | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [seedStatus, setSeedStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [showRosterForm, setShowRosterForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "", email: "", phone: "", relationship_label: "", role: "family", is_primary_contact: false,
  });
  const [isSavingCaregiver, setIsSavingCaregiver] = useState(false);
  const [rosterMessage, setRosterMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [locationMessage, setLocationMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const hasLocalData = window.localStorage.getItem(storageKey) !== null;
    setState(loadState());
    if (!hasLocalData) {
      Promise.all([loadProfile(), loadTrustedLocations()]).then(([supabaseProfile, supabaseLocations]) => {
        setState((prev) => ({
          ...prev,
          profile: supabaseProfile ?? prev.profile,
          trustedLocations: supabaseLocations.length > 0 ? supabaseLocations : prev.trustedLocations
        }));
      });
    }
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));

    fetchRoster();
  }, []);

  const activeScenario = useMemo(() => findScenario(state.activeScenarioId), [state.activeScenarioId]);
  const scenarioLocationPreview = useMemo(
    () => describeScenarioLocation(activeScenario, state.trustedLocations).label,
    [activeScenario, state.trustedLocations]
  );

  const persist = (next: DemoState) => {
    setState(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const selectScenario = (scenarioId: string) => {
    const next = appendSystemEvent(
      { ...state, activeScenarioId: scenarioId },
      createEvent("demo_scenario_selected", "demo", scenarioId, undefined, state.profile.userId)
    );
    persist(next);
  };

  const updateProfile = (field: "preferredName" | "caregiverName" | "caregiverRelationshipLabel" | "customPronouns", value: string) => {
    const newProfile = { ...state.profile, [field]: value };
    persist({ ...state, profile: newProfile });
    if (field === "caregiverName" || field === "caregiverRelationshipLabel") {
      saveCaregiverName(newProfile.caregiverName, newProfile.caregiverRelationshipLabel);
    } else {
      saveProfile(newProfile);
    }
  };

  const updatePronouns = (pronouns: PronounSet) => {
    const newProfile = { ...state.profile, pronouns };
    persist({ ...state, profile: newProfile });
    saveProfile(newProfile);
  };

  const trustedLocationForSlot = (slot: 1 | 2 | 3): TrustedLocation => {
    return state.trustedLocations.find((location) => location.trustedSlot === slot) ?? {
      trustedSlot: slot,
      name: "",
      address: "",
      instructions: ""
    };
  };

  const updateTrustedLocationDraft = (
    slot: 1 | 2 | 3,
    field: "name" | "address" | "instructions",
    value: string
  ) => {
    const current = trustedLocationForSlot(slot);
    const updatedLocation: TrustedLocation = { ...current, [field]: value };
    const nextLocations = [...state.trustedLocations.filter((location) => location.trustedSlot !== slot), updatedLocation]
      .sort((a, b) => a.trustedSlot - b.trustedSlot);
    persist({ ...state, trustedLocations: nextLocations });
    setLocationMessage(null);
  };

  const handleSaveTrustedLocation = async (slot: 1 | 2 | 3) => {
    const location = trustedLocationForSlot(slot);
    if (!location.name.trim()) {
      setLocationMessage({ type: "error", text: `Trusted location ${slot} needs a name before it can be saved.` });
      return;
    }

    try {
      const saved = await saveTrustedLocation({
        ...location,
        name: location.name.trim(),
        address: location.address?.trim(),
        instructions: location.instructions?.trim()
      }, state.profile.userId);

      const nextLocations = [...state.trustedLocations.filter((entry) => entry.trustedSlot !== slot), saved]
        .sort((a, b) => a.trustedSlot - b.trustedSlot);
      persist({ ...state, trustedLocations: nextLocations });
      setLocationMessage({ type: "success", text: `Trusted location ${slot} saved.` });
    } catch {
      setLocationMessage({ type: "error", text: `Trusted location ${slot} could not be saved to Supabase.` });
    }
  };

  const handleClearTrustedLocation = async (slot: 1 | 2 | 3) => {
    try {
      await clearTrustedLocation(slot, state.profile.userId);
    } catch {
      // non-fatal
    }

    const nextLocations = state.trustedLocations.filter((location) => location.trustedSlot !== slot);
    persist({ ...state, trustedLocations: nextLocations });
    setLocationMessage({ type: "success", text: `Trusted location ${slot} cleared.` });
  };

  const toggleIndependentMode = () => {
    const updated = setIndependentMode(!state.profile.independentMode);
    setState(updated);
  };

  const fetchRoster = async () => {
    setRosterLoading(true);
    try {
      const { data: rels } = await (supabase as any)
        .from("caregiver_user_relationships")
        .select("caregiver_id, role, is_primary_contact")
        .eq("user_id", DEMO_USER_ID);

      if (!rels || rels.length === 0) {
        setRoster([]);
        setRosterLoading(false);
        return;
      }

      const ids = (rels as Record<string, unknown>[]).map((r) => r.caregiver_id);
      const { data: caregivers } = await (supabase as any)
        .from("caregivers")
        .select("id, name, email, phone, relationship_label")
        .in("id", ids)
        .is("deleted_at", null);

      if (!caregivers) {
        setRoster([]);
        setRosterLoading(false);
        return;
      }

      const merged: RosterEntry[] = (caregivers as Record<string, unknown>[]).map((c) => {
        const rel = (rels as Record<string, unknown>[]).find((r) => r.caregiver_id === c.id) ?? {};
        return {
          id: c.id as string,
          name: c.name as string,
          email: (c.email as string | null) ?? null,
          phone: (c.phone as string | null) ?? null,
          relationship_label: (c.relationship_label as string | null) ?? null,
          role: ((rel as Record<string, unknown>).role as "primary" | "family" | "read_only") ?? "family",
          is_primary_contact: ((rel as Record<string, unknown>).is_primary_contact as boolean) ?? false,
        };
      });
      setRoster(merged);
    } catch {
      setRoster([]);
    }
    setRosterLoading(false);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormValues({ name: "", email: "", phone: "", relationship_label: "", role: "family", is_primary_contact: false });
    setRosterMessage(null);
    setShowRosterForm(true);
  };

  const openEditForm = (entry: RosterEntry) => {
    setEditingId(entry.id);
    setFormValues({
      name: entry.name,
      email: entry.email ?? "",
      phone: entry.phone ?? "",
      relationship_label: entry.relationship_label ?? "",
      role: entry.role,
      is_primary_contact: entry.is_primary_contact,
    });
    setRosterMessage(null);
    setShowRosterForm(true);
  };

  const handleSaveCaregiver = async () => {
    if (!formValues.name.trim()) {
      setRosterMessage({ type: "error", text: "Name is required." });
      return;
    }
    setIsSavingCaregiver(true);
    setRosterMessage(null);
    try {
      if (editingId) {
        await (supabase as any).from("caregivers").update({
          name: formValues.name.trim(),
          email: formValues.email.trim() || null,
          phone: formValues.phone.trim() || null,
          relationship_label: formValues.relationship_label.trim() || null,
        }).eq("id", editingId);
        await (supabase as any).from("caregiver_user_relationships").update({
          role: formValues.role,
          is_primary_contact: formValues.is_primary_contact,
        }).eq("caregiver_id", editingId).eq("user_id", DEMO_USER_ID);
      } else {
        const newId = generateId();
        await (supabase as any).from("caregivers").insert({
          id: newId,
          name: formValues.name.trim(),
          email: formValues.email.trim() || null,
          phone: formValues.phone.trim() || null,
          relationship_label: formValues.relationship_label.trim() || null,
        });
        await (supabase as any).from("caregiver_user_relationships").insert({
          user_id: DEMO_USER_ID,
          caregiver_id: newId,
          role: formValues.role,
          is_primary_contact: formValues.is_primary_contact,
          permissions: {},
        });
      }
      await fetchRoster();
      setShowRosterForm(false);
      setRosterMessage({ type: "success", text: editingId ? "Caregiver updated." : "Caregiver added." });
    } catch {
      setRosterMessage({ type: "error", text: "Save failed. Check Supabase connection." });
    }
    setIsSavingCaregiver(false);
  };

  const handleRemoveCaregiver = async (id: string) => {
    try {
      await (supabase as any).from("caregivers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    } catch {
      // fire-and-forget
    }
    if (state.profile.activeCaregiverId === id) {
      const updated = setActiveCaregiverId("00000000-0000-0000-0000-000000000002");
      setState(updated);
    }
    await fetchRoster();
  };

  const handleViewAs = (id: string) => {
    const updated = setActiveCaregiverId(id);
    setState(updated);
  };

  const fetchActivityCount = () => {
    supabase
      .from("activity_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", "00000000-0000-0000-0000-000000000001")
      .then(({ count }) => setActivityCount(count ?? 0));
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedStatus(null);
    const result = await seedDemoData();
    setIsSeeding(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) fetchActivityCount();
  };

  const handleClear = async () => {
    setIsClearing(true);
    setSeedStatus(null);
    const result = await clearSeedData();
    setIsClearing(false);
    setSeedStatus({ type: result.success ? "success" : "error", message: result.message });
    if (result.success) setActivityCount(0);
  };

  const resetDemoState = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    window.sessionStorage.removeItem("memory-assistant-demo-unlocked");
    setResetMessage("Demo state reset. Refresh to return to locked entry screen.");
    setState(initialDemoState);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-brand-text">Scenario Demo Simulator</h1>
          <p className="text-base text-brand-muted">Practice supportive responses with sample situations.</p>
        </header>

        <ResponseCard
          title="Demo intent"
          message="This simulator shows MVP support behavior only. It does not provide diagnosis or emergency medical instruction."
        />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Profile personalization (MVP onboarding)</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Preferred name</span>
              <input
                value={state.profile.preferredName}
                onChange={(e) => updateProfile("preferredName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver name</span>
              <input
                value={state.profile.caregiverName}
                onChange={(e) => updateProfile("caregiverName", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Caregiver label</span>
              <input
                value={state.profile.caregiverRelationshipLabel ?? ""}
                onChange={(e) => updateProfile("caregiverRelationshipLabel", e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              />
            </label>
            <label className="space-y-1 text-sm text-brand-muted">
              <span>Pronouns</span>
              <select
                value={state.profile.pronouns}
                onChange={(e) => updatePronouns(e.target.value as PronounSet)}
                className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
              >
                <option value="he/him">he/him</option>
                <option value="she/her">she/her</option>
                <option value="they/them">they/them</option>
                <option value="custom">custom</option>
              </select>
            </label>
            {state.profile.pronouns === "custom" ? (
              <label className="space-y-1 text-sm text-brand-muted md:col-span-2">
                <span>Custom pronouns</span>
                <input
                  value={state.profile.customPronouns ?? ""}
                  onChange={(e) => updateProfile("customPronouns", e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-bg px-3 py-2 text-base text-brand-text"
                />
              </label>
            ) : null}
            <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg px-3 py-2">
              <span className="text-sm text-brand-muted">Independent Mode (no caregiver connected)</span>
              <button
                type="button"
                onClick={toggleIndependentMode}
                className={`rounded-xl px-4 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                  state.profile.independentMode
                    ? "bg-brand-primary text-white"
                    : "border border-brand-border bg-brand-surface text-brand-text"
                }`}
              >
                {state.profile.independentMode ? "On" : "Off"}
              </button>
            </div>
          </div>
        </section>

        {/* Caregiver Roster */}
        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-brand-text">Caregiver roster</h2>
            <button
              type="button"
              onClick={openAddForm}
              className="shrink-0 rounded-xl border border-brand-border bg-brand-bg px-3 py-1.5 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
            >
              + Add caregiver
            </button>
          </div>

          {rosterLoading ? (
            <p className="text-sm text-brand-muted">Loading roster…</p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-brand-muted">No caregivers found in Supabase for this user.</p>
          ) : (
            <ul className="space-y-2">
              {roster.map((entry) => {
                const roleLabel = entry.role === "read_only" ? "read only" : entry.role;
                return (
                  <li key={entry.id} className="flex flex-col gap-2 rounded-xl border border-brand-border bg-brand-bg px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-text">
                        {entry.name}
                        {entry.relationship_label ? (
                          <span className="ml-1 font-normal text-brand-muted">({entry.relationship_label})</span>
                        ) : null}
                      </p>
                      <p className="text-xs text-brand-muted">
                        {roleLabel}
                        {entry.is_primary_contact ? " · primary call contact" : ""}
                        {entry.id === "00000000-0000-0000-0000-000000000002" ? " · demo default" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditForm(entry)}
                        className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1 text-xs font-medium text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                      >
                        Edit
                      </button>
                      {entry.id !== "00000000-0000-0000-0000-000000000002" ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveCaregiver(entry.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {rosterMessage ? (
            <p className={`text-sm ${rosterMessage.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {rosterMessage.text}
            </p>
          ) : null}

          {showRosterForm ? (() => {
            const existingPrimary = roster.find((r) => r.is_primary_contact);
            const primaryLocked = !!existingPrimary && existingPrimary.id !== editingId;
            return (
              <div className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-4">
                <h3 className="text-base font-semibold text-brand-text">
                  {editingId ? "Edit caregiver" : "Add caregiver"}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Name <span className="text-red-500">*</span></span>
                    <input
                      value={formValues.name}
                      onChange={(e) => setFormValues((f) => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Relationship label</span>
                    <input
                      value={formValues.relationship_label}
                      onChange={(e) => setFormValues((f) => ({ ...f, relationship_label: e.target.value }))}
                      placeholder="e.g. daughter, son"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Email</span>
                    <input
                      type="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues((f) => ({ ...f, email: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Phone</span>
                    <input
                      type="tel"
                      value={formValues.phone}
                      onChange={(e) => setFormValues((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Role</span>
                    <select
                      value={formValues.role}
                      onChange={(e) => setFormValues((f) => ({ ...f, role: e.target.value as FormValues["role"] }))}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    >
                      <option value="primary">Primary — full dashboard</option>
                      <option value="family">Family — summary only</option>
                      <option value="read_only">Read only — summary only</option>
                    </select>
                  </label>
                  <div className="space-y-1">
                    <p className="text-sm text-brand-muted">Primary call contact</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={primaryLocked}
                        onClick={() => !primaryLocked && setFormValues((f) => ({ ...f, is_primary_contact: !f.is_primary_contact }))}
                        className={`rounded-xl px-4 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                          formValues.is_primary_contact
                            ? "bg-brand-primary text-white"
                            : "border border-brand-border bg-brand-surface text-brand-text"
                        } ${primaryLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {formValues.is_primary_contact ? "Yes" : "No"}
                      </button>
                    </div>
                    {primaryLocked ? (
                      <p className="text-xs text-brand-muted">
                        Only one caregiver can be the call contact.{" "}
                        {existingPrimary?.name} is currently set.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={isSavingCaregiver}
                    onClick={handleSaveCaregiver}
                    className="min-h-10 rounded-2xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
                  >
                    {isSavingCaregiver ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowRosterForm(false); setRosterMessage(null); }}
                    className="min-h-10 rounded-2xl border border-brand-border bg-brand-bg px-5 py-2 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })() : null}
        </section>

        {/* View as Caregiver — demo control only */}
        {roster.length > 0 ? (
          <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-3">
            <div className="space-y-0.5">
              <h2 className="text-xl font-semibold text-brand-text">View as caregiver</h2>
              <p className="text-xs text-brand-muted">Demo control — not a real login. Selects whose perspective /caregiver simulates.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roster.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleViewAs(entry.id)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-compass/40 ${
                    state.profile.activeCaregiverId === entry.id
                      ? "bg-brand-primary text-white"
                      : "border border-brand-border bg-brand-bg text-brand-text"
                  }`}
                >
                  {entry.name}
                  <span className="ml-1.5 text-xs font-normal opacity-75">
                    ({entry.role === "read_only" ? "read only" : entry.role})
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <ResponseCard title="Active scenario" message={`${activeScenario.label}: ${activeScenario.guidance} Current location: ${scenarioLocationPreview}.`} />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-brand-text">Trusted locations</h2>
            <p className="text-sm text-brand-muted">
              Save up to 3 trusted places. Scenarios can then use one of these saved locations or use Other.
            </p>
          </div>

          {[1, 2, 3].map((slotValue) => {
            const slot = slotValue as 1 | 2 | 3;
            const location = trustedLocationForSlot(slot);
            return (
              <div key={slot} className="rounded-2xl border border-brand-border bg-brand-bg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-brand-text">Trusted location {slot}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveTrustedLocation(slot)}
                      className="rounded-xl bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearTrustedLocation(slot)}
                      className="rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Name</span>
                    <input
                      value={location.name}
                      onChange={(e) => updateTrustedLocationDraft(slot, "name", e.target.value)}
                      placeholder={slot === 1 ? "Home" : `Trusted place ${slot}`}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted">
                    <span>Address</span>
                    <input
                      value={location.address ?? ""}
                      onChange={(e) => updateTrustedLocationDraft(slot, "address", e.target.value)}
                      placeholder="Street address or landmark"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-brand-muted md:col-span-2">
                    <span>Instructions</span>
                    <input
                      value={location.instructions ?? ""}
                      onChange={(e) => updateTrustedLocationDraft(slot, "instructions", e.target.value)}
                      placeholder="Helpful note for grounding or finding support here"
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-base text-brand-text"
                    />
                  </label>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface px-4 py-3">
            <p className="text-sm font-medium text-brand-text">Other</p>
            <p className="mt-1 text-sm text-brand-muted">
              Other is not saved as a fourth trusted location. It represents the person being somewhere outside the 1 to 3 saved trusted places.
            </p>
          </div>

          {locationMessage ? (
            <p className={`text-sm ${locationMessage.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {locationMessage.text}
            </p>
          ) : null}
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-text">Reset demo</h2>
          <p className="mt-2 text-sm text-brand-muted">
            Clears local demo data and re-enables password gate on refresh.
          </p>
          <button
            type="button"
            onClick={resetDemoState}
            className="mt-3 min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40"
          >
            Reset demo state
          </button>
          {resetMessage ? <p className="mt-2 text-sm text-brand-muted">{resetMessage}</p> : null}
        </section>

        <ScenarioSelector
          scenarios={demoScenarios.map((scenario) => ({
            ...scenario,
            locationLine: describeScenarioLocation(scenario, state.trustedLocations).label
          }))}
          activeScenarioId={state.activeScenarioId}
          onPreview={selectScenario}
        />

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-brand-text">Supabase Demo Data</h2>
          <p className="text-sm text-brand-muted">
            Activity events in Supabase:{" "}
            <span className="font-semibold text-brand-text">
              {activityCount === null ? "loading…" : activityCount}
            </span>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleSeed}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isSeeding ? "Seeding… (30–60 seconds)" : "Seed Year of Data"}
            </button>
            <button
              type="button"
              disabled={isSeeding || isClearing}
              onClick={handleClear}
              className="min-h-12 rounded-2xl border border-brand-border bg-brand-bg px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-compass/40 disabled:opacity-50"
            >
              {isClearing ? "Clearing…" : "Clear Seeded Data"}
            </button>
          </div>
          {isSeeding && (
            <p className="text-xs text-brand-muted">This may take 30–60 seconds. Please wait.</p>
          )}
          {seedStatus && (
            <p className={`text-sm ${seedStatus.type === "success" ? "text-brand-primary" : "text-red-600"}`}>
              {seedStatus.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
