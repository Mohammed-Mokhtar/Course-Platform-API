import express from "express";
import authRouter from "./module/auth/auth.controller.js";
import userRouter from "./module/users/users.controller.js";
import courseRouter from "./module/courses/courses.controller.js";
import sessionRouter from "./module/sessions/sessions.controller.js";
import questionRouter from "./module/questions/question.controller.js";
import enrollmentRouter from "./module/enrollment/enrollment.controller.js";
import adminRouter from "./module/adminDashboard/adminDashboard.controller.js";

import { databaseConnection } from "./database/connection.js";

export const bootstrap = () => {
  const app = express();
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  databaseConnection();

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/courses", courseRouter);
  app.use("/api/v1/sessions", sessionRouter);
  app.use("/api/v1/questions", questionRouter);
  app.use("/api/v1/enrollments", enrollmentRouter);
  app.use("/api/v1/admin", adminRouter);

  app.listen(3000, () => {
    console.log("listening on port 3000...");
  });
};
