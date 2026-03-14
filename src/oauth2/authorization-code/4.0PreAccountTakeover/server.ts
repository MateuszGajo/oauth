import express from 'express'
import bodyParser from 'body-parser'
import crypto from 'crypto'
const Url = require('url-parse');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/oauth/authorize", (req, res) => {
    if (typeof req.query.client_id !== "string") {
        return res.status(400).send("Invalid client_id");
    }

    const { client_id, redirect_uri } = req.query;

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
        <form method="POST" action="/oauth/authorize">
            <input type="hidden" name="client_id" value="${client_id}" />
            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
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

interface ClientData {
    redirectUrl: string
}

const db: Record<string, ClientData>  = {}

// simplified register process for demonstration purposes normally don't do that
app.post("/client/register", (req,res) => {
    const {clientId, redirectUrl} = req.body


    if (!clientId) { 
        return res.status(400).send("clientId is missing")
    }

    if (!redirectUrl) {
        return res.status(400).send("redirect url is missing")
    }

    console.log(`client: ${clientId} registered with redirect ${redirectUrl}`)

    db[clientId] = {
        redirectUrl: redirectUrl
    }

    res.sendStatus(204);
})

interface ClientCode {
    code: string
}

const codesPerClient: Record<string, ClientCode>= {}

app.post("/oauth/authorize", (req, res) => {
    const { redirect_uri, client_id } = req.body;


    if (!redirect_uri) {
        return res.status(400).send("Missing redirect_uri");
    }

    if (typeof redirect_uri != 'string') {
        return res.status(400).send("redirect_uri should be a string");
    }


    const clientUrl = db[client_id]?.redirectUrl;

    // VULNERABLE: url-parse 1.5.6 sees host → oauthclientattacker:3003
    // but parsed.host check passes because clientUrl appears as username
    const parsed = new Url(redirect_uri);
    const parsedClient = new Url(clientUrl);

    if (clientUrl && !parsed.href.includes(parsedClient.host)) {
        return res.status(400).send("redirect_uri doesnt match");
    }
    const code = crypto.randomUUID()

    const params = new URLSearchParams({
        code: code,
    });

    codesPerClient[client_id] = {
        code,
    }

    console.log("redirecting to", `${redirect_uri}?${params}`);
    res.redirect(`${redirect_uri}?${params}`);
});

app.post("/token", (req, res) => {
    const {client_id, code} = req.body;

    if(!client_id) {
        return res.status(400).send("client_id is missing")
    }

    if (!code) {
        return res.status(400).send("code is missing")
    }

    const userCode = codesPerClient[client_id]; 
    if (userCode?.code != code) {
        console.log(userCode, code)
        return res.status(400).json("invalid code")
    }

    res.status(200).json({
        access_token: crypto.randomUUID(),
        // simplify flow, send email for showcase purposes
        email: "someUserEmail@gmail.com",
    })
})

app.listen(3001, () => console.log("app listening on port 3001"));
