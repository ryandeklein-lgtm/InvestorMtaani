const notificationService = require("../services/notificationService");

const getNotifications = async (req, res) => {
  try {
    const data = await notificationService.listForUser(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Could not load notifications." });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.unreadCountForUser(req.user.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error("Get unread notification count error:", error);
    res.status(500).json({ success: false, message: "Could not load notification count." });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const updated = await notificationService.markRead(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: "Could not update notification." });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const updated = await notificationService.markAllRead(req.user.id);
    res.json({ success: true, updated });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ success: false, message: "Could not update notifications." });
  }
};

module.exports = { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead };
