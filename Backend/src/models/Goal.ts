import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  goalname: String,
  goalbrief: String,
  iscompleted: Boolean,
  priorityorder: String,
  hourstarget: Number,
  hourscompleted: Number,
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencing the User model
    required: true,
  },
});

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;
