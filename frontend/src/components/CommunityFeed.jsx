import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import api from "../services/api";
import businessService from "../services/business";
import "./CommunityFeed.css";

const MAX_MEDIA_SIZE = 25 * 1024 * 1024;
const ACCEPTED_MEDIA = "image/jpeg,image/png,image/webp,video/mp4,video/webm";
const samplePosts = [
  { id: "sample-1", name: "Mtaani Makers Lab", author_name: "Amina Wanjiku", industry: "Local manufacturing", location: "Nairobi", body: "We spent Saturday with local makers mapping what a shared workshop should include. The best ideas came from listening before we started drawing plans.", likes_count: 18, viewer_liked: false, created_at: "2 hours ago", sample: true },
  { id: "sample-2", name: "Kijani Sun Co-op", author_name: "Kijani Sun Co-op", industry: "Clean energy", location: "Kitui", body: "A small milestone from our latest community site visit. What helps you explain a new energy project to neighbours in a clear, practical way?", likes_count: 12, viewer_liked: false, created_at: "5 hours ago", sample: true },
];

function mediaUrl(path) {
  return new URL(path, api.defaults.baseURL || window.location.origin).toString();
}

function PostMedia({ post }) {
  if (!post.media_url) return null;
  const src = mediaUrl(post.media_url);
  return post.media_mime?.startsWith("video/") ? (
    <video className="im-community-media" src={src} controls playsInline preload="metadata" crossOrigin="anonymous" aria-label={`Video update from ${post.business_name}`} />
  ) : (
    <img className="im-community-media" src={src} alt={`Business update from ${post.business_name}`} loading="lazy" crossOrigin="anonymous" />
  );
}

export default function CommunityFeed({ businessId = null, ownerOnly = false }) {
  const { user } = useAuthContext();
  const isBusiness = user?.role === "business";
  const [posts, setPosts] = useState([]);
  const [businessStatus, setBusinessStatus] = useState("loading");
  const [ownBusinessId, setOwnBusinessId] = useState(null);
  const [draft, setDraft] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeFilter, setActiveFilter] = useState("Latest");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [error, setError] = useState("");
  const mediaInput = useRef(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/community/posts");
      const livePosts = response.data?.data || [];
      const scopedPosts = businessId === null
        ? livePosts
        : livePosts.filter((post) => String(post.business_id) === String(businessId));
      setPosts(scopedPosts.length ? scopedPosts : businessId === null && import.meta.env.DEV ? samplePosts : []);
      setError("");
    } catch (loadError) {
      console.error("Unable to load community posts:", loadError);
      setPosts([]);
      setError("We couldn’t load the community feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (ownerOnly && !isBusiness) return undefined;
    const timer = window.setTimeout(() => { loadPosts(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts, ownerOnly, isBusiness]);

  useEffect(() => {
    if (!isBusiness) return undefined;
    let active = true;
    businessService.getMyBusiness()
      .then((response) => {
        if (!active) return;
        const profile = response.data?.data || response.data;
        setBusinessStatus(profile?.status || "draft");
        setOwnBusinessId(profile?.id ? String(profile.id) : null);
      })
      .catch((loadError) => { if (active) setBusinessStatus(loadError.response?.status === 404 ? "no-profile" : "unknown"); });
    return () => { active = false; };
  }, [isBusiness]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const visiblePosts = useMemo(() => {
    if (activeFilter === "With photos & videos") return posts.filter((post) => post.media_url);
    if (activeFilter === "Conversations") return posts.filter((post) => !post.media_url);
    return posts;
  }, [activeFilter, posts]);

  const selectMedia = (event) => {
    const file = event.target.files?.[0] || null;
    setNotice("");
    setError("");
    if (!file) return;
    if (!ACCEPTED_MEDIA.split(",").includes(file.type)) {
      setError("Choose a JPEG, PNG, WebP, MP4, or WebM file.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setError("Each photo or video must be 25 MB or smaller.");
      event.target.value = "";
      return;
    }
    setMedia(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMedia(null);
    setPreviewUrl("");
    if (mediaInput.current) mediaInput.current.value = "";
  };

  const publishPost = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body && !media) return;
    setPosting(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      if (body) formData.append("body", body);
      if (media) formData.append("media", media);
      await api.post("/community/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setDraft("");
      clearMedia();
      setNotice("Your business update is now in the community feed.");
      setActiveFilter("Latest");
      await loadPosts();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "We couldn’t publish this update. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post) => {
    if (post.sample) {
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, viewer_liked: !item.viewer_liked, likes_count: item.likes_count + (item.viewer_liked ? -1 : 1) } : item));
      return;
    }
    const wasLiked = post.viewer_liked;
    setPosts((current) => current.map((item) => item.id === post.id ? { ...item, viewer_liked: !wasLiked, likes_count: item.likes_count + (wasLiked ? -1 : 1) } : item));
    try {
      if (wasLiked) await api.delete(`/community/posts/${post.id}/likes`);
      else await api.post(`/community/posts/${post.id}/likes`);
    } catch (likeError) {
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, viewer_liked: wasLiked, likes_count: item.likes_count + (wasLiked ? 1 : -1) } : item));
      setError(likeError.response?.data?.message || "Your reaction couldn’t be saved. Please try again.");
    }
  };

  const shareOpportunity = async (post) => {
    const shareUrl = `${window.location.origin}/business/${businessId ?? post.business_id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.business_name, text: post.body || `Explore ${post.business_name} on Investor Mtaani.`, url: shareUrl });
        setShareMessage("Opportunity shared");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Opportunity link copied");
      } else {
        setShareMessage("Copy this opportunity’s link from your browser address bar");
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") setShareMessage("Could not share this opportunity");
    }
    window.setTimeout(() => setShareMessage(""), 3000);
  };

  const resolvedBusinessStatus = isBusiness ? businessStatus : "not-business";
  const canPost = isBusiness && resolvedBusinessStatus === "approved" && (businessId === null || String(ownBusinessId) === String(businessId));
  const profileUnapproved = isBusiness && !["approved", "loading", "no-profile", "unknown"].includes(resolvedBusinessStatus);

  if (ownerOnly && !canPost) return null;

  return (
    <section className="im-community" aria-label="Investor Mtaani community feed">
      <div className="im-community-heading">
        <div>
          <div className="im-community-eyebrow"><span aria-hidden="true">✳</span> {businessId !== null ? "OPPORTUNITY STORY" : "PEOPLE, IDEAS & PROGRESS"}</div>
          <h2>{businessId !== null ? "See the business in action" : "Community feed"}</h2>
          <p>{businessId !== null ? "Photos, videos and progress from this business help you get to know the team behind the opportunity." : "Follow the businesses behind the ideas, share progress and discover who you might connect with."}</p>
        </div>
        <span className="im-community-preview">{businessId !== null ? "Opportunity updates · Investor discovery" : "Business stories · Investor discovery"}</span>
      </div>

      <div className="im-community-layout">
        <div className="im-community-main">
          {canPost && <form className="im-community-composer" onSubmit={publishPost}>
            <div className="im-community-avatar im-avatar-cyan" aria-hidden="true">{user?.name?.trim()?.[0]?.toUpperCase() || "B"}</div>
            <div className="im-community-compose-body">
              <label className="im-sr-only" htmlFor="im-community-draft">Write a business update</label>
              <textarea id="im-community-draft" value={draft} onChange={(event) => { setDraft(event.target.value); setNotice(""); }} maxLength={1000} placeholder="Share a business milestone, show your workspace, or introduce your team…" rows={3} />
              {previewUrl && <div className="im-community-upload-preview">
                {media?.type.startsWith("video/") ? <video src={previewUrl} controls playsInline aria-label="Selected video preview" /> : <img src={previewUrl} alt="Selected photo preview" />}
                <button type="button" onClick={clearMedia}>Remove media</button>
              </div>}
              <div className="im-community-compose-footer">
                <div className="im-community-compose-tools">
                  <input ref={mediaInput} className="im-sr-only" id="im-community-media" type="file" accept={ACCEPTED_MEDIA} onChange={selectMedia} />
                  <button className="im-community-attach" type="button" onClick={() => mediaInput.current?.click()}><span aria-hidden="true">▧</span> Add photo or video</button>
                  <span>Up to 25 MB</span>
                </div>
                <button className="im-community-share" type="submit" disabled={posting || (!draft.trim() && !media)}>{posting ? "Sharing…" : "Share publicly"} <span aria-hidden="true">↗</span></button>
              </div>
              <p className="im-community-compose-note">Your update is public. Share business news only; don’t include private financial or identity details, offers, or payment requests.</p>
            </div>
          </form>}

          {profileUnapproved && <div className="im-community-gate" role="status"><strong>{resolvedBusinessStatus === "submitted" ? "Your business profile is awaiting approval." : "Your business profile needs approval before posting."}</strong><span>Once approved, you can share updates and appear in investor discovery.</span><Link to="/business-profile">View business profile →</Link></div>}
          {isBusiness && resolvedBusinessStatus === "unknown" && <div className="im-community-gate" role="alert"><strong>We couldn’t check your business profile.</strong><span>Refresh the page before trying to publish an update.</span><Link to="/business-profile">Open business profile →</Link></div>}
          {isBusiness && resolvedBusinessStatus === "no-profile" && <div className="im-community-gate" role="status"><strong>Introduce your business to the community.</strong><span>Create a profile first, then you can post once it’s approved.</span><Link to="/business/create">Create business profile →</Link></div>}

          {notice && <p className="im-community-notice" role="status">{notice}</p>}
          {error && <div className="im-community-error" role="alert"><span>{error}</span>{error.includes("load the community") && <button type="button" onClick={() => { setLoading(true); loadPosts(); }}>Try again</button>}</div>}

          <div className="im-community-filters" role="group" aria-label="Filter community posts">
            {["Latest", "With photos & videos", "Conversations"].map((filter) => <button type="button" key={filter} onClick={() => setActiveFilter(filter)} aria-pressed={activeFilter === filter} className={activeFilter === filter ? "is-active" : ""}>{filter}</button>)}
          </div>

          <div className="im-community-posts" aria-live="polite">
            {loading ? <p className="im-community-empty" role="status">Loading community updates…</p> : visiblePosts.map((post) => (
              <article className="im-community-post" key={post.id}>
                <div className="im-community-post-head">
                  <div className="im-community-avatar im-avatar-mint" aria-hidden="true">{(post.business_name || post.name || "B").trim()[0]?.toUpperCase()}</div>
                  <div className="im-community-author"><strong>{post.business_name || post.name}</strong><span>{post.industry || "Investor Mtaani business"} · {post.location || "Kenya"}</span></div>
                  <time>{post.sample ? post.created_at : new Date(post.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</time>
                </div>
                {post.body && <p className="im-community-post-text">{post.body}</p>}
                <PostMedia post={post} />
                <div className="im-community-actions">
                  <button type="button" className={post.viewer_liked ? "is-liked" : ""} aria-pressed={Boolean(post.viewer_liked)} onClick={() => toggleLike(post)}><span aria-hidden="true">{post.viewer_liked ? "♥" : "♡"}</span> {post.likes_count} <span className="im-action-word">likes</span></button>
                  {post.business_id && <button type="button" onClick={() => shareOpportunity(post)}><span aria-hidden="true">↗</span> Share opportunity</button>}
                  {post.business_id && !businessId && <Link className="im-community-discover" to={`/business/${post.business_id}`}>View opportunity <span aria-hidden="true">→</span></Link>}
                  {!post.business_id && <span className="im-community-sample-label">Development sample</span>}
                </div>
              </article>
            ))}
            {!loading && !error && visiblePosts.length === 0 && <div className="im-community-empty"><strong>{posts.length ? "No updates in this view yet." : businessId !== null ? "No business updates yet." : "The next connection could start here."}</strong><span>{posts.length ? "Try another feed filter." : businessId !== null ? "This business has not shared a photo, video or progress update yet." : isBusiness ? "Share a business milestone or a photo to introduce your work to investors." : "Business stories and milestones will appear here as profiles are approved."}</span></div>}
          </div>
          {shareMessage && <p className="im-community-notice" role="status">{shareMessage}</p>}
        </div>

        <aside className="im-community-aside">
          <div className="im-community-aside-card">
            <span className="im-community-aside-icon" aria-hidden="true">◌</span>
            <h3>Stories start conversations</h3>
            <p>See the people, progress and ideas behind local businesses. When you’re curious, visit a profile to learn more or request an introduction.</p>
            <div className="im-community-guideline"><span aria-hidden="true">✓</span> Business updates and discovery</div>
            <div className="im-community-guideline"><span aria-hidden="true">✓</span> Introductions stay on business profiles</div>
            <div className="im-community-guideline"><span aria-hidden="true">✓</span> No offers or payments in the feed</div>
          </div>
          <p className="im-community-disclaimer">Business photos and videos are publicly accessible once shared. Keep private, identity and financial information out of posts.</p>
        </aside>
      </div>
    </section>
  );
}
