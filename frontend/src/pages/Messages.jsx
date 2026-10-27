import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const panel = {
  border: "1px solid rgba(61,214,245,.16)",
  borderRadius: 14,
  background: "#0e1626",
};

const statusLabel = (status) => ({
  pending: "Waiting for business review",
  accepted: "Introduction accepted",
  declined: "Introduction declined",
}[status] || status);

const timeLabel = (value) => value ? new Date(value).toLocaleString([], {
  dateStyle: "medium",
  timeStyle: "short",
}) : "";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("request");
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [messageData, setMessageData] = useState({ requestId: null, messages: [], loading: false, error: "" });
  const [messageAttempt, setMessageAttempt] = useState(0);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const endRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    setListError("");
    try {
      const { data } = await api.get("/matchmaking/conversations");
      const rows = data.data || [];
      setConversations(rows);
      const requested = rows.find((row) => String(row.request_id) === requestId);
      if (!requested && rows.length && !rows.some((row) => String(row.request_id) === requestId)) {
        const first = rows.find((row) => row.status === "accepted") || rows[0];
        setSearchParams({ request: String(first.request_id) }, { replace: true });
      }
    } catch (error) {
      setListError(error.response?.data?.message || "We couldn’t load your introductions.");
    } finally {
      setLoadingList(false);
    }
  }, [requestId, setSearchParams]);

  useEffect(() => {
    const timer = window.setTimeout(loadConversations, 0);
    return () => window.clearTimeout(timer);
  }, [loadConversations]);

  const selected = useMemo(
    () => conversations.find((row) => String(row.request_id) === requestId) || null,
    [conversations, requestId]
  );
  const selectedRequestId = selected?.request_id ? String(selected.request_id) : null;
  const selectedStatus = selected?.status;
  const messages = useMemo(() => messageData.requestId === selectedRequestId ? messageData.messages : [], [messageData.requestId, messageData.messages, selectedRequestId]);
  const messageError = messageData.requestId === selectedRequestId ? messageData.error : "";
  const loadingMessages = Boolean(selectedRequestId && selectedStatus === "accepted" && (messageData.requestId !== selectedRequestId || messageData.loading));

  useEffect(() => {
    let active = true;
    if (!selectedRequestId || selectedStatus !== "accepted") return () => { active = false; };

    const load = async (quiet = false) => {
      if (!quiet) setMessageData((current) => ({ requestId: selectedRequestId, messages: current.requestId === selectedRequestId ? current.messages : [], loading: true, error: "" }));
      try {
        const { data } = await api.get(`/matchmaking/${selectedRequestId}/messages`);
        if (active) {
          setMessageData({ requestId: selectedRequestId, messages: data.data || [], loading: false, error: "" });
          setConversations((current) => current.map((row) => String(row.request_id) === selectedRequestId
            ? { ...row, unread_count: 0 }
            : row));
        }
      } catch (error) {
        if (active) setMessageData((current) => ({ requestId: selectedRequestId, messages: current.requestId === selectedRequestId ? current.messages : [], loading: false, error: error.response?.data?.message || "We couldn’t load this conversation." }));
      } finally {
        if (active && !quiet) setMessageData((current) => current.requestId === selectedRequestId ? { ...current, loading: false } : current);
      }
    };

    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, 12000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [selectedRequestId, selectedStatus, messageAttempt]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!selected || selected.status !== "accepted" || !body || sending) return;
    setSending(true);
    setMessageData((current) => ({ requestId: String(selected.request_id), messages: current.requestId === String(selected.request_id) ? current.messages : [], loading: false, error: "" }));
    setNotice("");
    try {
      const { data } = await api.post(`/matchmaking/${selected.request_id}/messages`, { body });
      setMessageData((current) => ({ requestId: String(selected.request_id), messages: [...(current.requestId === String(selected.request_id) ? current.messages : []), data.data], loading: false, error: "" }));
      setDraft("");
      setNotice("Message sent.");
      loadConversations();
    } catch (error) {
      setMessageData((current) => ({ requestId: String(selected.request_id), messages: current.requestId === String(selected.request_id) ? current.messages : [], loading: false, error: error.response?.data?.message || "Your message couldn’t be sent. Please try again." }));
    } finally {
      setSending(false);
    }
  };

  return <main className="im-messages-page">
    <style>{`
      .im-messages-page { min-height:75vh; padding:38px clamp(16px,4vw,52px) 90px; color:#e7edf5; background:#080d17; }
      .im-messages-shell { max-width:1220px; margin:0 auto; }
      .im-messages-head { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; flex-wrap:wrap; margin-bottom:22px; }
      .im-messages-head h1 { margin:4px 0 8px; font-size:clamp(28px,4vw,38px); }
      .im-messages-head p { max-width:650px; margin:0; color:#94a3b8; line-height:1.6; }
      .im-messages-grid { display:grid; grid-template-columns:minmax(250px,350px) minmax(0,1fr); min-height:570px; overflow:hidden; ${Object.entries(panel).map(([key,value]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value}`).join(";")}; }
      .im-conversation-list { padding:14px; border-right:1px solid rgba(148,163,184,.14); }
      .im-conversation-list h2 { margin:4px 8px 12px; font-size:16px; }
      .im-conversation-item { display:block; width:100%; margin:0 0 8px; padding:14px; border:1px solid transparent; border-radius:10px; background:transparent; color:inherit; text-align:left; cursor:pointer; }
      .im-conversation-item:hover,.im-conversation-item.is-selected { border-color:rgba(61,214,245,.22); background:rgba(61,214,245,.07); }
      .im-conversation-item:focus-visible,.im-message-send:focus-visible,.im-message-compose textarea:focus-visible { outline:3px solid rgba(61,214,245,.5); outline-offset:2px; }
      .im-conversation-title { display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:700; }
      .im-conversation-preview { display:block; margin-top:7px; color:#94a3b8; font-size:13px; line-height:1.45; overflow-wrap:anywhere; }
      .im-conversation-meta { display:flex; justify-content:space-between; gap:8px; margin-top:9px; color:#64748b; font-size:11px; }
      .im-unread-count { min-width:21px; padding:2px 6px; border-radius:99px; background:#2dd4bf; color:#06221f; text-align:center; font-size:11px; font-weight:800; }
      .im-thread { display:flex; min-width:0; min-height:570px; flex-direction:column; }
      .im-thread-head { padding:19px 22px; border-bottom:1px solid rgba(148,163,184,.14); }
      .im-thread-head h2 { margin:0 0 5px; font-size:18px; }
      .im-thread-head p { margin:0; color:#94a3b8; font-size:13px; }
      .im-thread-body { display:flex; flex:1; min-height:300px; flex-direction:column; gap:12px; overflow:auto; padding:20px; }
      .im-intro-note { align-self:stretch; padding:13px 15px; border:1px solid rgba(139,124,246,.2); border-radius:10px; background:rgba(139,124,246,.07); color:#cbd5e1; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
      .im-intro-note strong { display:block; margin-bottom:5px; color:#b9adff; font-size:12px; }
      .im-message-bubble { max-width:min(78%,620px); padding:11px 14px; border:1px solid rgba(148,163,184,.15); border-radius:12px 12px 12px 3px; background:#111c2f; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
      .im-message-bubble.is-mine { align-self:flex-end; border-color:rgba(45,212,191,.25); border-radius:12px 12px 3px 12px; background:rgba(45,212,191,.1); }
      .im-message-time { display:block; margin-top:6px; color:#748399; font-size:10px; }
      .im-message-compose { padding:14px 18px 18px; border-top:1px solid rgba(148,163,184,.14); }
      .im-message-compose textarea { display:block; width:100%; min-height:82px; resize:vertical; padding:12px; border:1px solid #334155; border-radius:10px; background:#0b1220; color:#e7edf5; font:inherit; }
      .im-message-compose-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:10px; color:#748399; font-size:12px; }
      .im-message-send { min-height:44px; padding:0 18px; border:0; border-radius:9px; background:#2dd4bf; color:#06221f; font:inherit; font-weight:800; cursor:pointer; }
      .im-message-send:disabled { opacity:.55; cursor:not-allowed; }
      .im-thread-empty { display:grid; flex:1; min-height:300px; place-content:center; padding:26px; text-align:center; }
      .im-thread-empty p { max-width:460px; color:#94a3b8; line-height:1.6; }
      .im-message-alert { margin:12px 18px 0; padding:11px 13px; border-radius:8px; background:rgba(242,84,91,.1); color:#fecaca; }
      .im-message-notice { margin:12px 18px 0; color:#86efac; }
      .im-messages-link { display:inline-flex; min-height:44px; align-items:center; color:#67e8f9; font-weight:700; text-decoration:none; }
      @media(max-width:760px) { .im-messages-grid { grid-template-columns:1fr; min-height:0; } .im-conversation-list { border-right:0; border-bottom:1px solid rgba(148,163,184,.14); } .im-conversation-list-items { display:flex; overflow:auto; gap:8px; } .im-conversation-item { min-width:220px; margin:0; } .im-thread { min-height:520px; } .im-thread-body { min-height:260px; } .im-message-bubble { max-width:90%; } }
      @media(prefers-reduced-motion:reduce) { .im-messages-page * { scroll-behavior:auto!important; } }
    `}</style>
    <div className="im-messages-shell">
      <header className="im-messages-head">
        <div><span style={{ color:"#3dd6f5", fontSize:12, fontWeight:800, letterSpacing:".12em" }}>PLATFORM-MEDIATED INTRODUCTIONS</span><h1>Messages</h1><p>Keep discussions on Investor Mtaani. We coordinate introductions and next steps while protecting both parties’ identities.</p></div>
        <Link className="im-messages-link" to="/matchmaking">View all introductions →</Link>
      </header>

      {listError && <div className="im-message-alert" role="alert">{listError} <button type="button" onClick={loadConversations} style={{ marginLeft:10, color:"#67e8f9", background:"transparent", border:0, textDecoration:"underline", cursor:"pointer" }}>Try again</button></div>}
      <section className="im-messages-grid" aria-label="Introduction conversations">
        <aside className="im-conversation-list">
          <h2>Your introductions</h2>
          {loadingList ? <p role="status" style={{ color:"#94a3b8", padding:8 }}>Loading introductions…</p>
            : conversations.length === 0 ? <div style={{ padding:8 }}><p style={{ color:"#94a3b8", lineHeight:1.6 }}>You don’t have any introduction requests yet. Explore businesses and send a request to start.</p><Link className="im-messages-link" to="/browse">Browse businesses →</Link></div>
              : <div className="im-conversation-list-items">{conversations.map((conversation) => <button key={conversation.request_id} type="button" aria-pressed={String(conversation.request_id) === requestId} onClick={() => setSearchParams({ request:String(conversation.request_id) })} className={`im-conversation-item${String(conversation.request_id) === requestId ? " is-selected" : ""}`}>
                <span className="im-conversation-title">{conversation.counterpart_name}{conversation.unread_count > 0 && <span className="im-unread-count" aria-label={`${conversation.unread_count} unread messages`}>{conversation.unread_count}</span>}</span>
                <span className="im-conversation-preview">{conversation.latest_message || conversation.introduction_message || statusLabel(conversation.status)}</span>
                <span className="im-conversation-meta"><span>{statusLabel(conversation.status)}</span><span>{timeLabel(conversation.latest_message_at || conversation.requested_at)}</span></span>
              </button>)}</div>}
        </aside>

        {!selected ? <div className="im-thread-empty"><h2>Select an introduction</h2><p>Choose one from the list to review its status or continue an accepted conversation.</p></div>
          : <section className="im-thread" aria-label={`Conversation with ${selected.counterpart_name}`}>
            <header className="im-thread-head"><h2>{selected.counterpart_name}</h2><p>{selected.business_name} · {statusLabel(selected.status)}</p></header>
            {selected.status !== "accepted" ? <div className="im-thread-empty"><h3>{selected.status === "pending" ? "Waiting for the business to review" : "This introduction was declined"}</h3><p>{selected.status === "pending" ? "The business will be notified of your request. Messaging becomes available if they accept." : "You can browse other opportunities and submit a new introduction request."}</p>{selected.status === "declined" && <Link className="im-messages-link" to="/browse">Browse businesses →</Link>}</div>
              : <>
                {messageError && <div className="im-message-alert" role="alert">{messageError} <button type="button" onClick={() => setMessageAttempt((attempt) => attempt + 1)} style={{ marginLeft:10, color:"#67e8f9", background:"transparent", border:0, textDecoration:"underline", cursor:"pointer" }}>Retry</button></div>}
                {notice && <p className="im-message-notice" role="status">{notice}</p>}
                <div className="im-thread-body" aria-live="polite" aria-label="Messages">
                  {selected.introduction_message && <div className="im-intro-note"><strong>Original introduction request</strong>{selected.introduction_message}</div>}
                  {loadingMessages ? <p role="status" style={{ color:"#94a3b8" }}>Loading messages…</p> : messages.map((item) => <article key={item.id} className={`im-message-bubble${item.is_mine ? " is-mine" : ""}`}><span>{item.body}</span><time className="im-message-time" dateTime={item.created_at}>{item.is_mine ? "You · " : `${selected.counterpart_name} · `}{timeLabel(item.created_at)}</time></article>)}
                  {!loadingMessages && messages.length === 0 && !selected.introduction_message && <p style={{ alignSelf:"center", color:"#94a3b8" }}>This conversation is ready. Send a message to get started.</p>}
                  <div ref={endRef} />
                </div>
                <form className="im-message-compose" onSubmit={sendMessage}>
                  <label htmlFor="im-message-input" style={{ display:"block", marginBottom:8, color:"#cbd5e1", fontSize:13, fontWeight:700 }}>Your message</label>
                  <textarea id="im-message-input" value={draft} onChange={(event) => { setDraft(event.target.value); setNotice(""); }} maxLength={2000} placeholder="Ask a question or suggest a next step…" />
                  <div className="im-message-compose-footer"><span>Do not share names, contact details, links, or banking information. Investor Mtaani will coordinate the connection.</span><span>{draft.length}/2000</span></div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}><button className="im-message-send" type="submit" disabled={sending || !draft.trim()}>{sending ? "Sending…" : "Send message"}</button></div>
                </form>
              </>}
          </section>}
      </section>
    </div>
  </main>;
}
