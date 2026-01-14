const { hash } = require('bcryptjs');
const express = require('express');
const prisma = require('../config/db');

const {generateOTP} = require('../utils/getotp');
const {sendOTPEmail} = require('../utils/mailservice');
const {comparePassword}  = require('../utils/hash');
const {generateToken} = require('../utils/jwt');

const router = express.Router();

const otpStorage = {}; // Temporary in-memory store. Use Redis or DB in production.
router.post('/send-otp', async (req, res) => {
 try {
  const  {email}  = req.cookies;
  
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otp = generateOTP();
  
  otpStorage[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  await sendOTPEmail(email, otp);
  
  res.json({ token: await hash(otp, 10) }); 
 } catch (error) {
  res.status(400).json(error)
 }
});


router.post('/verify-otp', async (req, res) => {
    try {
      const {email} = req.cookies;
      const { token, otp } = req.body;
      
      console.log('Verifying OTP for:', email);
      console.log('Entered OTP:', otp);
      console.log('Stored OTP:', otpStorage[email]?.otp);
      
      if (!otpStorage[email] || otpStorage[email].expiresAt < Date.now()) {
        return res.status(400).json({ message: 'OTP expired or invalid' });
      }
    
      // Compare entered OTP with stored OTP (not the hashed token)
      if (otpStorage[email].otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    
      // OTP is valid, delete it
      delete otpStorage[email]; 

      const resp = await prisma.user.findUnique({ where: { email } });

      if (!resp) {
        return res.status(404).json({ message: 'User not found' });
      }

      const tok = await generateToken(resp.id);
      req.userId = resp.id
      res.cookie("token", tok, {
          httpOnly: false,  
          sameSite: "Lax",
          secure: false,    
        });
    
      res.json({ message: 'OTP verified successfully' });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  module.exports = router;