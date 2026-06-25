const assert = require("assert");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {AppError, appAssert} = require("../utils/errorAssertion.utils.js");
const memberModel = require("../models/member.model.js");
const otpModel = require("../models/otp.model.js");
const emailService = require("../services/email.service.js");
const {createOrUpdateOtp, verifyOtpRecord} = require("../utils/otpFunctions.utils.js");

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const BCRYPT_ROUNDS = 10;

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateMemberToken(member) {
    return jwt.sign(
        {memberId: member._id, gymId: member.gym, type: "member"},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
}


export async function sendRegistrationOtp(req, res) {
    try{
        let {gym,email} = req.body;
        assert(gym, "Reference not found! System Error");
        appAssert(email, "Email is required!");

        email = email.toLowerCase().trim();

        const existingMember = await memberModel.findOne({gym,email});
        appAssert(!existingMember,"Entry for gym membership already exists for this email.");

        await createOrUpdateOtp({gym,email,purpose: "registration"});

        return res.json({success: true, message:"OTP sent successfully!"});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"Failed to send OTP"});
    }
};


export async function verifyRegistrationOtp(gym,email,otp) {
    try {
        appAssert(gym, "Reference not found! System Error");
        appAssert(email, "Email is required!");
        appAssert(otp, "OTP is required!");
        await verifyOtpRecord({gym, email, otp, purpose: "registration"});
        await otpModel.deleteMany({gym,email,purpose: "registration"});
        return true;
    } catch (error) {
        return false;
    }
}

// User self registration funtion
export async function requestRegistrationOtp(req, res) {
    try {
        let {gym,fullName,email,phone,address,dob,otp} = req.body;

        appAssert(gym, "Reference not found! System Error");
        appAssert(fullName, "Full name is required!");
        appAssert(email, "Email is required!");
        appAssert(phone, "Phone number is required!");
        appAssert(dob, "Date of Birth is required!");

        email = email.toLowerCase().trim();

        const existingMember = await memberModel.findOne({gym,email});
        appAssert(!existingMember,"Entry for gym member already exists.");

        const verified = await verifyRegistrationOtp(gym,email,otp);
        appAssert(verified===true, "OTP verification failed!");

        await memberModel.create({
            gym,
            fullName,
            email,
            phone,
            address,
            dob,
            status: "interested"
        });

        return res.json({success: true, message:"Entry registered successfully!"});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false,message: error.message});
        }
        return res.json({success: false, message:"Internal server error"});
    }
}



export async function loginWithPassword(req, res) {
    try {
        let {gym, email, password} = req.body;
        
        assert(gym);
        appAssert(email, "Email is required!");
        appAssert(password, "Password is required!");
        email = email.toLowerCase().trim();

        const member = await memberModel.findOne({gym, email});

        appAssert(member, "Member not found!");
        appAssert(member.password, "Password is not set yet!");

        const valid = await bcrypt.compare(password, member.password);
        appAssert(valid);
        
        member.lastLoginAt = new Date();
        await member.save();
        const token = generateMemberToken(member);
        return res.json({success: true, token, member});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function requestLoginOtp(req, res) {
    try {
        let {gym,email} = req.body;
        assert(gym);
        appAssert(email, "Email is required!");
        email = email.toLowerCase().trim();

        const member = await memberModel.findOne({gym, email});
        appAssert(member, "Member entry not found!");

        await createOrUpdateOtp({gym, email, purpose: "login"});
        return res.json({success: true});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}

export async function verifyLoginOtp(req,res) {
    try {
        let {gym,email,otp} = req.body;

        assert(gym);
        appAssert(email, "Email is required!");
        appAssert(otp, "OTP is Required!");

        email = email.toLowerCase().trim();

        await verifyOtpRecord({
            gym,
            email,
            otp,
            purpose: "login"
        });

        const member = await memberModel.findOne({gym,email});
        appAssert(member, "Member not found!");

        member.lastLoginAt = new Date();
        await member.save();

        await otpModel.deleteMany({gym, email, purpose: "login"});
        
        const token = generateMemberToken(member);
        return res.json({success: true, token, member});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function setPassword(req, res) {

    try {
        const memberId = req.member.memberId;
        const {password} = req.body;

        appAssert(password, "Password is required!");

        const member = await memberModel.findById(memberId);

        appAssert(member);
        appAssert(!member.password, "Password already exists!");
        member.password = await bcrypt.hash(password, BCRYPT_ROUNDS);

        await member.save();
        return res.json({success: true});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function changePassword(req, res) {

    try {
        const memberId = req.member.memberId;
        const {oldPassword, newPassword} = req.body;

        appAssert(oldPassword, "Old Password is required!");
        appAssert(newPassword, "New Password is required!");

        const member = await memberModel.findById(memberId);

        assert(member);
        appAssert(member.password, "Password not set yet!");

        const valid = await bcrypt.compare(oldPassword, member.password);
        appAssert(valid, "Entry for old password does not match!");

        member.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await member.save();

        return res.json({success: true});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function forgotPassword(req, res) {
    try {
        let {gym, email} = req.body;

        assert(gym);
        appAssert(email, "Email is required!");
        email = email.toLowerCase().trim();

        const member = await memberModel.findOne({gym, email});
        appAssert(member, "Member not found!");

        await createOrUpdateOtp({
            gym,
            email,
            purpose:"forgot_password"
        });

        return res.json({success: true});

    } catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}


export async function resetPassword(req,res) {
    try {
        let {gym, email, otp, newPassword} = req.body;

        assert(gym);
        appAssert(email, "Email is required!");
        appAssert(otp, "OTP is required!");
        appAssert(newPassword, "New password is required!");

        email = email.toLowerCase().trim();

        await verifyOtpRecord({
            gym,
            email,
            otp,
            purpose:"forgot_password"
        });

        const member = await memberModel.findOne({gym, email});
        appAssert(member, "Member not found!");
        member.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        await member.save();

        await otpModel.deleteMany({
            gym,
            email,
            purpose:"forgot_password"
        });

        return res.json({success: true});

    }  catch (error) {
        if (error instanceof AppError) {
            return res.json({success: false, message: error.message});
        }
        return res.json({success: false, message:"An error occured while loging in!"});
    }
}
