import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'crypto'

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

interface ClientData {
    redirectUrl: string
}

const db: Record<string, ClientData> = {}

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.removeHeader("X-Frame-Options");
    next();
});


app.post("/client/register", (req, res) => {
    const { clientId, redirectUrl } = req.body
    if (!clientId) return res.status(400).send("clientId is missing")
    if (!redirectUrl) return res.status(400).send("redirect url is missing")
    db[clientId] = { redirectUrl }
    console.log(`✅ client: ${clientId} registered with redirect ${redirectUrl}`)
    res.sendStatus(204);
})


app.get("/oauth/authorize", (req, res) => {
    if (typeof req.query.client_id !== "string") {
        return res.status(400).send("Invalid client_id");
    }

    const { client_id, redirect_uri, response_mode = "query" } = req.query;

    console.log(`📥 GET /oauth/authorize`)
    console.log(`   client_id:     ${client_id}`)
    console.log(`   redirect_uri:  ${redirect_uri}`)
    console.log(`   response_mode: ${response_mode}`)

    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GitHub OAuth - Authorize</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "Segoe UI", sans-serif; background: #0d1117; color: #e0e0e0;
               min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 40px 36px; width: 340px; text-align: center; }
        .logo { font-size: 2.5rem; margin-bottom: 16px; }
        h1 { font-size: 1.1rem; color: #fff; margin-bottom: 6px; }
        p { font-size: 0.82rem; color: #666; margin-bottom: 24px; }
        .field { text-align: left; margin-bottom: 14px; }
        label { font-size: 0.78rem; color: #888; display: block; margin-bottom: 4px; }
        input { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
                padding: 9px 12px; color: #e0e0e0; font-size: 0.88rem; outline: none; }
        input:focus { border-color: #4a9eff; }
        .btn { width: 100%; background: #238636; color: #fff; border: none; border-radius: 6px;
               padding: 11px; font-size: 0.9rem; font-weight: 600; cursor: pointer; margin-top: 6px; }
        .btn:hover { background: #2ea043; }
        .scope-box { background: #0d1117; border: 1px solid #30363d; border-radius: 6px;
                     padding: 10px 14px; margin-bottom: 20px; text-align: left; font-size: 0.78rem; color: #888; }
        .scope-box span { color: #4a9eff; }
        .mode-badge { display: inline-block; font-size: 0.7rem; font-family: monospace;
                      background: #161b22; border: 1px solid #30363d; border-radius: 4px;
                      padding: 2px 8px; color: #888; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">🐙</div>
        <h1>Authorize MyApp</h1>
        <p>MyApp wants to access your GitHub account</p>
        <div class="scope-box">
            Requested scope: <span>read:user</span><br>
            Client ID: <span>${client_id}</span>
        </div>
        <div class="mode-badge">response_mode: ${response_mode}</div>
        <form method="POST" action="/oauth/authorize">
            <input type="hidden" name="client_id" value="${client_id}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
            <input type="hidden" name="response_mode" value="${response_mode}" />
            <div class="field">
                <label>Username</label>
                <input type="text" name="username" value="john_doe" />
            </div>
            <div class="field">
                <label>Password</label>
                <input type="password" name="password" value="supersecret123" />
            </div>
            <button class="btn" type="submit">Authorize & Login</button>
        </form>
    </div>
</body>
</html>`);
});

app.post("/oauth/authorize", (req, res) => {
    const { redirect_uri, client_id, response_mode = "query" } = req.body;

    console.log(`📥 POST /oauth/authorize`)
    console.log(`   client_id:     ${client_id}`)
    console.log(`   redirect_uri:  ${redirect_uri}`)
    console.log(`   response_mode: ${response_mode}`)

    if (!redirect_uri) return res.status(400).send("Missing redirect_uri");
    if (typeof redirect_uri !== "string") return res.status(400).send("redirect_uri should be a string");

    const clientUrl = db[client_id]?.redirectUrl;

    if (clientUrl) {
        if (response_mode === "query") {
            // strict — full URL must include registered redirectUrl
            if (!redirect_uri.includes(clientUrl)) {
                console.log(`❌ redirect_uri rejected (query mode)`)
                return res.status(400).send("redirect_uri doesnt match");
            }
        } else if (response_mode === "fragment") {
            // 💀 weak — only checks origin, bypassable with subdomain tricks
            const registeredOrigin = new URL(clientUrl).origin;
            const requestedOrigin = new URL(redirect_uri).origin;
            if (!requestedOrigin.includes(registeredOrigin.replace("http://", ""))) {
                console.log(`❌ redirect_uri rejected (fragment mode)`)
                return res.status(400).send("redirect_uri doesnt match");
            }
        } else {
            // 💀 web_message + unknown modes — no validation at all
            console.log(`⚠️  response_mode="${response_mode}" — skipping redirect_uri validation`)
        }
    }

const code = crypto.randomUUID();
console.log(`🎟️  generated code: ${code}`)
console.log(`🔀 response_mode check: "${response_mode}"`)  // ← add this
console.log(`🔀 is web_message: ${response_mode === "web_message"}`)  

    // fragment mode
    if (response_mode === "fragment") {
        console.log(`↩️  redirecting (fragment) to ${redirect_uri}#code=${code}`)
        return res.redirect(`${redirect_uri}#code=${code}`);
    }

    // web_message mode — postMessage to attacker-controlled origin 💀
if (response_mode === "web_message") {
    console.log(`📨 entering web_message block`) 
    return res.send(`
        <!DOCTYPE html>
        <html><body>
        <script>
            console.log("=== web_message handler ===");
            console.log("opener:", window.opener);
            console.log("parent:", window.parent);
            console.log("parent === window:", window.parent === window);
            console.log("targetOrigin:", "${redirect_uri}");
            console.log("code:", "${code}");

            const code = "${code}";
            const targetOrigin = "${redirect_uri}";

            if (window.opener) {
                console.log("sending via opener");
                window.opener.postMessage({ code }, "*");
                // window.close();
            } else if (window.parent !== window) {
                console.log("sending via parent");
                window.parent.postMessage({ code }, "*");
            } else {
                console.log("fallback redirect");
                window.location.href = targetOrigin + "?code=" + code + "&mode=web_message_fallback";
            }
        </script>
        </body></html>
    `);
}


    // default: query mode
    const params = new URLSearchParams({ code });
    console.log(`↩️  redirecting (query) to ${redirect_uri}?${params}`)
    res.redirect(`${redirect_uri}?${params}`);
});

app.listen(3001, () => console.log("🔐 auth server listening on :3001"))
