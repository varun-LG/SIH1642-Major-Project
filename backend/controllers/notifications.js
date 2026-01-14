const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../config/db");

const router = express.Router();
router.use(cookieParser());

// Get all notifications for the logged-in user
router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get all notifications for this user
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Count unread notifications
        const unreadCount = await prisma.notification.count({
            where: {
                userId: userId,
                isRead: false
            }
        });

        res.json({
            status: "success",
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Mark a notification as read
router.put("/:id/read", async (req, res) => {
    try {
        const token = req.cookies.token;
        const notificationId = parseInt(req.params.id);

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify the notification belongs to this user
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Mark as read
        const updatedNotification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        res.json({
            status: "success",
            notification: updatedNotification
        });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Mark all notifications as read
router.put("/mark-all-read", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Mark all user's notifications as read
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.json({
            status: "success",
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const notificationId = parseInt(req.params.id);

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify the notification belongs to this user
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        if (notification.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Delete the notification
        await prisma.notification.delete({
            where: { id: notificationId }
        });

        res.json({
            status: "success",
            message: "Notification deleted"
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
