import { getEncounterByIdHandler, listEncountersHandler } from "@/controllers";
import express = require("express");
import { Router } from "express";

const router: Router = express.Router();

router.get("/", listEncountersHandler);
router.get("/:id", getEncounterByIdHandler);

export default router;
