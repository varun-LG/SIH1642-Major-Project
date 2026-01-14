const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../config/db");

const router = express.Router();
router.use(cookieParser());

// Verify if user is authenticated
router.get("/verify", async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.json({ authenticated: false });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Optionally verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return res.json({ authenticated: false });
        }

        res.json({ 
            authenticated: true,
            user: user
        });
    } catch (error) {
        console.error("Auth verification error:", error);
        res.json({ authenticated: false });
    }
});

// Logout endpoint
router.post("/logout", (req, res) => {
    try {
        // Clear all auth-related cookies
        res.clearCookie("token", {
            httpOnly: false,
            sameSite: "Lax",
            secure: false,
        });
        res.clearCookie("email", {
            httpOnly: false,
            sameSite: "Lax",
            secure: false,
        });

        res.json({ status: "success", message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ error: "Failed to logout" });
    }
});

module.exports = router;
