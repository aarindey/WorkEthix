import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    hourscompleted: Number,
    hourstarget: Number
});

const User = mongoose.model("User", userSchema);
export default User;