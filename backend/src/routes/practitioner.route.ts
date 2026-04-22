import { createPractitionerHandler, getPractitionerByIdHandler, listPractitionersHandler } from "@/controllers";
import express = require("express");
import { Router } from "express";

const router: Router = express.Router();

router.get("/", listPractitionersHandler);
router.get("/:id", getPractitionerByIdHandler);
router.post("/", createPractitionerHandler);

export default router;
