require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());



app.post('/movies', (res, req) => {
    console.log(req.body)
})

app.listen(process.env.PORT, () => {
    console.log(`server started on PORT: ${process.env.PORT}`)
});
