const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../config/db");
const { sendOTPEmail } = require('../utils/mailservice');

const router = express.Router();
router.use(cookieParser());

// Get all applications with user and document details (Admin only)
router.get("/applications", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Get all applications with user details and documents
        const applications = await prisma.application.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        ayushCategory: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            status: "success",
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Get all startups with documents (Admin only)
router.get("/startups", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Get all startups with documents and user details
        const startups = await prisma.startup.findMany({
            include: {
                documents: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        ayushCategory: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            status: "success",
            startups
        });
    } catch (error) {
        console.error("Error fetching startups:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Get application with documents
router.get("/application/:id", async (req, res) => {
    try {
        const token = req.cookies.token;
        const applicationId = parseInt(req.params.id);

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Get application with user and startup details including documents
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        ayushCategory: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Get all documents uploaded by the user who submitted this application
        // Documents are related to Startup, and Startup is related to User
        // So we need to find all startups belonging to this user, then get their documents
        const documents = await prisma.document.findMany({
            where: {
                startup: {
                    userId: application.userId
                }
            },
            include: {
                startup: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });

        res.json({
            status: "success",
            application: {
                ...application,
                documents
            }
        });
    } catch (error) {
        console.error("Error fetching application:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Update application status (Admin only)
router.put("/application/:id/status", async (req, res) => {
    try {
        const token = req.cookies.token;
        const applicationId = parseInt(req.params.id);
        const { status, remarks } = req.body;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Validate status
        const validStatuses = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Get application to check if it exists and get user email
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Update application status
        const updatedApplication = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        // Send email notification to user
        try {
            const emailSubject = `AYUSH Application Status Update: ${status}`;
            const emailBody = `
                <h2>Application Status Update</h2>
                <p>Dear ${application.user.name},</p>
                <p>Your application "<strong>${application.title}</strong>" status has been updated.</p>
                <p><strong>New Status:</strong> ${status}</p>
                ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
                <p>Please login to your dashboard for more details.</p>
                <br>
                <p>Best regards,</p>
                <p>AYUSH Startup Portal Team</p>
            `;

            await sendOTPEmail(application.user.email, emailBody, emailSubject);
        } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail the request if email fails
        }

        // Create in-app notification
        try {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    title: `Application ${status}`,
                    message: `Your application "${application.title}" has been ${status.toLowerCase()}${remarks ? '. ' + remarks : '.'}`,
                    type: 'APPLICATION_STATUS',
                    applicationId: applicationId
                }
            });
        } catch (notificationError) {
            console.error("Failed to create notification:", notificationError);
            // Don't fail the request if notification creation fails
        }

        res.json({
            status: "success",
            application: updatedApplication,
            message: "Application status updated successfully"
        });
    } catch (error) {
        console.error("Error updating application status:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Get all mentors (including unapproved) - Admin only
router.get("/mentors", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Get all mentors including unapproved
        const mentors = await prisma.mentor.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            status: "success",
            mentors: mentors
        });
    } catch (error) {
        console.error("Error fetching mentors:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Approve/Reject mentor - Admin only
router.put("/mentor/:id/approval", async (req, res) => {
    try {
        const token = req.cookies.token;
        const mentorId = parseInt(req.params.id);
        const { approved } = req.body;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Update mentor approval status
        const updatedMentor = await prisma.mentor.update({
            where: { id: mentorId },
            data: { approved: approved }
        });

        res.json({
            status: "success",
            mentor: updatedMentor,
            message: `Mentor ${approved ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.error("Error updating mentor approval:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

// Get dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized. Admin access only." });
        }

        // Get statistics
        const totalApplications = await prisma.application.count();
        const submittedApplications = await prisma.application.count({
            where: { status: 'SUBMITTED' }
        });
        const inReviewApplications = await prisma.application.count({
            where: { status: 'IN_REVIEW' }
        });
        const approvedApplications = await prisma.application.count({
            where: { status: 'APPROVED' }
        });
        const rejectedApplications = await prisma.application.count({
            where: { status: 'REJECTED' }
        });
        const totalStartups = await prisma.startup.count();
        const totalUsers = await prisma.user.count();
        const totalMentors = await prisma.mentor.count();
        const approvedMentors = await prisma.mentor.count({
            where: { approved: true }
        });
        const pendingMentors = await prisma.mentor.count({
            where: { approved: false }
        });

        res.json({
            status: "success",
            stats: {
                totalApplications,
                submittedApplications,
                inReviewApplications,
                approvedApplications,
                rejectedApplications,
                totalStartups,
                totalUsers,
                totalMentors,
                approvedMentors,
                pendingMentors
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
