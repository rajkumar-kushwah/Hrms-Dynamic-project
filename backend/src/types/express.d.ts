import "express-serve-static-core";
import { User } from "../generated/prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    user?: user;
  }
}