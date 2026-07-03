import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  Loader2,
  Plus,
  Minus,
  Save,
  Search,
  Pencil,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";
import { getItemsList } from "../../../Api/Stock/StockApi";
import { STOCK_SHARED_CONSTS, ADD_ITEM_CLASS_CONFIG_CONSTS } from "../../../Constants/StringConstants/StockAndOrdersConstants";

const catColors = {
  BOOKS: "bg-blue-100 text-blue-700",
  STATIONERY: "bg-gray-100 text-gray-700",
  LAB: "bg-purple-100 text-purple-700",
  SPORTS: "bg-green-100 text-green-700",
  UNIFORM: "bg-yellow-100 text-yellow-700",
};

export default function AddItemClassConfig({
  isOpen,
  onClose,
  onSave,
  editData = null,
  existingItems = [],
  className = "",
}) {
  const isEditMode = Boolean(editData);

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL);
  const [loadingItems, setLoadingItems] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  // selectedItems: { [itemId]: { quantity: number } }
  const [selectedItems, setSelectedItems] = useState({});

  // Single shared remarks for all items
  const [sharedRemarks, setSharedRemarks] = useState("");

  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState("select"); // "select" | "preview"

  // ── Load all active stock items ──
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    setFetchError("");
    try {
      const first = await getItemsList(0, 100, "", "", ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ACTIVE);
      const all = [...(first.items || [])];
      const total = first.pagination?.totalPages ?? 1;
      if (total > 1) {
        const rest = await Promise.all(
          Array.from({ length: total - 1 }, (_, i) =>
            getItemsList(i + 1, 100, "", "", ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ACTIVE)
          )
        );
        rest.forEach((r) => all.push(...(r.items || [])));
      }
      setItems(all);
      const cats = [...new Set(all.map((i) => (i.category || "").toUpperCase()).filter(Boolean))].sort();
      setCategories(cats);
    } catch {
      setFetchError(ADD_ITEM_CLASS_CONFIG_CONSTS.MESSAGES.LOAD_ITEMS_FAILED);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  // ── On open: reset & pre-fill ──
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    setItemSearch("");
    setCategoryFilter(ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL);
    setSaving(false);
    setFetchError("");
    setStep("select");
    setSharedRemarks("");

    if (isEditMode && editData) {
      const entries = Array.isArray(editData) ? editData : [editData];
      const preSelected = {};
      entries.forEach((ed) => {
        preSelected[Number(ed.itemId)] = { quantity: ed.defaultQuantity ?? 1 };
      });
      setSelectedItems(preSelected);
    } else {
      setSelectedItems({});
    }

    loadItems();
    return () => { document.body.style.overflow = ""; };
  }, [isOpen, editData, isEditMode, loadItems]);

  if (!isOpen) return null;

  // ── Filtered items ──
  const filteredItems = items.filter((i) => {
    const q = itemSearch.toLowerCase();
    const matchSearch =
      (i.itemName || "").toLowerCase().includes(q) ||
      (i.itemCode || "").toLowerCase().includes(q) ||
      (i.category || "").toLowerCase().includes(q);
    const matchCat = categoryFilter === ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL || (i.category || "").toUpperCase() === categoryFilter;
    return matchSearch && matchCat;
  });

  // ── Locked set ──
  const editingItemId = isEditMode && !Array.isArray(editData) ? Number(editData.itemId) : null;
  const alreadyAddedIds = new Set(
    existingItems.map((e) => Number(e.itemId)).filter((id) => id !== editingItemId)
  );

  // ── Qty helpers ──
  const handleQtyChange = (id, delta) => {
    setSelectedItems((prev) => {
      const existing = prev[id];
      const newQty = Math.max(0, (existing?.quantity || 0) + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { quantity: newQty } };
    });
  };

  // ── Save ──
  const handleSave = async () => {
    const entries = Object.entries(selectedItems);
    if (entries.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        remarks: sharedRemarks.trim() || null,
        items: entries.map(([itemId, data]) => ({
          itemId: Number(itemId),
          defaultQuantity: data.quantity,
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selectedItems).length;
  const selectedItemDetails = Object.entries(selectedItems).map(([id, data]) => {
    const item = items.find((i) => i.id === Number(id));
    return { ...item, id: Number(id), quantity: data.quantity };
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .modal-pop { animation: modalPop 0.2s ease-out forwards; }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-in-right { animation: slideInRight 0.22s ease-out forwards; }
        .slide-in-left  { animation: slideInLeft  0.22s ease-out forwards; }

        .item-row-selected {
          background: linear-gradient(to right, #eff6ff, #f8fafc);
          border-left: 3px solid #3b82f6;
        }
        .item-row-normal { border-left: 3px solid transparent; }
        .item-row-locked { border-left: 3px solid #d1fae5; background: #f9fafb; }

        .step-dot {
          width: 8px; height: 8px; border-radius: 9999px;
          transition: all 0.25s ease;
        }
        .step-dot-active  { background: #3b82f6; width: 24px; }
        .step-dot-done    { background: #22c55e; }
        .step-dot-pending { background: #e5e7eb; }
      `}</style>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="modal-pop relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl z-10 flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 flex items-center justify-center rounded-xl">
              {isEditMode ? <Pencil className="w-4 h-4 text-blue-600" /> : <Package className="w-4 h-4 text-blue-600" />}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base">
                {isEditMode ? ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.EDIT_TITLE(className) : ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.ADD_TITLE(className)}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {step === "select"
                  ? isEditMode ? ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.STEP_ADJUST_QTY : ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.STEP_SELECT_QTY
                  : ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.STEP_REVIEW}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`step-dot ${step === "select" ? "step-dot-active" : "step-dot-done"}`} />
              <div className={`step-dot ${step === "preview" ? "step-dot-active" : "step-dot-pending"}`} />
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ══════════════════ STEP 1 — SELECT ══════════════════ */}
        {step === "select" && (
          <>
            {/* Search + category filter */}
            <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600 shrink-0 h-9 cursor-pointer"
              >
                <option value={ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL}>{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.ALL_CATEGORIES}</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder={ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.SEARCH_ITEM_PH}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition h-9"
                />
                {itemSearch && (
                  <button onClick={() => setItemSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Column headers */}
            <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span className="flex-1">{ADD_ITEM_CLASS_CONFIG_CONSTS.TABLE_HEADERS.ITEM}</span>
                <span className="w-28 text-center">{ADD_ITEM_CLASS_CONFIG_CONSTS.TABLE_HEADERS.QUANTITY}</span>
              </div>
            </div>

            {/* Item list */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 slide-in-left">
              {loadingItems ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-400" />
                  <p className="text-sm text-gray-400">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.LOADING_ITEMS}</p>
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <p className="text-sm text-red-500">{fetchError}</p>
                  <button onClick={loadItems} className="text-xs text-blue-600 underline font-semibold cursor-pointer">{STOCK_SHARED_CONSTS.COMMON.RETRY}</button>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-sm text-gray-400">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.NO_ITEMS_FOUND}</p>
                  {(itemSearch || categoryFilter !== ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL) && (
                    <button onClick={() => { setItemSearch(""); setCategoryFilter(ADD_ITEM_CLASS_CONFIG_CONSTS.STATUS.ALL); }} className="text-xs text-blue-500 hover:underline font-semibold cursor-pointer">
                      {ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.CLEAR_FILTERS}
                    </button>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const sel = selectedItems[item.id];
                  const qty = sel?.quantity || 0;
                  const isSelected = qty > 0;
                  const isLocked = alreadyAddedIds.has(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`px-6 py-3 flex items-center gap-3 transition-all duration-150 ${isLocked ? "item-row-locked opacity-60" : isSelected ? "item-row-selected" : "item-row-normal hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {isSelected && !isLocked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                          {isLocked && <Lock className="w-3 h-3 text-green-500 shrink-0" />}
                          <p className={`font-semibold text-sm truncate ${isLocked ? "text-gray-400" : isSelected ? "text-blue-700" : "text-gray-800"}`}>
                            {item.itemName}
                          </p>
                          {item.category && (
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${catColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                              {item.category}
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-green-100 text-green-700 shrink-0 whitespace-nowrap">
                              {ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.ALREADY_ADDED}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.itemCode} · {item.unit}
                          {item.totalQuantity !== undefined && (
                            <span className={`ml-2 font-medium ${item.isBelowMinimum ? "text-orange-500" : "text-gray-400"}`}>
                              · Stock: {item.totalQuantity}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 w-28 justify-center shrink-0">
                        <button
                          onClick={() => !isLocked && handleQtyChange(item.id, -1)}
                          disabled={isLocked}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${isLocked ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                              : isSelected ? "border-orange-300 text-orange-500 hover:bg-orange-50"
                                : "border-gray-200 text-gray-400 hover:bg-gray-100"
                            }`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className={`w-8 text-center text-sm font-bold tabular-nums ${isLocked ? "text-gray-300" : isSelected ? "text-orange-500" : "text-gray-400"
                          }`}>
                          {qty}
                        </span>
                        <button
                          onClick={() => !isLocked && handleQtyChange(item.id, 1)}
                          disabled={isLocked}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${isLocked ? "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                              : isSelected ? "border-orange-300 text-orange-500 hover:bg-orange-50"
                                : "border-gray-200 text-gray-400 hover:bg-gray-100"
                            }`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                {selectedCount > 0 ? (
                  <>
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold leading-none">{selectedCount}</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-700">{selectedCount} item{selectedCount > 1 ? "s" : ""} selected</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.NO_ITEMS_SELECTED}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                  {STOCK_SHARED_CONSTS.COMMON.CANCEL}
                </button>
                <button
                  disabled={selectedCount === 0}
                  onClick={() => setStep("preview")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Next <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ STEP 2 — PREVIEW + SHARED REMARKS ══════════════════ */}
        {step === "preview" && (
          <>
            {/* Preview banner */}
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 shrink-0 slide-in-right">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-semibold text-blue-700">
                  Review {selectedCount} selected item{selectedCount > 1 ? "s" : ""}
                </p>
                <span className="text-xs text-blue-400 ml-1">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.ADJUST_BEFORE_SAVING}</span>
              </div>
            </div>

            {/* Column headers */}
            <div className="px-6 py-2 bg-gray-50 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span className="flex-1">{ADD_ITEM_CLASS_CONFIG_CONSTS.TABLE_HEADERS.ITEM}</span>
                <span className="w-28 text-center">{ADD_ITEM_CLASS_CONFIG_CONSTS.TABLE_HEADERS.QUANTITY}</span>
              </div>
            </div>

            {/* Item list — scrollable */}
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 slide-in-right">
              {selectedItemDetails.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-gray-400">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.NO_ITEMS_SELECTED_SHORT}</p>
                </div>
              ) : (
                selectedItemDetails.map((item) => (
                  <div key={item.id} className="px-6 py-3 flex items-center gap-3 item-row-selected transition-all duration-150">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <p className="font-semibold text-sm text-blue-700 truncate">{item.itemName}</p>
                        {item.category && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${catColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.itemCode} · {item.unit}</p>
                    </div>

                    <div className="flex items-center gap-1.5 w-28 justify-center shrink-0">
                      <button onClick={() => handleQtyChange(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-orange-300 text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums text-orange-500">{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-orange-300 text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Shared remarks — pinned above footer ── */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                <label className="text-xs font-semibold text-gray-500">
                  Remarks <span className="text-gray-400 font-normal">{ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.REMARKS_HINT}</span>
                </label>
              </div>
              <input
                type="text"
                value={sharedRemarks}
                onChange={(e) => setSharedRemarks(e.target.value)}
                placeholder={ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.REMARKS_PLACEHOLDER}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition placeholder:text-gray-300"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setStep("select")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft size={15} /> {STOCK_SHARED_CONSTS.COMMON.BACK}
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {STOCK_SHARED_CONSTS.COMMON.CANCEL}
                </button>
                <button
                  disabled={saving || selectedCount === 0}
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      {isEditMode ? ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.UPDATING : ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.SAVING}
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      {isEditMode ? ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.UPDATE_BTN(selectedCount) : ADD_ITEM_CLASS_CONFIG_CONSTS.TEXT.SAVE_BTN(selectedCount)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}