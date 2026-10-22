export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code: string = "ERRO"
    ) {
        super(message);
    }
}