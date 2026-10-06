"use client";

import { useEffect, useState } from "react";

export default function StatusPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check URL query param for tracking code if navigated from home page
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get("trackingCode");
      if (codeFromUrl) {
        setTrackingCode(codeFromUrl.toUpperCase());
        fetchReservationStatus(codeFromUrl.toUpperCase());
      }
    }
  }, []);

  async function fetchReservationStatus(code) {
    if (!code) return;
    setError("");
    setReservation(null);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/reservations/status?trackingCode=${encodeURIComponent(code)}`
      );

      const result = await response.json();

      if (result.success) {
        setReservation(result.reservation);
      } else {
        setError(result.message || "Reservation not found.");
      }
    } catch (err) {
      console.error(err);
      setError("Could not check reservation status.");
    } finally {
      setLoading(false);
    }
  }

  async function checkStatus(e) {
    e.preventDefault();
    fetchReservationStatus(trackingCode);
  }

  function handleCopy() {
    if (!reservation?.trackingCode) return;
    navigator.clipboard?.writeText(reservation.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a152d]/95 backdrop-blur-md text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base sm:text-lg font-bold text-white shadow-md shadow-blue-900/40">
              <FlaskIcon className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight sm:text-base md:text-lg">
                Laboratory Equipment Manager
              </h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                Lab A · Reservation Tracking Portal
              </p>
            </div>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-white/10"
          >
            <span>← Return Home</span>
          </a>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* HERO / SEARCH TITLE */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-sm">
            <ClockIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span>Tracking Verification</span>
          </div>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Check Reservation Status
          </h2>

          <p className="mx-auto mt-2.5 max-w-lg text-xs leading-relaxed text-slate-500 sm:text-sm sm:leading-6">
            Enter the unique tracking code you received upon booking submission to view live approval and schedule updates.
          </p>
        </div>

        {/* SEARCH CARD */}
        <div className="mt-7 sm:mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <form onSubmit={checkStatus}>
            <label className="text-xs sm:text-sm font-semibold text-slate-700">
              Tracking Code
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LAB-7K2X9"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 sm:py-3.5 text-sm font-bold tracking-wider text-slate-800 uppercase outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {trackingCode && (
                  <button
                    type="button"
                    onClick={() => setTrackingCode("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4" />
                    <span>Check Status</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 text-[11px] sm:text-xs text-slate-400">
              Format: LAB-XXXXX (Letter case insensitive)
            </p>
          </form>

          {/* ERROR ALERT */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50/80 p-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                  !
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-red-800">
                    Request Not Found
                  </p>
                  <p className="mt-0.5 text-xs text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RESERVATION DETAILS CARD */}
        {reservation && (
          <div className="mt-6 animate-fadeIn overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            {/* CARD TOP HEADER */}
            <div className="border-b border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Verified Booking
                  </span>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900 sm:text-xl">
                    {reservation.equipment}
                  </h3>
                </div>

                <StatusBadge status={reservation.status} />
              </div>
            </div>

            {/* DETAILS CONTENT */}
            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 sm:p-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                      Tracking Code
                    </p>
                    <p className="mt-1 text-sm font-bold tracking-wider text-blue-900 sm:text-base">
                      {reservation.trackingCode}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border border-blue-200 bg-white p-2 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 active:scale-95"
                    title="Copy tracking code"
                  >
                    {copied ? (
                      <span className="text-emerald-600 font-bold">✓</span>
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Detail
                  label="Student Full Name"
                  value={reservation.name}
                />

                <Detail
                  label="Student ID"
                  value={reservation.studentId}
                />

                <Detail
                  label="Equipment Name"
                  value={reservation.equipment}
                />

                <Detail
                  label="Scheduled Date"
                  value={formatDisplayDate(reservation.date)}
                />

                <Detail
                  label="Time Slot"
                  value={`${reservation.startTime} – ${reservation.endTime}`}
                />
              </div>

              {/* PURPOSE NOTE */}
              <div className="mt-3.5 sm:mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Purpose of Reservation
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-700">
                  {reservation.purpose}
                </p>
              </div>

              {/* REJECTION NOTE IF PRESENT */}
              {reservation.rejectNote && (
                <div className="mt-3.5 sm:mt-4 rounded-xl border border-red-200 bg-red-50/70 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Administrator Rejection Reason</span>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-red-700">
                    {reservation.rejectNote}
                  </p>
                </div>
              )}

              {/* TIMESTAMPS */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                <p>
                  Submitted:{" "}
                  <span className="font-medium text-slate-600">
                    {formatDateTime(reservation.createdAt)}
                  </span>
                </p>
                {reservation.updatedAt && (
                  <p>
                    Status Updated:{" "}
                    <span className="font-medium text-slate-600">
                      {formatDateTime(reservation.updatedAt)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM HELP LINKS */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-xs sm:text-sm text-slate-400">
            Need to make a new reservation?
          </p>
          <a
            href="/"
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
          >
            <span>Return to equipment catalog</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </main>
  );
}

/* ================================================= */
/* STATUS BADGE */
/* ================================================= */

function StatusBadge({ status }) {
  const styles = {
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  const dots = {
    pending: "bg-amber-500",
    approved: "bg-emerald-500",
    rejected: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wider ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${dots[status] || "bg-slate-400"}`}
      />
      {status}
    </span>
  );
}

/* ================================================= */
/* DETAIL FIELD */
/* ================================================= */

function Detail({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-xs sm:text-sm font-semibold ${
          highlight ? "tracking-wide text-blue-700" : "text-slate-800"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

/* ================================================= */
/* DATE & TIME HELPERS */
/* ================================================= */

function formatDisplayDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* ================================================= */
/* SVG ICONS */
/* ================================================= */

function FlaskIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.31L4.15 19.46A2 2 0 0 0 5.89 22h12.22a2 2 0 0 0 1.74-2.54L14 9.31V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}