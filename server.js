const express = require("express");
const connectDB = require("./config/db");
const app = express();

// connect databases
connectDB();

// Init Middleware

app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello from aws");
});

// Define Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 80;

app.listen(PORT, () => console.log(`Server Started at port ${PORT}`));
