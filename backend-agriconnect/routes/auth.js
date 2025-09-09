const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, contact, adresse } = req.body;
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    const result = await pool.query(
      "INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, role, contact, adresse) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, nom, prenom, email, role",
      [nom, prenom, email, hashedPassword, role, contact, adresse]
    );

    res.status(201).json({ message: " Utilisateur créé", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    const result = await pool.query("SELECT * FROM Utilisateur WHERE email = $1", [email]);

    if (result.rows.length === 0) return res.status(404).json({ message: " Utilisateur non trouvé" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) return res.status(401).json({ message: " Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "supersecret", { expiresIn: "1h" });

    res.json({ message: "✅ Connexion réussie", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
