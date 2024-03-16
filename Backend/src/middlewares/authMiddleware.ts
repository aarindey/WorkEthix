import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// A custom type for the Request object
interface CustomRequest extends Request {
  userid?: mongoose.Schema.Types.ObjectId; // Define the userid property
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req.headers as any).authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({
      message: "JWT absent",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token absent" });
  }

  try {
    let decodedJWT = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userid: mongoose.Schema.Types.ObjectId;
    };
    (req as CustomRequest).userid = decodedJWT.userid;

    next();
  } catch (err) {
    res.status(403).json({ error: err, message: "JWT error" });
  }
};

export default authMiddleware;
