"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const PRESET_CATEGORIES = [
  "Heating & Mixing",
  "Separation",
  "Measurement",
  "Analysis",
  "Microscopy & Imaging",
  "Sterilization",
  "General Lab",
];

const PRESET_ICONS = ["🔬", "🧪", "⚗️", "🌡️", "⚙️", "🔭", "💡", "♨", "⚖", "◉", "⌁", "◈", "💻", "🧲"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'
  const [activeAdminTab, setActiveAdminTab] = useState("reservations"); // 'reservations' | 'equipment'

  // Add equipment modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingEquipment, setAddingEquipment] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [addForm, setAddForm] = useState({
    name: "",
    shortName: "",
    category: "Heating & Mixing",
    icon: "🔬",
    type: "custom",
  });

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
        loadEquipment();
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

  async function loadEquipment() {
    try {
      const response = await fetch("/api/admin/equipment", {
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success) {
        setEquipmentList(result.equipment || []);
      }
    } catch (error) {
      console.error("Error loading equipment:", error);
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
          loadEquipment();
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

  async function handleAddEquipment(e) {
    e.preventDefault();
    setAddingEquipment(true);
    setAddError("");
    setAddSuccess("");

    if (!addForm.name.trim()) {
      setAddError("Equipment name is required.");
      setAddingEquipment(false);
      return;
    }

    if (!addForm.category.trim()) {
      setAddError("Equipment category is required.");
      setAddingEquipment(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: addForm.name.trim(),
          shortName: addForm.shortName.trim() || addForm.name.trim(),
          category: addForm.category.trim(),
          icon: addForm.icon.trim() || "🔬",
          type: addForm.type || "custom",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAddSuccess(`"${result.equipment?.name || addForm.name}" was added successfully! It is now live on the home page.`);
        setAddForm({
          name: "",
          shortName: "",
          category: "Heating & Mixing",
          icon: "🔬",
          type: "custom",
        });
        await loadEquipment();
        setTimeout(() => {
          setShowAddModal(false);
          setAddSuccess("");
        }, 1200);
      } else {
        setAddError(result.message || "Failed to add equipment.");
      }
    } catch (error) {
      console.error(error);
      setAddError("Network error: Could not add equipment.");
    } finally {
      setAddingEquipment(false);
    }
  }

  async function handleDeleteEquipment(id, name) {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${name}" from the laboratory inventory?\n\nIt will no longer appear on the home page.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/equipment", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (result.success) {
        loadEquipment();
      } else {
        alert(result.message || "Could not delete equipment.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not delete equipment.");
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      setLoggedIn(false);
      setReservations([]);
      setEquipmentList([]);
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
          <Link href="/" className="flex items-center gap-3">
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
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setAddError("");
                setAddSuccess("");
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Equipment</span>
            </button>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
            >
              <span>View Site</span>
            </Link>

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
        {/* MAIN SECTION NAV TABS (Reservations vs Equipment) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveAdminTab("reservations")}
            className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeAdminTab === "reservations"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>📋 Reservation Requests</span>
            {stats.pending > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {stats.pending} pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab("equipment")}
            className={`inline-flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeAdminTab === "equipment"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>🔬 Equipment Inventory</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                activeAdminTab === "equipment"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {equipmentList.length}
            </span>
          </button>
        </div>

        {/* VIEW 1: RESERVATIONS VIEW */}
        {activeAdminTab === "reservations" && (
          <div className="mt-6 sm:mt-8">
            {/* TOP TITLE & REFRESH ACTION */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <span>Student Requests</span>
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
        )}

        {/* VIEW 2: EQUIPMENT INVENTORY VIEW */}
        {activeAdminTab === "equipment" && (
          <div className="mt-6 sm:mt-8">
            {/* TOP TITLE & ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                  <span>Lab A Catalog</span>
                </div>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Equipment Management
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Add new equipment or manage existing inventory. New equipment automatically appears on the public home page.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setAddError("");
                    setAddSuccess("");
                    setShowAddModal(true);
                  }}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Equipment</span>
                </button>

                <button
                  onClick={loadEquipment}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                  <span className="text-base leading-none">↻</span>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* EQUIPMENT STATS OVERVIEW */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              <AdminStat
                label="Total Equipment Units"
                value={equipmentList.length}
                icon={<GridIcon className="h-5 w-5 text-slate-600" />}
                bgColor="bg-slate-50"
              />

              <AdminStat
                label="Standard Default Units"
                value={equipmentList.filter((e) => e.isDefault).length}
                icon={<FlaskIcon className="h-5 w-5 text-blue-600" />}
                valueColor="text-blue-600"
                bgColor="bg-blue-50"
              />

              <AdminStat
                label="Custom Added Units"
                value={equipmentList.filter((e) => !e.isDefault).length}
                icon={<PlusIcon className="h-5 w-5 text-emerald-600" />}
                valueColor="text-emerald-600"
                bgColor="bg-emerald-50"
              />
            </div>

            {/* EQUIPMENT LIST GRID */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {equipmentList.map((item) => (
                <div
                  key={item.id || item.name}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <div>
                    {/* TOP BADGES & ICON */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-2xl font-bold shadow-sm">
                          <span className="select-none">{item.icon || "🔬"}</span>
                        </div>

                        <div>
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {item.category}
                          </span>
                          <h3 className="mt-1 text-base font-bold text-slate-900">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {item.isDefault ? (
                        <span className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                          Default
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          Added
                        </span>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Short Name:</span>
                        <span className="font-semibold text-slate-700">
                          {item.shortName || item.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ID:</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          {item.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Public Status:</span>
                        <span className="font-semibold text-emerald-600">
                          Live on Home Page
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] text-slate-400">
                      {item.isDefault ? "Protected system equipment" : "Custom laboratory machine"}
                    </span>

                    {!item.isDefault && (
                      <button
                        onClick={() => handleDeleteEquipment(item.id, item.name)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD EQUIPMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  Catalog Inventory
                </div>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
                  Add Equipment to Lab
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Once added, this equipment will automatically appear on the home page for student reservations.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleAddEquipment} className="mt-5 space-y-4">
              {addError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                  {addError}
                </div>
              )}

              {addSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                  {addSuccess}
                </div>
              )}

              {/* EQUIPMENT NAME */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Equipment Full Name <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Digital Microscope Olympus"
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* SHORT NAME */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Short Display Name <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={addForm.shortName}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, shortName: e.target.value }))
                  }
                  placeholder="e.g. Microscope"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Category <span className="text-blue-600">*</span>
                </label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PRESET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAddForm((prev) => ({ ...prev, category: cat }))}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        addForm.category === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={addForm.category}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="Or enter custom category"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              {/* ICON PICKER */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-slate-700">
                  Equipment Icon / Symbol
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setAddForm((prev) => ({ ...prev, icon }))}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg transition ${
                        addForm.icon === icon
                          ? "border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                          : "border border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold">
                    {addForm.icon || "🔬"}
                  </div>
                  <input
                    type="text"
                    value={addForm.icon}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    placeholder="Custom symbol or emoji"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingEquipment}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95 disabled:opacity-60"
                >
                  {addingEquipment ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Adding to Catalog...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Equipment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
          <Link href="/" className="flex w-fit items-center gap-3">
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
          </Link>
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
              Enter your laboratory administrative credentials to review bookings and manage equipment.
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
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Return to public equipment portal
            </Link>
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

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}