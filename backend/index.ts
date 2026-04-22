import express = require("express");

import rootRouter from "@/routes/root.route";
import { JSON_BODY_LIMIT, SERVER_PORT } from "@/configs";
import {
  corsMiddleware,
  errorHandler,
  notFoundHandler,
  rateLimitMiddleware,
  requestIdMiddleware,
  securityHeadersMiddleware
} from "@/middlewares";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: JSON_BODY_LIMIT, strict: true, type: "application/json" }));
app.use(express.urlencoded({ extended: false, limit: JSON_BODY_LIMIT }));
app.use("/", rootRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});
