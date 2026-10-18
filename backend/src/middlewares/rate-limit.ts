import { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { AppError } from "../shared/errors/AppError";

// Limita tentativas ao login. Só conta as falhadas, para não penalizar quem entra bem.
export const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req: Request, _res: Response, next: NextFunction) => {
    next(
      new AppError(
        429,
        "Demasiadas tentativas de início de sessão. Tente novamente mais tarde.",
        "DEMASIADAS_TENTATIVAS",
      ),
    );
  },
});
