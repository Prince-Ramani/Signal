import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import ws from "ws";

import * as cookie from "cookie";

import connectMongod from "./connection";
("./connection");

import authRoutes from "./Routes/auth";
import { validateToken } from "./token";
import Messages from "./Models/MessageModel";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

interface WebSocketMessage {
  event: string;
  data: any;
}

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

const server = http.createServer(app);

const wss = new ws.Server({ server });

const usersMap = new Map<string, ws>();

wss.on("connection", async (ws, req) => {
  var cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

  if (!cookies.user) {
    ws.close(1008, "Unauthorized");
    return;
  }

  const userID = validateToken(cookies.user);

  if (!userID) {
    ws.close(1008, "Unauthorized");
    return;
  }

  usersMap.set(userID, ws);

  ws.on("message", async (message) => {
    try {
      const data = typeof message === "string" ? message : message.toString();
      const ev: WebSocketMessage = JSON.parse(data);

      if (ev.event === "sendMessage") {
      }
    } catch (err) {
      console.log(err);
      ws.send(
        JSON.stringify({
          event: "error",
          message: "Internal server error: Failed to parse the message.",
        })
      );
    }
  });

  ws.on("close", (code, reason) => {
    console.log(
      "WebSocket connection closed with code : ",
      code,
      ", Reason : ",
      reason
    );
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

app.get("*", (req: Request, res: Response) => {
  console.log(req.url);
  res.status(404).json({ error: "No such API found!" });
});

server.listen(PORT, async () => {
  await connectMongod();
  console.log("App listening on port ", PORT);
});
