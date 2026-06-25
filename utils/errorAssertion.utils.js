class AppError extends Error {
    constructor(message) {
        super(message);
        this.name = "AppError";
    }
}

function appAssert(condition, message) {
    if (!condition) {
        throw new AppError(message);
    }
}

module.exports = {AppError, appAssert};