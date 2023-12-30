import * as marks from "../controllers/mark.controller.js";
import { Router } from "express";

const markRouter = app => {

  const router = Router();

  // Retrieve all Marks with pagination
  router.get("/log", marks.findAllDateSort);

  app.use("/", router);
};

export default markRouter;
