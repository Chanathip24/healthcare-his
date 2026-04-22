import {
  createEncounterHandler,
  createMedicationRequestHandler,
  createPatientHandler,
  getPatientByIdHandler,
  listPatientEncountersHandler,
  listPatientMedicationRequestsHandler,
  listPatientsHandler
} from "@/controllers";
import express = require("express");
import { Router } from "express";

const router: Router = express.Router();

router.get("/", listPatientsHandler);
router.get("/:id", getPatientByIdHandler);
router.post("/", createPatientHandler);
router.get("/:id/medication-requests", listPatientMedicationRequestsHandler);
router.post("/:id/medication-requests", createMedicationRequestHandler);
router.get("/:id/encounters", listPatientEncountersHandler);
router.post("/:id/encounters", createEncounterHandler);

export default router;