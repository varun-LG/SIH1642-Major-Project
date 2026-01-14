const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../config/db");

const router = express.Router();
router.use(cookieParser());

// Save uploaded documents
router.post("/", async (req, res) => {
    try {
        const { documents, startupId } = req.body;
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        
        const userId = decoded.userId;

        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ error: "No documents provided" });
        }

        // First, check if startup exists, if not create one
        let startup = null;
        if (startupId) {
            startup = await prisma.startup.findFirst({
                where: {
                    id: parseInt(startupId),
                    userId: userId
                }
            });
        }

        // If no startup found, create a default one for document storage
        if (!startup) {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            startup = await prisma.startup.create({
                data: {
                    name: user.name + "'s Startup",
                    founder: user.name,
                    email: user.email,
                    registrationNo: "TEMP-" + Date.now(),
                    userId: userId,
                    status: "PENDING"
                }
            });
        }

        // Delete existing documents for this startup
        await prisma.document.deleteMany({
            where: {
                startupId: startup.id
            }
        });

        // Save new documents
        const savedDocuments = await Promise.all(
            documents.map(doc => 
                prisma.document.create({
                    data: {
                        url: doc.url,
                        type: doc.type || "REGISTRATION", // default type
                        startupId: startup.id
                    }
                })
            )
        );

        res.json({ 
            status: "success", 
            documents: savedDocuments,
            startupId: startup.id 
        });
    } catch (error) {
        console.error("Error saving documents:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get documents for a user
router.get("/", async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: "No token provided. Please login again." });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        
        const userId = decoded.userId;

        // Get all startups for this user
        const startups = await prisma.startup.findMany({
            where: {
                userId: userId
            },
            include: {
                documents: true
            }
        });

        // Flatten all documents from all startups
        const documents = startups.flatMap(startup => 
            startup.documents.map(doc => ({
                id: doc.id,
                url: doc.url,
                type: doc.type,
                uploadedAt: doc.uploadedAt,
                startupId: startup.id
            }))
        );

        res.json({ 
            status: "success", 
            documents: documents 
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
