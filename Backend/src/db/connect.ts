import mongoose from "mongoose";

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URL as string).then(() => {
    console.log("Database is connected");
  });
};

export default connect;
