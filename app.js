require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();
const User = require("./loginschema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const passwordVal = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/
);
const saltRounds = 10;

const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => console.log(err));

const userData = mongoose.model("User");

const findMovieTrailer = async (videoName) => {
  const yts = require("yt-search");
  const r = await yts(`${videoName} trailer`);

  const videos = r.videos.slice(0, 1);

  return videos[0].url;
};

app.post("/movies", async (req, res) => {
  await axios
    .post(
      `https://api.themoviedb.org/3/movie/${
        req?.body?.movieType || "now_playing"
      }?api_key=${process.env.API_KEY}&language=en-US&page=${req?.body?.page}`
    )
    .then((response) => {
      res.send(response?.data);
    });
});

app.post("/signup", (req, res) => {
  const query = userData.where({ email: req?.body?.email });
  query.findOne((err, user) => {
    if (err) return console.log(err);
    if (!user) {
      if (req?.body?.password.match(passwordVal)) {
        bcrypt.hash(
          req?.body?.password,
          saltRounds,
          async function (err, hash) {
            await userData.create({
              email: req?.body?.email,
              password: hash,
            });
            res.send({ status: "Signup SuccessFul" });
            if (err) {
              console.log(err);
              res.send({ status: "Signup Failed" });
            }
          }
        );
      } else {
        res.send({ status: "password invalid" });
      }
    } else {
      res.send({ status: "User is already registered" });
    }
  });
});

app.post("/login", (req, res) => {
  const query = userData.where({ email: req?.body?.email });
  query.findOne((err, user) => {
    if (err) return console.log(err);
    const username = { name: req?.body?.email };
    if (user) {
      bcrypt.compare(
        req?.body?.password,
        user.password,
        async function (err, result) {
          if (result) {
            const accessToken = jwt.sign(
              username,
              process.env.ACCESS_TOKEN_SECRET
            );
            res.send({ status: result, accessToken: accessToken });
          } else {
            res.send({ status: result, message: "Invalid Password" });
          }
        }
      );
    } else {
      res.send({
        message: "User not registered! Please Sign Up",
      });
    }
  });
});

app.post("/movies/movie", async (req, res) => {
  res.json({
    urlLink: await findMovieTrailer(req?.body?.movie),
  });
});

app.listen(PORT, () => {
  console.log(`server started on PORT: ${process.env.PORT}`);
});
