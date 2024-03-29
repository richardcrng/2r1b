import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.redirect("https://2r1b.upsink.games");
});

app.get("/ping", (req, res) => {
  res.json({ status: "success" });
});

export default app;
