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


app.listen(3000, () => console.log("express server on port 3000"))