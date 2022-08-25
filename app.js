require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();
const User = require("./loginschema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_CONNECTION, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => console.log(err));

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

app.post("/login", async (req, res) => {
  bcrypt.hash(req?.body?.password, 10, (err, hashedPass) => {
    if (err) {
      res.json({
        error: err,
      });
    }

    let user = new User({
      email: req?.body?.email,
      password: hashedPass,
    });

    user
      .save()
      .then((user) =>
        res.json({
          message: "User Added Successfully",
        })
      )
      .catch((err) =>
        res.json({
          message: "An error occured",
        })
      );
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
