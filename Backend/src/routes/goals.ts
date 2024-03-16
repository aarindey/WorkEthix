import { Router, Request, Response } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import zod from "zod";
import Goal from "../models/Goal";
import mongoose from "mongoose";
import Task from "../models/Task";
const router = Router();

const goalPostReq = zod.object({
  goalname: zod.string(),
  goalbrief: zod.string(),
  priorityorder: zod.string(),
});

interface CustomRequest extends Request {
  userid?: mongoose.Schema.Types.ObjectId; // Define the userid property
}

// Create a new Goal for the current user
router.post("/", authMiddleware, async (req: CustomRequest, res: Response) => {
  console.log(req.body.goalname);
  console.log(req.body.goalbrief);
  console.log(req.body.priorityorder);
  const validatedReq = goalPostReq.safeParse(req.body);
  console.log(validatedReq.success);
  if (!validatedReq.success) {
    return res.status(411).json({
      message: "Incorrect Inputs",
    });
  }

  try {
    await Goal.create({
      goalname: req.body.goalname,
      goalbrief: req.body.goalbrief,
      iscompleted: false,
      priorityorder: req.body.priorityorder,
      hourstarget: 0,
      hourscompleted: 0,
      userid: req.userid,
    });
    res.status(200).json({ message: "Db entry made!" });
  } catch (error) {
    res.status(500).json({ error: error, message: "Internal Server Error" });
  }
});

// GET all goals for the current user
router.get("/", authMiddleware, async (req: CustomRequest, res: Response) => {
  try {
    const userid = req.userid; // Get the userid from the request
    if (!userid) {
      return res.status(400).json({ message: "User ID not provided" }); // Return 400 if userid is missing
    }

    // Query the Goal model to find all goals for the current user
    const goals = await Goal.find({ userid: userid });

    // Return the goals as JSON response
    return res.status(200).json(goals);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" }); // Return 500 for any other errors
  }
});

// GET information about a goal with a certain goalid
router.get(
  "/:goalid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid; // Get the goalid from the route parameters
      if (!goalid || !userid) {
        return res.status(400).json({ message: "GoalID/UserID not provided" }); // Return 400 if goalid or userid is missing
      }

      // Validate goalid as a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(goalid)) {
        return res.status(400).json({ message: "Invalid Goal ID" }); // Return 400 if goalid is not a valid ObjectId
      }

      // Query the Goal model to find the goal with the specified goalid and userid
      const goal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" }); // Return 404 if goal with goalid is not found
      }

      // Return the goal as JSON response
      return res.status(200).json(goal);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" }); // Return 500 for any other errors
    }
  }
);

// Update information about a goal with a certain goalid
router.put(
  "/:goalid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const goalid = req.params.goalid;
      const userid = req.userid;

      // Extract updated goal information from request body
      const { goalname, goalbrief, priorityorder, iscompleted } = req.body;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({
        _id: goalid,
        userid: userid,
      });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Update the goal fields
      existingGoal.goalname = goalname || existingGoal.goalname;
      existingGoal.goalbrief = goalbrief || existingGoal.goalbrief;
      existingGoal.iscompleted = iscompleted || existingGoal.iscompleted;
      existingGoal.priorityorder = priorityorder || existingGoal.priorityorder;

      // Save the updated goal
      await existingGoal.save();

      return res
        .status(200)
        .json({ message: "Goal updated successfully", goal: existingGoal });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete a goal with a certain goalid and all tasks associated with it
router.delete(
  "/:goalid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const goalid = req.params.goalid;
      const userid = req.userid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Delete all tasks associated with the goal
      await Task.deleteMany({ goalid: goalid });

      // Delete the goal itself
      await Goal.deleteOne({ _id: goalid });

      return res
        .status(200)
        .json({ message: "Goal and associated tasks deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
