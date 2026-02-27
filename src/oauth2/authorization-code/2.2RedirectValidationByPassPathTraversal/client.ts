import express from 'express'
import bodyParser from 'body-parser'
import path from 'path';
import 'dotenv/config'

const clientSecret = process.env.clientSecret;
const clientId = process.env.clientId;


const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/homepage.html"));
});

app.get("/redirect", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/redirectPage.html"));
});

app.get("/attacker", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/attackerPage.html"));
});

app.get("/showcase", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer.html"));
});



app.options("/code", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); 

    res.sendStatus(204)
})


app.post("/code", async(req, res) => {
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
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            clientId: clientId,
            redirectUrl: 'http://oauthclient'
        })
    })
     if (!res.ok) {
        const body = await res.text();
        console.error(`Registration failed: ${res.status}`, body);
    }
} catch(err) {
    console.log(err)
}
}

registerClient()



app.listen(3000, () => console.log("express server on port 3000"))