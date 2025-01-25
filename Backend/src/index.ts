import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import ws from "ws";

import connectMongod from "./connection";
("./connection");

import authRoutes from "./Routes/auth";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

const server = http.createServer(app);

const wss = new ws.Server({ server });

const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/api", authRoutes);

app.get("*", (req: Request, res: Response) => {
  console.log(req.url);
  res.status(404).json({ error: "No such API found!" });
});

server.listen(PORT, async () => {
  await connectMongod();
  console.log("App listening on port ", PORT);
});
