import { Router, Request, Response } from "express";
import zod from "zod";
import User from "../models/User";
import authMiddleware from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const router = Router();

const signupReqBody = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req: Request, res: Response) => {
  // Request body check
  const validatedReq = signupReqBody.safeParse(req.body);
  if (!validatedReq.success) {
    return res.status(411).json({
      message: "Incorrect Inputs",
    });
  }

  // Db check
  const existingUser = await User.findOne({ username: req.body.username });
  if (existingUser) {
    return res.status(411).json({
      message: "User already present",
    });
  }

  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      hourscompleted: 0,
      hourstarget: 0,
    });

    const id = user._id;
    const token = jwt.sign({ userid: id }, process.env.JWT_SECRET as string);
    res.status(200).json({
      message: "Sign up successful",
      token: token,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const signinReqBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", authMiddleware, async (req: Request, res: Response) => {
  // Request Body Check
  const validatedReq = signinReqBody.safeParse(req.body);
  if (!validatedReq.success) {
    return res.status(411).json({ message: "Incorrect Inputs" });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (user) {
    const userid = user._id;
    const token = jwt.sign(
      { userid: userid },
      process.env.JWT_SECRET as string
    );
    return res.status(200).json({ message: "Login Successful", token: token });
  }

  res.status(411).json({ message: "Error while logging in" });
});

// A custom type for the Request object
interface CustomRequest extends Request {
  userid?: mongoose.Schema.Types.ObjectId; // Define the userid property
}

router.get("/", authMiddleware, async (req: CustomRequest, res: Response) => {
  try {
    const userid = req.userid;
    const user = await User.find({ _id: userid });

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Return 404 if user is not found
    }

    // If user is found, return user information
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ error: error, message: "Internal server error" }); // Return 500 for any other errors
  }
});

export default router;
