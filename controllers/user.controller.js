const assert = require("assert");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {AppError, appAssert} = require("../utils/errorAssertion.utils.js");

const userModel = require("../models/user.model.js");
const tokenModel = require("../models/token.model.js");
const memberModel = require("../models/member.model.js");
const otpModel = require("../models/otp.model.js");
const emailService = require("../services/email.service.js");
const {createOrUpdateOtp, verifyOtpRecord} = require("../utils/otpFunctions.utils.js");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 10;


function generateUserToken(user) {
    return jwt.sign(
        {userId: user._id, gymId: user.gym, roleId: user.role, type: "user"},
        process.env.JWT_SECRET, {expiresIn: "1d"}
    );
}

function validateUserStatus(user) {
    appAssert(user, "User not found!");
    appAssert(user.status !== "deleted", "Account deleted!");
    appAssert(user.status !== "suspended","Account suspended!");
    appAssert(user.status === "active","Account inactive!");
}

export async function inviteUser(req, res) {
    try {
        let {fullName, email, phone, role, dob} = req.body;

        appAssert(fullName, "Full name is required!");
        appAssert(email, "Email is required!");
        appAssert(phone, "Phone is required!");
        appAssert(role, "Role is required!");

        email = email.toLowerCase().trim();

        const existingUser = await userModel.findOne({email});

        appAssert(!existingUser, "User already exists!");

        const user = await userModel.create({
                fullName,
                email,
                phone,
                role,
                dob,
                gym:req.user.gymId,
                createdBy:req.user.userId,
                status:"inactive"
            });

        await tokenModel.deleteMany({
            entityType:"user",
            entityId:user._id,
            purpose:"invite"
        });

        const token = crypto.randomUUID();

        await tokenModel.create({
            entityType:"user",
            entityId:user._id,
            purpose:"invite",
            token
        });

        const inviteLink = `${process.env.FRONTEND_URL}/set-password?token=${token}`;
        
        await emailService.sendEmail({
            to: user.email,
            subject:"Account Invitation",
            html: `
                <div style="font-family:Arial,sans-serif">
                    <h2>
                        Welcome ${user.fullName}
                    </h2>

                    <p>
                        You have been invited
                        to access the GYM OS system .
                    </p>

                    <a href="${inviteLink}">
                        Set Password
                    </a>
                </div>
            `
        });

        return res.json({success: true, message:"Invitation sent successfully!"});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message:error.message});
        }
        return res.json({success: false, message:"Failed to send invitation!"
        });
    }
}


export async function setPassword(req, res) {
    try {
        const {token, password} = req.body;
        appAssert(token, "Token is required!");

        appAssert(password, "Password is required!");

        const tokenEntry = await tokenModel.findOne({
                token,
                entityType:"user",
                purpose:"invite",
                used:false
            });

        appAssert(tokenEntry,"Invalid invitation link!");
        const user = await userModel.findById(tokenEntry.entityId);
        appAssert(user,"User not found!");

        appAssert(!user.password, "Password already exists!");

        user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
        user.status = "active";
        await user.save();

        await tokenModel.deleteOne({_id: tokenEntry._id});

        const authToken = generateUserToken(user);
        return res.json({success: true, token:authToken, user});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message:error.message});
        }
        return res.json({success: false, message:"Failed to set password!"});
    }
}



export async function loginWithPassword(req, res) {
    try {
        let {gym, email, password} = req.body;
        assert(gym);
        appAssert(email, "Email is required!");
        appAssert(password,"Password is required!");
        
        email = email.toLowerCase().trim();

        const user = await userModel.findOne({gym,email});

        validateUserStatus(user);
        appAssert(user.password,"Password is not set yet!");

        const valid = await bcrypt.compare(password,user.password);
        appAssert(valid, "Invalid credentials!");

        user.lastLoginAt = new Date();
        await user.save();

        const token = generateUserToken(user);
        return res.json({success: true, token, user});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message:error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function requestLoginOtp(req, res) {
    try {
        let {gym, email} = req.body;
        assert(gym);
        appAssert(email, "Email is required!");
        email = email.toLowerCase().trim();

        const user = await userModel.findOne({gym,email});
        validateUserStatus(user);

        await createOrUpdateOtp({gym, email, purpose:"login"});

        return res.json({success: true});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message:error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function verifyLoginOtp(req, res) {
    try {
        let {gym, email, otp} = req.body;
        assert(gym);
        appAssert(email, "Email is required!");
        appAssert(otp, "OTP is Required!");
        email = email.toLowerCase().trim();

        await verifyOtpRecord({gym, email, otp, purpose:"login"});

        const user = await userModel.findOne({gym, email});
        validateUserStatus(user);

        user.lastLoginAt = new Date();
        await user.save();

        await otpModel.deleteMany({gym, email, purpose:"login"});

        const token = generateUserToken(user);

        return res.json({success: true, token, user});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message:error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}