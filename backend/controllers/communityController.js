const communityService = require("../services/communityService");
const { assertNoDirectIdentity } = require("../utils/identityPrivacy");

const handleError = (res, error) => {
  const status = error.status || 500;
  if (status === 500) console.error("Community feed error:", error);
  return res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong. Please try again." : error.message,
  });
};

const getPosts = async (req, res) => {
  try {
    const posts = await communityService.getPosts(req.user.id);
    res.json({ success: true, data: posts });
  } catch (error) {
    handleError(res, error);
  }
};

const createPost = async (req, res) => {
  try {
    const body = String(req.body.body || "").trim();
    if (body.length > 1000) {
      return res.status(400).json({ success: false, message: "Updates can be up to 1,000 characters." });
    }
    if (!body && !req.file) {
      return res.status(400).json({ success: false, message: "Add an update or choose a photo or video." });
    }
    if (body && !(await assertNoDirectIdentity(req.user.id, body))) {
      return res.status(400).json({ success: false, message: "For everyone’s privacy, public updates cannot include names, contact details, or links. Share an anonymous business update instead." });
    }

    const post = await communityService.createPost({ userId: req.user.id, body, file: req.file });
    if (!post) {
      return res.status(403).json({ success: false, message: "Your business profile must be approved before you can post publicly." });
    }
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    handleError(res, error);
  }
};

const getMedia = async (req, res) => {
  try {
    const media = await communityService.getPublicMedia(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: "Media not found." });

    const buffer = media.media;
    res.set("Content-Type", media.media_mime);
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    res.set("Cache-Control", "public, max-age=3600");
    res.set("Accept-Ranges", "bytes");

    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      const start = match?.[1] ? Number(match[1]) : 0;
      const end = match?.[2] ? Math.min(Number(match[2]), buffer.length - 1) : buffer.length - 1;
      if (!match || start > end || start >= buffer.length) {
        res.set("Content-Range", `bytes */${buffer.length}`);
        return res.status(416).end();
      }
      res.status(206);
      res.set("Content-Range", `bytes ${start}-${end}/${buffer.length}`);
      res.set("Content-Length", String(end - start + 1));
      return res.end(buffer.subarray(start, end + 1));
    }

    res.set("Content-Length", String(buffer.length));
    res.end(buffer);
  } catch (error) {
    handleError(res, error);
  }
};

const setLike = (liked) => async (req, res) => {
  try {
    const changed = await communityService.setLike(req.params.id, req.user.id, liked);
    if (!changed) return res.status(404).json({ success: false, message: "Post not found." });
    res.json({ success: true, liked });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getPosts, createPost, getMedia, likePost: setLike(true), unlikePost: setLike(false) };
