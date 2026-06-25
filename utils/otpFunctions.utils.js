
async function createOrUpdateOtp({gym, email, purpose}) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await otpModel.findOneAndUpdate(
        {gym, email, purpose},
        {
            otp,
            expiresAt,
            verified: false,
            attempts: 0
        },
        {
            upsert: true,
            new: true
        }
    );
    await emailService.sendOtpEmail(email, otp);
    return otp;
}

async function verifyOtpRecord({gym, email, otp, purpose}){

    const otp_entry = await otpModel.findOne({gym, email, purpose});
    appAssert(otp_entry, "OTP not found !!!");
    appAssert(otp_entry.expiresAt.getTime() > Date.now(), "OTP expired. Resend to continue.");

    if (otp_entry.attempts >= MAX_OTP_ATTEMPTS) {
        await otpModel.deleteOne({ _id: otp_entry._id});
        throw new Error("Max attempts exceeded");
    }

    if (otp_entry.otp !== otp) {
        otp_entry.attempts += 1;
        await otp_entry.save();
        throw new Error("Invalid OTP");
    }

    otp_entry.verified = true;
    await otp_entry.save();
    return otp_entry;
}

module.exports = {createOrUpdateOtp, verifyOtpRecord} ;