export class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

export const handleError = (error, res) => {
    const { statusCode, message } = error;
    res.status(statusCode).json({
        status: 'error',
        success: false,
        statusCode,
        message,
    });
};