"use client";

import { useEffect, useState } from "react";

const EQUIPMENT = [
  {
    name: "Hot Plate Magnetic Stirrer",
    category: "Heating & Mixing",
    shortName: "Hot Plate",
    icon: "♨",
    type: "stirrer",
  },
  {
    name: "Centrifuge",
    category: "Separation",
    shortName: "Centrifuge",
    icon: "◉",
    type: "centrifuge",
  },
  {
    name: "pH Meter",
    category: "Measurement",
    shortName: "pH Meter",
    icon: "⌁",
    type: "ph",
  },
  {
    name: "Weight Balance",
    category: "Measurement",
    shortName: "Weight Balance",
    icon: "⚖",
    type: "balance",
  },
  {
    name: "UV-Vis Spectrophotometer",
    category: "Analysis",
    shortName: "UV-Vis",
    icon: "◈",
    type: "spectro",
  },
];

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    equipment: "Hot Plate Magnetic Stirrer",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });

  useEffect(() => {
    loadReservations();

    const interval = setInterval(() => {
      loadReservations();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadReservations() {
    try {
      const response = await fetch("/api/reservations", {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setReservations(result.reservations);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function openReservationModal(equipmentName = null) {
    setForm((current) => ({
      ...current,
      equipment: equipmentName || current.equipment,
    }));

    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (result.success) {
        setTrackingCode(result.trackingCode);
        setCopied(false);
        setShowModal(false);

        setForm({
          name: "",
          studentId: "",
          equipment: "Hot Plate Magnetic Stirrer",
          date: "",
          startTime: "",
          endTime: "",
          purpose: "",
        });

        loadReservations();

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        alert(result.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not submit reservation.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyTrackingCode() {
    if (!trackingCode) return;
    navigator.clipboard?.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const approvedReservations = reservations.filter(
    (reservation) => reservation.status === "approved"
  );

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  );

  const equipmentStatuses = EQUIPMENT.map((equipment) =>
    getEquipmentStatus(equipment.name, approvedReservations)
  );

  const currentlyInUse = equipmentStatuses.filter(
    (status) => status === "inUse"
  ).length;

  const reservedCount = equipmentStatuses.filter(
    (status) => status === "reserved"
  ).length;

  const availableCount = equipmentStatuses.filter(
    (status) => status === "available"
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0a152d]/95 backdrop-blur-md text-white transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-base sm:text-lg font-bold text-white shadow-md shadow-blue-900/40">
              <FlaskIcon className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight sm:text-base md:text-lg">
                Laboratory Equipment Manager
              </h1>
              <p className="text-[11px] text-slate-400 sm:text-xs">
                Dept. Of ME, RUET, Md. Mostafa Kamal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/status"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Track Request
            </a>

            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-white/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-white/10 active:scale-95"
            >
              <LockIcon className="h-3.5 w-3.5 text-blue-400" />
              <span>Admin Login</span>
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0c1e3f] via-[#0f2347] to-[#122c5a] px-5 py-7 text-white shadow-xl shadow-slate-200/60 sm:px-8 sm:py-10 md:p-12">
          {/* Decorative ambient lights */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl sm:h-80 sm:w-80" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span></span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl md:text-5xl md:leading-tight">
              Equipment availability,{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                made simple.
              </span>
            </h2>

            <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:mt-4 sm:text-sm sm:leading-6 md:text-base">
              Check live laboratory equipment status, submit reservation
              requests instantly.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <button
                onClick={() => openReservationModal()}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all hover:bg-blue-500 hover:shadow-blue-700/50 active:scale-[0.98]"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Request Equipment
              </button>

              <a
                href="/status"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-white/5 px-6 py-3 text-center text-sm font-bold text-slate-200 backdrop-blur-sm transition hover:border-slate-400 hover:bg-white/10 active:scale-[0.98]"
              >
                <SearchIcon className="h-4 w-4 text-slate-300" />
                Check Request Status
              </a>
            </div>
          </div>
        </section>

        {/* SUCCESS MESSAGE */}
        {trackingCode && (
          <section className="mt-6 animate-fadeIn overflow-hidden rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                  <CheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 sm:text-lg">
                    Reservation request submitted successfully!
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Save your tracking code to view approval status or report to lab staff.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tracking Code
                    </p>
                    <p className="text-base font-extrabold tracking-wide text-slate-900 sm:text-lg">
                      {trackingCode}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyTrackingCode}
                    className="ml-2 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 active:scale-95"
                    title="Copy code"
                  >
                    {copied ? (
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <a
                  href={`/status?trackingCode=${encodeURIComponent(trackingCode)}`}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Track Now →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* STATS SECTION */}
        <section className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Equipment"
            value={EQUIPMENT.length}
            icon={<GridIcon className="h-5 w-5 text-slate-600" />}
            bgColor="bg-slate-50"
          />

          <StatCard
            label="Available Now"
            value={availableCount}
            icon={<CheckIcon className="h-5 w-5 text-emerald-600" />}
            valueColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />

          <StatCard
            label="In Use"
            value={currentlyInUse}
            icon={<ActivityIcon className="h-5 w-5 text-orange-500" />}
            valueColor="text-orange-500"
            bgColor="bg-orange-50"
          />

          <StatCard
            label="Pending Requests"
            value={pendingReservations.length}
            icon={<ClockIcon className="h-5 w-5 text-amber-600" />}
            valueColor="text-amber-600"
            bgColor="bg-amber-50"
          />
        </section>

        {/* EQUIPMENT SECTION */}
        <section className="mt-8 sm:mt-10 lg:mt-12">
          {/* SECTION HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                <span>Lab A Inventory</span>
              </div>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                Equipment Catalog & Live Status
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Real-time availability status and upcoming reservations.
              </p>
            </div>

            {/* STATUS LEGEND */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm sm:gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                In Use
              </span>
            </div>
          </div>

          {/* EQUIPMENT CARDS GRID */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {EQUIPMENT.map((equipment) => (
              <EquipmentCard
                key={equipment.name}
                {...equipment}
                reservations={approvedReservations}
                onRequest={() => openReservationModal(equipment.name)}
              />
            ))}
          </div>
        </section>

        {/* STATUS FOOTER LINK */}
        <section className="mt-10 sm:mt-12 flex justify-center">
          <a
            href="/status"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-700 hover:shadow-md"
          >
            <span>Have a reservation tracking code? Check your request</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 text-center">
  <p className="text-sm font-medium text-slate-600">
    Department of Mechanical Engineering, RUET
  </p>
</footer>
      </div>

      {/* RESERVATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm">
          {/* Backdrop click */}
          <div
            className="fixed inset-0"
            onClick={() => setShowModal(false)}
          />

          <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-5 py-4 sm:px-6 sm:py-5 backdrop-blur-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                    Booking Request Form
                  </div>
                  <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                    Request Equipment
                  </h2>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    Enter student details and reservation time slot.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6">
              <Input
                label="Student Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder=""
                required
              />

              <Input
                label="Student ID"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder=""
                required
              />

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Select Equipment
                  <span className="ml-1 text-blue-600">*</span>
                </label>

                <div className="relative mt-1.5">
                  <select
                    name="equipment"
                    value={form.equipment}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    {EQUIPMENT.map((equipment) => (
                      <option key={equipment.name} value={equipment.name}>
                        {equipment.name} ({equipment.category})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              <Input
                label="Reservation Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <Input
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Purpose of Use
                  <span className="ml-1 text-blue-600">*</span>
                </label>

                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your research experiment or course project..."
                  required
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  "Submit Reservation Request"
                )}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                Your request will be placed in pending review for lab administrator approval.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ================================================= */
/* EQUIPMENT CARD */
/* ================================================= */

function EquipmentCard({
  name,
  category,
  shortName,
  icon,
  type,
  reservations,
  onRequest,
}) {
  const status = getEquipmentStatus(name, reservations);
  const nextReservation = getNextReservation(name, reservations);

  const statusConfig = {
    available: {
      label: "AVAILABLE",
      dot: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    reserved: {
      label: "RESERVED",
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
    inUse: {
      label: "IN USE",
      dot: "bg-orange-500",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      iconBg: "bg-orange-50 text-orange-600 border-orange-100",
    },
  };

  const config = statusConfig[status] || statusConfig.available;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-6">
      <div>
        {/* TOP ROW */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl font-bold shadow-sm ${config.iconBg}`}
            >
              <EquipmentIcon type={type} fallback={icon} />
            </div>

            <div>
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {category}
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {name}
              </h3>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider ${config.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </span>
        </div>

        {/* RESERVATION INFO */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span>Next Schedule</span>
            {nextReservation && (
              <span className="font-semibold text-emerald-600">Confirmed</span>
            )}
          </div>

          {nextReservation ? (
            <div className="mt-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Date</span>
                  <p className="font-bold text-slate-700">
                    {formatDisplayDate(nextReservation.date)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Time</span>
                  <p className="font-bold text-slate-700">
                    {nextReservation.startTime} – {nextReservation.endTime}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200/70 pt-1.5 text-xs">
                <span className="text-[11px] text-slate-400">Reserved for: </span>
                <span className="font-semibold text-slate-700 truncate inline-block max-w-[170px] align-bottom">
                  {nextReservation.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                ✓
              </span>
              <span>No upcoming reservations scheduled</span>
            </div>
          )}
        </div>
      </div>

      {/* REQUEST BUTTON */}
      <button
        onClick={onRequest}
        className="mt-4 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-600 hover:text-white active:scale-[0.98]"
      >
        <span>Request this equipment</span>
        <span>→</span>
      </button>
    </div>
  );
}

/* ================================================= */
/* STAT CARD */
/* ================================================= */

function StatCard({
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
/* INPUT */
/* ================================================= */

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="text-xs sm:text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-blue-600">*</span>}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

/* ================================================= */
/* EQUIPMENT STATUS CALCULATIONS */
/* ================================================= */

function getEquipmentStatus(equipmentName, reservations) {
  const now = new Date();
  const today = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const equipmentReservations = reservations.filter(
    (reservation) => reservation.equipment === equipmentName
  );

  const activeReservation = equipmentReservations.find((reservation) => {
    if (reservation.date !== today) {
      return false;
    }

    const start = timeToMinutes(reservation.startTime);
    const end = timeToMinutes(reservation.endTime);

    return currentMinutes >= start && currentMinutes < end;
  });

  if (activeReservation) {
    return "inUse";
  }

  const futureReservation = equipmentReservations.find((reservation) => {
    if (reservation.date > today) {
      return true;
    }

    if (reservation.date < today) {
      return false;
    }

    const start = timeToMinutes(reservation.startTime);
    return start > currentMinutes;
  });

  if (futureReservation) {
    return "reserved";
  }

  return "available";
}

function getNextReservation(equipmentName, reservations) {
  const now = new Date();
  const today = formatDate(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = reservations
    .filter((reservation) => reservation.equipment === equipmentName)
    .filter((reservation) => {
      if (reservation.date > today) {
        return true;
      }

      if (reservation.date < today) {
        return false;
      }

      const start = timeToMinutes(reservation.startTime);
      return start > currentMinutes;
    })
    .sort((a, b) => {
      const aValue = `${a.date} ${a.startTime}`;
      const bValue = `${b.date} ${b.startTime}`;
      return aValue.localeCompare(bValue);
    });

  return upcoming[0] || null;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeToMinutes(time) {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
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

function CopyIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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

function ActivityIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
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

function PlusCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function EquipmentIcon({ type, fallback }) {
  switch (type) {
    case "stirrer":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h12" />
          <path d="M4 22h16" />
          <path d="M12 2v10" />
          <path d="m9 9 3 3 3-3" />
        </svg>
      );
    case "centrifuge":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
        </svg>
      );
    case "ph":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2v6a2 2 0 0 1-2 2H6" />
          <path d="M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <line x1="10" x2="10" y1="14" y2="18" />
          <line x1="14" x2="14" y1="14" y2="18" />
        </svg>
      );
    case "balance":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h18" />
        </svg>
      );
    case "spectro":
      return (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="12" x="3" y="6" rx="2" />
          <path d="M8 12h3" />
          <path d="M14 12h2" />
          <path d="M7 2v4" />
          <path d="M17 2v4" />
        </svg>
      );
    default:
      return <span>{fallback}</span>;
  }
}