require("dotenv").config();
const express = require("express");
const callRoutes = require("./routes/callRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/calls", callRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
