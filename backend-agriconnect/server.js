const express = require("express");
const cors = require("cors");
require("dotenv").config();


const authRoutes = require("./routes/auth");
const produitRoutes = require("./routes/produits");
const commandeRoutes = require("./routes/commandes");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/produits", produitRoutes);
app.use("/commandes", commandeRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
