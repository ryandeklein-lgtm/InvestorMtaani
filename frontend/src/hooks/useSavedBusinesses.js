import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "investor-mtaani:saved-opportunities:v1";

function readSaved() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function useSavedBusinesses() {
  const [savedBusinesses, setSavedBusinesses] = useState(readSaved);

  useEffect(() => {
    const syncFromStorage = (event) => {
      if (event.key === STORAGE_KEY) setSavedBusinesses(readSaved());
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  const updateSaved = useCallback((update) => {
    setSavedBusinesses((current) => {
      const next = update(current);
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Keep the in-page list usable when storage is unavailable. */ }
      return next;
    });
  }, []);

  const toggleSaved = useCallback((business) => {
    updateSaved((current) => {
      const exists = current.some((item) => String(item.id) === String(business.id));
      if (exists) return current.filter((item) => String(item.id) !== String(business.id));
      const snapshot = {
        id: business.id,
        business_name: business.business_name || "Unnamed business",
        industry: business.industry || "Business",
        location: business.location || "Location not disclosed",
        amount_seeking: business.amount_seeking ?? business.amount_requested ?? business.funding_amount ?? business.investment_amount ?? null,
        investment_type: business.investment_type ?? business.funding_type ?? business.investment_structure ?? business.funding_structure ?? "Not specified",
        description: business.description || "",
      };
      return [snapshot, ...current];
    });
  }, [updateSaved]);

  const removeSaved = useCallback((id) => {
    updateSaved((current) => current.filter((item) => String(item.id) !== String(id)));
  }, [updateSaved]);

  const savedIds = useMemo(() => new Set(savedBusinesses.map((business) => String(business.id))), [savedBusinesses]);
  const isSaved = useCallback((id) => savedIds.has(String(id)), [savedIds]);

  return { savedBusinesses, toggleSaved, removeSaved, isSaved };
}
