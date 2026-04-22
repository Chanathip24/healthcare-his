import express = require("express");
import { Router } from "express";

import {
  addEncounterMedication,
  createPatientRecord,
  getEncounterDetail,
  getHealth,
  listEncounters,
  listMedications,
  listPatients
} from "@/controllers";

const router: Router = express.Router();

router.get("/health", getHealth);
router.get("/patients", listPatients);
router.post("/patients", createPatientRecord);
router.get("/encounters", listEncounters);
router.get("/encounters/:encounterId", getEncounterDetail);
router.post("/encounters/:encounterId/medications", addEncounterMedication);
router.get("/medications", listMedications);

export default router;
