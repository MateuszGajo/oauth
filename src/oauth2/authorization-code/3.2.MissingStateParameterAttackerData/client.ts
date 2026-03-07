import express from 'express'
import bodyParser from 'body-parser'
import path from 'path';
import crypto from 'crypto';
import session from 'express-session';
import 'dotenv/config'

const clientSecret = process.env.clientSecret;
const clientId = process.env.clientId;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}))

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/homepage.html"));
});

app.get("/showcase", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer.html"));
});


// starts OAuth flow — generates state, stores in session
app.get("/login", (req, res) => {
    const state = crypto.randomUUID();
    (req.session as any).oauthState = state;
    console.log(`🔑 generated state: ${state}`);

    res.redirect(
        `http://oauthserver:3001/oauth/authorize?client_id=${clientId}&redirect_uri=http://oauthclient:3000/callback&response_mode=query&state=${state}`
    );
});

// auth server redirects here with ?code=&state=
app.get("/callback", (req, res) => {
    const { code, state } = req.query;
    const savedState = ((req) as any).session.oauthState;

    console.log(`📥 /callback hit`);
    console.log(`   code:        ${code}`);
    console.log(`   state:       ${state}`);
    console.log(`   savedState:  ${savedState}`);

    // CSRF check — comment this block out to show the vulnerable version
    // if (!state || state !== savedState) {
    //     console.log(`❌ state mismatch — possible CSRF attack!`);
    //     return res.status(403).sendFile(path.join(process.cwd(), "./pages/csrfDetected.html"));
    // }

    console.log(`✅ state valid — exchanging code for token`);
    (req.session as any).oauthState = null; // consume state

    // TODO: exchange code for token here
    res.sendFile(path.join(process.cwd(), "./pages/redirectPage.html"));
});

app.options("/code", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(204)
})

app.post("/code", async (req, res) => {
    const body = req.body;
    console.log({
        client_id: clientId,
        client_secret: clientSecret,
        code: body.code,
    })
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("ok").status(200);
})

const registerClient = async () => {
    try {
        const res = await fetch("http://oauthserver:3001/client/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientId: clientId,
                redirectUrl: 'http://oauthclient'
            })
        })
        if (!res.ok) {
            const body = await res.text();
            console.error(`Registration failed: ${res.status}`, body);
        }
    } catch (err) {
        console.log(err)
    }
}

registerClient()

app.listen(3000, () => console.log("express server on port 3000"))
