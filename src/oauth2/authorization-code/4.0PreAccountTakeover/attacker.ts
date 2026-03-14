import express from "express";
import path from "path";

const app = express();

app.get("/", (req, res) => {
    console.log("hello are we here?")
    res.sendFile(path.join(process.cwd(), "./pages/attackerPage.html"));
});

app.get("/showcase", (req, res) => {
    res.sendFile(path.join(process.cwd(), "./pages/oauth_visualizer.html"));
});


const registerUser = async () => {
const response = await fetch("http://oauthclient:3000/register/username-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: "someUserEmail@gmail.com",
            password: "attackerPassword",
        })
    })

    if (response.status !== 200 ) {
        console.log("response, error", response)
    } else {
        console.log("user register sucessfully")
    }
}

registerUser();

app.listen(3003);
