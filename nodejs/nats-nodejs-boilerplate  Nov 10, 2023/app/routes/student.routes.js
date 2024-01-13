import * as students from "../controllers/student.controller.js";
import { Router } from "express";

const studentRouter = app => {

  const router = Router();

  // Retrieve statistics for a single Student with id
  router.get("/statistic/:id", students.getStatistic);

  app.use("/", router);
};

export default studentRouter;
