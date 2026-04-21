import express = require("express");
import { Router } from "express";
import { getHealth } from "@/controllers";

const router: Router = express.Router();

router.get("/", getHealth);
router.get("/health", getHealth);

export default router;
