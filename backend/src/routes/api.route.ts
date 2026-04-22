import express = require("express");
import { Router } from "express";

import {
  addEncounterMedication,
  createPatientEncounter,
  createPatientMedicationRequest,
  createPatientRecord,
  getPatientDetail,
  getEncounterDetail,
  getHealth,
  listEncounters,
  listPatientEncounters,
  listPatientMedicationRequests,
  listMedications,
  listPatients
} from "@/controllers";

const router: Router = express.Router();

router.get("/health", getHealth);
router.get("/patients", listPatients);
router.post("/patients", createPatientRecord);
router.get("/patients/:patientId", getPatientDetail);
router.get("/patients/:patientId/encounters", listPatientEncounters);
router.post("/patients/:patientId/encounters", createPatientEncounter);
router.get("/patients/:patientId/medication-requests", listPatientMedicationRequests);
router.post("/patients/:patientId/medication-requests", createPatientMedicationRequest);
router.get("/encounters", listEncounters);
router.get("/encounters/:encounterId", getEncounterDetail);
router.post("/encounters/:encounterId/medications", addEncounterMedication);
router.get("/medications", listMedications);

export default router;
