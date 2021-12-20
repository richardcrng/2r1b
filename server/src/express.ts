import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("2R1B backend server is running and ready for connections");
});

app.get("/ping", (req, res) => {
  res.json({ status: "success" });
});

export default app;
