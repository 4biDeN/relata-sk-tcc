const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/, "http://api_app:3000"],
    credentials: true,
  })
);

app.use(cookieParser());

if ((process.env.STORAGE_DRIVER || "local") === "local") {
  const uploadDir =
    process.env.UPLOAD_DIR || path.join(__dirname, "../uploads");
  app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));
}

require("./services/swagger");
require("./routes")(app);

app.use("/v1/docs", express.static("./src/views"));
app.use("/docs/swagger.yaml", express.static("./src/docs/swagger.yaml"));

app.listen(port),
  () => {
    console.log(`Server running on port ${port}`);
  };
