// const express = require("express-session");
const bodyParser = require("body-parser");
// const app = express();

const express = require("express");
var cors = require("cors");
var session = require("express-session");
const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use(cors());

app.use(
  session({
    secret: "habit chain 365",
    resave: true,
    saveUninitialized: true,
  })
);

var sliderCaptcha = require("@slider-captcha/core");

app.get("/riseAndShine/captcha/create", async (req, res) => {
  console.log("create captcha");
  sliderCaptcha
    .create()
    .then(({ data, solution }) => {
      req.session.captcha = solution;
      // console.log("solution", solution);
      req.session.save();
      res.status(200).send(data);
    })
    .catch((error) => {
      res.status(500).json();
      console.log(error);
    });
});

app.post("/riseAndShine/captcha/verify", async (req, res) => {
  sliderCaptcha
    .verify(req.session.captcha, req.body, { tolerance: 100 })
    .then((verification) => {
      // console.log("verification", verification);
      // console.log("my value", req.session.captcha);
      if (verification.result === "success") {
        req.session.token = verification.token;
        req.session.save();
      }
      res.status(200).send(verification);
    })
    .catch((error) => {
      res.status(500).json();
      console.log(error);
    });
});

var port = process.env.PORT || 8000;
app.listen(port, () => console.log("Server listening at port:", port));
