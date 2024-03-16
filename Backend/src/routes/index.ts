import { Router } from "express";
import usersRouter from "./users";
import goalsRouter from "./goals";
import tasksRouter from "./tasks";

const router = Router();

router.use("/users", usersRouter);
router.use("/goals",goalsRouter);
router.use("/tasks", tasksRouter);

export default router;