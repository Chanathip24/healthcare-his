import express = require("express");
import { Router } from "express";
import { getHealth } from "@/controllers";
import apiRouter from "@/routes/api.route";

const router: Router = express.Router();

router.get("/", getHealth);
router.get("/health", getHealth);
router.use("/api/v1", apiRouter);

export default router;
