const followService = require("../services/followService");

const listFollowing = async (req, res) => {
  try {
    const data = await followService.listForUser(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error("List followed businesses error:", error);
    res.status(500).json({ success: false, message: "Could not load followed businesses." });
  }
};

const followBusiness = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ success: false, message: "Invalid business." });
    const result = await followService.followBusiness(req.user.id, req.params.id);
    if (!result.found) return res.status(404).json({ success: false, message: "Business not found." });
    if (result.selfFollow) return res.status(400).json({ success: false, message: "You cannot follow your own business." });
    res.status(result.created ? 201 : 200).json({ success: true, data: { following: true } });
  } catch (error) {
    console.error("Follow business error:", error);
    res.status(500).json({ success: false, message: "Could not follow this business." });
  }
};

const unfollowBusiness = async (req, res) => {
  try {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ success: false, message: "Invalid business." });
    await followService.unfollowBusiness(req.user.id, req.params.id);
    res.json({ success: true, data: { following: false } });
  } catch (error) {
    console.error("Unfollow business error:", error);
    res.status(500).json({ success: false, message: "Could not unfollow this business." });
  }
};

module.exports = { listFollowing, followBusiness, unfollowBusiness };
