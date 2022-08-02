require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

const findMovieTrailer = async (videoName) => {
  const yts = require("yt-search");
  const r = await yts(`${videoName} trailer`);

  const videos = r.videos.slice(0, 1);

  return videos[0].url;
};

app.post("/movies", async (req, res) => {
  res.json({
    urlLink: await findMovieTrailer(req.body.movie),
  });
});

app.listen(PORT, () => {
  console.log(`server started on PORT: ${process.env.PORT}`);
});
