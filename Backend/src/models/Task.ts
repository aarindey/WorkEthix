import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    taskname: String,
    taskbrief: String,
    hourstarget: Number,
    iscompleted: Boolean,
    goalid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
        required: true
    }
});

const Task = mongoose.model("Task", taskSchema);
export default Task;