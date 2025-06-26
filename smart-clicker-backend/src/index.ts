import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import roleController from "./controllers/roleController";
import clickerController from "./controllers/clickerController";
import qotdController from "./controllers/qotdController";
import userController from "./controllers/userController";
import officeController from "./controllers/officeController";
import { RoleService } from "./services/roleService";

dotenv.config();
const production = process.env.PRODUCTION === "true";

const roleService = new RoleService();

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL!,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET || "",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: production, // set this to true on production
    },
  })
);

app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api-docs", (req, res) => {
  const filePath = path.resolve(__dirname, "../swagger.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading swagger.json:", err);
      return res.status(500).send("Error loading Swagger specification");
    }
    res.json(JSON.parse(data));
  });
});

app.use("/role", roleController);
app.use("/clicker-data", clickerController);
app.use("/qotd", qotdController);
app.use("/user", userController);
app.use("/office", officeController);

app.use((req, res, next) => {
  res.status(404).send("Not Found");
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  }
);

const port = process.env.BACKEND_PORT || 80;

app.listen(port, async () => {
  await roleService.init();
  console.log(`App listening on port ${port}`);
});
