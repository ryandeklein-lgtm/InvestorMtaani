const pool = require("../config/db");
const { assertNoDirectIdentity, getDirectIdentityTerms, isDirectIdentitySafe } = require("../utils/identityPrivacy");

const getPosts = async (viewerId) => {
  const result = await pool.query(
    `SELECT p.id, p.business_id, p.author_id, ('Opportunity #' || b.id::text) AS business_name,
            b.industry, 'Kenya'::text AS location,
            'Verified business'::text AS author_name, p.body, p.media_mime,
            p.created_at,
            (SELECT COUNT(*) FROM community_post_likes l WHERE l.post_id = p.id)::int AS likes_count,
            EXISTS (
              SELECT 1 FROM community_post_likes mine
              WHERE mine.post_id = p.id AND mine.user_id = $1
            ) AS viewer_liked
     FROM community_posts p
     JOIN businesses b ON b.id = p.business_id AND b.status = 'approved'
     JOIN users u ON u.id = p.author_id AND u.status = 'active'
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT 50`,
    [viewerId]
  );

  const terms = await getDirectIdentityTerms([viewerId, ...result.rows.map((post) => post.author_id)]);
  return result.rows.map((post) => {
    const { author_id: authorId, body, ...safePost } = post;
    const bodyIsSafe = !body || isDirectIdentitySafe(body, terms);
    return {
      ...safePost,
      body: bodyIsSafe ? body : "This update was hidden to protect the identities of both parties.",
      media_url: post.media_mime ? `/api/community/posts/${post.id}/media` : null,
    };
  });
};

const createPost = async ({ userId, body, file }) => {
  const result = await pool.query(
    `INSERT INTO community_posts (business_id, author_id, body, media, media_mime, media_size)
     SELECT b.id, b.user_id, $2, $3, $4, $5
     FROM businesses b
     WHERE b.user_id = $1 AND b.status = 'approved'
     RETURNING id, business_id, body, media_mime, created_at`,
    [userId, body, file?.buffer || null, file?.mimetype || null, file?.size || null]
  );

  return result.rows[0] || null;
};

const getPublicMedia = async (postId) => {
  const result = await pool.query(
    `SELECT p.media, p.media_mime
     FROM community_posts p
     JOIN businesses b ON b.id = p.business_id AND b.status = 'approved'
     WHERE p.id = $1 AND p.media IS NOT NULL`,
    [postId]
  );
  return result.rows[0] || null;
};

const getPublicPostId = async (postId) => {
  const result = await pool.query(
    `SELECT p.id FROM community_posts p
     JOIN businesses b ON b.id = p.business_id AND b.status = 'approved'
     WHERE p.id = $1`,
    [postId]
  );
  return result.rows[0] || null;
};

const setLike = async (postId, userId, liked) => {
  const post = await getPublicPostId(postId);
  if (!post) return false;

  if (liked) {
    await pool.query(
      `INSERT INTO community_post_likes (post_id, user_id)
       VALUES ($1, $2) ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId]
    );
  } else {
    await pool.query(
      "DELETE FROM community_post_likes WHERE post_id = $1 AND user_id = $2",
      [postId, userId]
    );
  }
  return true;
};

module.exports = { getPosts, createPost, getPublicMedia, setLike };
