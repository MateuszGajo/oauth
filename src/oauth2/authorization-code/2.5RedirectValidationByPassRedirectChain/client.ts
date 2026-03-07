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


app.get("/code", (req, res) => {
    const {redirect_uri, ...rest} = req.query

       const params = new URLSearchParams({
        ...rest as any
    });
    console.log(req.query)
    console.log(`${redirect_uri}?${params}`)

    res.redirect(`${redirect_uri}?${params}`)
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
            redirectUrl: 'http://oauthclient:3000/callback'
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