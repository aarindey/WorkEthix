import { Router, Request, Response } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import zod from "zod";
import Goal from "../models/Goal";
import mongoose from "mongoose";
import Task from "../models/Task";
const router = Router();

interface CustomRequest extends Request {
  userid?: mongoose.Schema.Types.ObjectId; // Define the userid property
}

// POST a new task for a specific goal
router.post(
  "/:goalid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      const { taskname, taskbrief, hourstarget, iscompleted } = req.body;

      // Create the new task
      const task = await Task.create({
        taskname,
        taskbrief,
        hourstarget,
        iscompleted,
        goalid,
      });

      return res
        .status(201)
        .json({ message: "Task created successfully", task });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// GET all tasks for a specific goal
router.get(
  "/:goalid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Find all tasks associated with the goal
      const tasks = await Task.find({ goalid: goalid });

      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// GET information about a specific task
router.get(
  "/:goalid/:taskid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid;
      const taskid = req.params.taskid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Find the specific task associated with the goal
      const task = await Task.findOne({ _id: taskid, goalid: goalid });

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json(task);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update information about a specific task
router.put(
  "/:goalid/:taskid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid;
      const taskid = req.params.taskid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Update the task
      const { taskname, taskbrief, hourstarget, iscompleted } = req.body;
      const updatedTask = await Task.findOneAndUpdate(
        { _id: taskid, goalid: goalid },
        { taskname, taskbrief, hourstarget, iscompleted },
        { new: true } // Return the updated task
      );

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res
        .status(200)
        .json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Delete a specific task
router.delete(
  "/:goalid/:taskid",
  authMiddleware,
  async (req: CustomRequest, res: Response) => {
    try {
      const userid = req.userid;
      const goalid = req.params.goalid;
      const taskid = req.params.taskid;

      // Check if the user owns the goal
      const existingGoal = await Goal.findOne({ _id: goalid, userid: userid });
      if (!existingGoal) {
        return res
          .status(404)
          .json({ message: "Goal not found or unauthorized" });
      }

      // Delete the task
      const deletedTask = await Task.findOneAndDelete({
        _id: taskid,
        goalid: goalid,
      });

      if (!deletedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      return res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
