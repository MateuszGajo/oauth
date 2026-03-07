import express from "express";
import path from "path";

const app = express();

app.get("/", (req, res) => {
    console.log("hello are we here?")
    res.sendFile(path.join(process.cwd(), "./pages/attackerPage.html"));
});

app.get("/showcase", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer.html"));
});

app.listen(3003);
