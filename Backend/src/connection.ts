import mongoose from "mongoose";

const connectMongod = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("Mongodb url not found!");
      process.exit(1);
    }

    await mongoose
      .connect(process.env.MONGO_URL)
      .then(() => {
        console.log("MongoDB connected successfully!");
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
      });
  } catch (err) {
    console.log("Error while connecting to MongoDB : ", err);
  }
};

export default connectMongod;
