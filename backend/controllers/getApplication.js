const express = require("express");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const prisma = require("../config/db");


const router = express.Router();
router.use(cookieParser());

router.post("/",async (req,res)=>{

    const token = req.cookies.token;
    console.log(token);

    if (!token) {
        return res.status(401).json({ error: "No token provided. Please login again." });
    }

    try{
        const id = jsonwebtoken.verify(token, process.env.JWT_SECRET).userId;

        const response = await prisma.application.findMany({
            where:{
                userId:id
            }
        });

        res.json(response);
    }
    catch(error){
        console.log(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

