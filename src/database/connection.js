import mongoose from "mongoose";

export const databaseConnection = () => {
  mongoose
    .connect("mongodb://localhost:27017/course-platform-db")
    .then(() => {
      console.log("database connected successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};
