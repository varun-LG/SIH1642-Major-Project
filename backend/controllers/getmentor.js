const express = require("express");
const cookieParser = require("cookie-parser");
const prisma = require("../config/db");

const router = express.Router();

router.use(cookieParser());

// Get all mentors (only approved)
router.get("/all", async (req,res)=>{
    try {
        const mentors = await prisma.mentor.findMany({
            where: {
                approved: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            status: "success",
            mentors: mentors
        });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// Get approved mentors only (public)
router.get("/all", async (req,res)=>{
    try {
        const mentors = await prisma.mentor.findMany({
            where: {
                approved: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            status: "success",
            mentors: mentors
        });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// Approve/reject mentor
router.put("/admin/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        const { approved } = req.body;

        const mentor = await prisma.mentor.update({
            where: { id: parseInt(id) },
            data: { approved: approved }
        });

        res.json({
            status: "success",
            message: `Mentor ${approved ? 'approved' : 'rejected'} successfully`,
            mentor
        });
    } catch (error) {
        console.error('Error updating mentor:', error);
        res.status(500).json({ error: 'Failed to update mentor' });
    }
});

// Get mentor by category
router.post("/",async (req,res)=>{
    const{name,email,phone,category} = req.body;

    const response =  await prisma.mentor.findMany({
        where:{
            cataegory:category
        }
    });

    res.json({message:`the mentor ${response.name}  will be assigned you sortly`});
})

module.exports = router;