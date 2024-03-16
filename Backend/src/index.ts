import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connect from "./db/connect";
import rootRouter from "./routes/index";
import User from "./models/User";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1", rootRouter);

connect().then(() => {
  app.listen(port, () => {
    console.log(`[server]:Server is running at http://localhost:${port}`);
  });
});
