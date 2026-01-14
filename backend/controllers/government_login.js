const express = require('express');
const prisma = require('../config/db');
const {generateToken} = require('../utils/jwt');
const router = express.Router();

// Government login with hardcoded credentials
router.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check for government credentials
        if (email === 'goverment@india.com' && password === 'test12@TT') {
            // Create or get government user
            let govUser = await prisma.user.findUnique({ 
                where: { email: 'goverment@india.com' } 
            });

            if (!govUser) {
                // Create government user if doesn't exist
                const {hashPassword} = require('../utils/hash');
                const hashedPassword = await hashPassword('test12@TT');
                
                govUser = await prisma.user.create({
                    data: {
                        name: 'Government Administrator',
                        email: 'goverment@india.com',
                        password: hashedPassword,
                        role: 'ADMIN',
                        ayushCategory: 'Government'
                    }
                });
            }

            const token = await generateToken(govUser.id);
            
            res.cookie("token", token, {
                httpOnly: false,
                sameSite: "Lax",
                secure: false,
            });

            res.cookie("email", email, {
                httpOnly: false,
                sameSite: "Lax",
                secure: false,
            });

            res.json({ 
                status: "success", 
                role: "ADMIN",
                userId: govUser.id,
                requiresOTP: false // Skip OTP for government login
            });
        } else {
            return res.status(401).json({ error: "Invalid government credentials" });
        }
    } catch (error) {
        console.error('Government login error:', error);
        return res.status(400).json({ error: error.message });
    }
});

module.exports = router;
