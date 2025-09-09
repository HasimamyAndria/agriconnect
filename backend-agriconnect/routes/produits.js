const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Lister tous les produits
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Produit");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un produit (Producteur seulement)
router.post("/", verifyToken, authorizeRoles("Producteur"), async (req, res) => {
  try {
    const { nom, prix_unitaire, stock, image_url } = req.body;

    const producteur = await pool.query("SELECT id FROM Producteur WHERE user_id = $1", [req.user.id]);
    if (producteur.rows.length === 0) return res.status(403).json({ message: "❌ Vous devez être validé comme producteur" });

    const result = await pool.query(
      "INSERT INTO Produit (producteur_id, nom, prix_unitaire, stock, image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [producteur.rows[0].id, nom, prix_unitaire, stock, image_url]
    );

    res.status(201).json({ message: "✅ Produit ajouté", produit: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
