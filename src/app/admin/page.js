"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'

  async function login(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        setLoggedIn(true);
        setPassword("");
        loadReservations();
      } else {
        alert(result.message || "Invalid password.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not login.");
    } finally {
      setLoading(false);
    }
  }

  async function loadReservations(showLoader = false) {
    if (showLoader) {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/api/admin/reservations", {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setReservations(result.reservations || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch("/api/admin/reservations", {
          cache: "no-store",
        });

        const result = await response.json();

        if (result.success) {
          setLoggedIn(true);
          setReservations(result.reservations || []);
        }
      } catch (error) {
        console.error(error);
      }
    }

    checkLogin();
  }, []);

  async function updateReservation(id, status) {
    let rejectNote = "";

    if (status === "rejected") {
      rejectNote = window.prompt("Why are you rejecting this reservation?");

      if (rejectNote === null) {
        return;
      }
    }

    try {
      const response = await fetch("/api/admin/reservations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          rejectNote,
        }),
      });

      const result = await response.json();

      if (result.success) {
        loadReservations();

        alert(
          status === "approved"
            ? "Reservation approved."
            : "Reservation rejected."
        );
      } else {
        alert(result.message || "Could not update reservation.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not update reservation.");
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      setLoggedIn(false);
      setReservations([]);
    } catch (error) {
      console.error(error);
    }
  }

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((item) => item.status === "pending").length,
      approved: reservations.filter((item) => item.status === "approved").length,
      rejected: reservations.filter((item) => item.status === "rejected").length,
    };
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    if (filterTab === "all") return reservations;
    return reservations.filter((r) => r.status === filterTab);
  }, [reservations, filterTab]);

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const processedReservations = reservations.filter(
    (reservation) => reservation.status !== "pending"
  );

  if (!loggedIn) {
    return (
      <LoginScreen
        password={password}
        setPassword={setPassword}
        login={login}
        loading={loading}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a152d]/95 backdrop-blur-md text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base sm:text-lg font-bold shadow-md shadow-blue-900/40">
              <FlaskIcon className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight sm:text-base md:text-lg">
                Laboratory Equipment Manager
              </h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                Administrator Dashboard · Lab A
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <span>View Site</span>
            </a>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-95"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* TOP TITLE & REFRESH ACTION */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span>Admin Management</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Reservation Requests
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Review student reservation requests, approve slots, or reject with notes.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadReservations(true)}
              disabled={refreshing}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              <span className={`text-base leading-none ${refreshing ? "animate-spin" : ""}`}>
                ↻
              </span>
              <span>{refreshing ? "Refreshing..." : "Refresh Requests"}</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <AdminStat
            label="Total Requests"
            value={stats.total}
            icon={<GridIcon className="h-5 w-5 text-slate-600" />}
            bgColor="bg-slate-50"
          />

          <AdminStat
            label="Pending Review"
            value={stats.pending}
            icon={<ClockIcon className="h-5 w-5 text-amber-600" />}
            valueColor="text-amber-600"
            bgColor="bg-amber-50"
          />

          <AdminStat
            label="Approved"
            value={stats.approved}
            icon={<CheckIcon className="h-5 w-5 text-emerald-600" />}
            valueColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />

          <AdminStat
            label="Rejected"
            value={stats.rejected}
            icon={<XIcon className="h-5 w-5 text-red-600" />}
            valueColor="text-red-600"
            bgColor="bg-red-50"
          />
        </div>

        {/* FILTER TABS */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
          <TabButton
            active={filterTab === "all"}
            onClick={() => setFilterTab("all")}
            label="All Requests"
            count={stats.total}
          />
          <TabButton
            active={filterTab === "pending"}
            onClick={() => setFilterTab("pending")}
            label="Pending"
            count={stats.pending}
            badgeColor="bg-amber-100 text-amber-800"
          />
          <TabButton
            active={filterTab === "approved"}
            onClick={() => setFilterTab("approved")}
            label="Approved"
            count={stats.approved}
            badgeColor="bg-emerald-100 text-emerald-800"
          />
          <TabButton
            active={filterTab === "rejected"}
            onClick={() => setFilterTab("rejected")}
            label="Rejected"
            count={stats.rejected}
            badgeColor="bg-red-100 text-red-800"
          />
        </div>

        {/* LIST VIEW */}
        <section className="mt-6">
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <EmptyState
                title={
                  filterTab === "pending"
                    ? "No pending requests"
                    : filterTab === "all"
                    ? "No reservations found"
                    : `No ${filterTab} requests`
                }
                description={
                  filterTab === "pending"
                    ? "All laboratory equipment requests have been reviewed."
                    : "Requests matching this filter will appear here."
                }
              />
            ) : (
              filteredReservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onUpdate={updateReservation}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ================================================= */
/* TAB BUTTON */
/* ================================================= */

function TabButton({ active, onClick, label, count, badgeColor = "bg-slate-100 text-slate-700" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
          active ? "bg-white/20 text-white" : badgeColor
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ================================================= */
/* LOGIN SCREEN */
/* ================================================= */

function LoginScreen({ password, setPassword, login, loading }) {
  return (
    <main className="min-h-screen bg-[#f6f8fc]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a152d]/95 backdrop-blur-md text-white">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <a href="/" className="flex w-fit items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base sm:text-lg font-bold text-white shadow-md shadow-blue-900/40">
              <FlaskIcon className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight sm:text-base md:text-lg">
                Laboratory Equipment Manager
              </h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                Administrator Portal · Lab A
              </p>
            </div>
          </a>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600 shadow-sm">
              <LockIcon className="h-7 w-7 text-blue-600" />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-blue-600">
              Restricted Area
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Administrator Login
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Enter your laboratory administrative credentials to review bookings.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Admin Access Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Return to public equipment portal
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ================================================= */
/* RESERVATION CARD */
/* ================================================= */

function ReservationCard({ reservation, onUpdate }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5 sm:p-6">
        {/* TOP ROW */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h4 className="text-base font-bold text-slate-900 sm:text-lg">
                {reservation.name}
              </h4>
              <StatusBadge status={reservation.status} />
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>
                Student ID:{" "}
                <span className="font-semibold text-slate-700">
                  {reservation.studentId}
                </span>
              </span>

              <span>
                Tracking Code:{" "}
                <span className="font-bold tracking-wider text-blue-600">
                  {reservation.trackingCode}
                </span>
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS (FOR PENDING) */}
          {reservation.status === "pending" && (
            <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => onUpdate(reservation.id, "approved")}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <span>✓ Approve</span>
              </button>

              <button
                onClick={() => onUpdate(reservation.id, "rejected")}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs sm:text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
              >
                <span>✕ Reject</span>
              </button>
            </div>
          )}
        </div>

        {/* DETAILS GRID */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
          <AdminDetail label="Equipment" value={reservation.equipment} />
          <AdminDetail label="Date" value={formatDisplayDate(reservation.date)} />
          <AdminDetail label="Time Slot" value={`${reservation.startTime} – ${reservation.endTime}`} />
        </div>

        {/* PURPOSE */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Purpose of Reservation
          </p>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-700">
            {reservation.purpose}
          </p>
        </div>

        {/* REJECTION NOTE IF REJECTED */}
        {reservation.rejectNote && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50/70 p-3 sm:p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-red-600">
              Rejection Reason
            </p>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-red-700">
              {reservation.rejectNote}
            </p>
          </div>
        )}

        {/* METADATA TIMESTAMPS */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5 text-xs text-slate-400">
          <p>
            Submitted:{" "}
            <span className="font-medium text-slate-600">
              {formatDateTime(reservation.createdAt)}
            </span>
          </p>

          {reservation.updatedAt && (
            <p>
              Updated:{" "}
              <span className="font-medium text-slate-600">
                {formatDateTime(reservation.updatedAt)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

function AdminStat({
  label,
  value,
  icon,
  valueColor = "text-slate-900",
  bgColor = "bg-slate-50",
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          {label}
        </p>
        <div className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ${bgColor}`}>
          {icon}
        </div>
      </div>

      <p className={`mt-2 sm:mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}

/* ================================================= */
/* DETAIL FIELD */
/* ================================================= */

function AdminDetail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-3.5">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || "bg-slate-400"}`} />
      {status}
    </span>
  );
}

/* ================================================= */
/* EMPTY STATE */
/* ================================================= */

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <CheckIcon className="h-6 w-6" />
      </div>

      <h4 className="mt-3 text-sm sm:text-base font-bold text-slate-800">
        {title}
      </h4>

      <p className="mt-1 text-xs sm:text-sm text-slate-400">
        {description}
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

function LockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GridIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
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