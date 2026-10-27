import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function useSecureDraft(path, { value, setValue, enabled = true }) {
  const latestValue = useRef(value);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("loading");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  const loadDraft = useCallback(async () => {
    try {
      const { data } = await api.get(path);
      const draft = data.data;
      if (draft?.payload && typeof draft.payload === "object") {
        setValue((current) => ({ ...current, ...draft.payload }));
        setUpdatedAt(draft.updated_at || null);
        setStatus("restored");
      } else {
        setStatus("empty");
      }
      setReady(true);
    } catch {
      setStatus("unavailable");
      setReady(false);
    }
  }, [path, setValue]);

  useEffect(() => {
    const timer = window.setTimeout(loadDraft, 0);
    return () => window.clearTimeout(timer);
  }, [loadDraft]);

  const retryLoad = useCallback(() => {
    setStatus("loading");
    setReady(false);
    loadDraft();
  }, [loadDraft]);

  const saveNow = useCallback(async (draftValue = latestValue.current) => {
    try {
      const { data } = await api.put(path, { data: draftValue });
      setUpdatedAt(data.data?.updated_at || new Date().toISOString());
      setStatus("saved");
    } catch (error) {
      setStatus("save-error");
      throw error;
    }
  }, [path]);

  const clearDraft = useCallback(async () => {
    await api.delete(path);
    setUpdatedAt(null);
    setStatus("empty");
  }, [path]);

  useEffect(() => {
    if (!ready || !enabled) return undefined;
    const hasContent = Object.values(value || {}).some((entry) =>
      typeof entry === "boolean" ? entry : String(entry ?? "").trim() !== ""
    );
    if (!hasContent) return undefined;

    const timer = window.setTimeout(() => {
      setStatus("saving");
      saveNow(value).catch(() => setStatus("save-error"));
    }, 800);
    return () => window.clearTimeout(timer);
  }, [enabled, ready, saveNow, value]);

  return { status, updatedAt, saveNow, clearDraft, retryLoad };
}
