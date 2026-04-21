import express = require("express");
import rootRouter from "@/routes/root.route";
import { SERVER_PORT } from "@/configs";

const app = express();

app.use(express.json());
app.use("/", rootRouter);

app.listen(SERVER_PORT, () => {
  console.log(`Server running at http://localhost:${SERVER_PORT}`);
});
