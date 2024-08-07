const createRequest = require("./index").createRequest;

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
// const createProxyMiddleware = require("http-proxy-middleware").createProxyMiddleware;
const app = express();
const port = process.env.EA_PORT || 8080;

app.use(bodyParser.json());
// app.use("/", createProxyMiddleware({ target: `http://127.0.0.1:7890` }));

app.post("/v1/api", (req, res) => {
    console.log("POST Data: ", req.body);
    createRequest(req.body, (status, result) => {
        console.log("Result: ", result);
        res.status(status).json(result);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
