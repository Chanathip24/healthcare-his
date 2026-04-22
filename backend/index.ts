import express = require("express");
import cors, { CorsOptions } from "cors";
import rootRouter from "@/routes/root.route";
import patientRouter from "@/routes/patient.route";
import encounterRouter from "@/routes/encounter.route";
import practitionerRouter from "@/routes/practitioner.route";
import { ALLOWED_ORIGINS, SERVER_PORT } from "@/configs";

const app = express();
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/", rootRouter);
app.use("/patients", patientRouter);
app.use("/encounters", encounterRouter);
app.use("/practitioners", practitionerRouter);

app.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});
