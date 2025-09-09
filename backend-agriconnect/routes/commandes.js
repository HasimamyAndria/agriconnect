const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Créer une commande (Acheteur seulement)
router.post("/", verifyToken, authorizeRoles("Acheteur"), async (req, res) => {
  try {
    const { produits } = req.body; // [{ produit_id, quantite }]
    let montant_total = 0;

    for (let p of produits) {
      const prod = await pool.query("SELECT prix_unitaire FROM Produit WHERE id = $1", [p.produit_id]);
      if (prod.rows.length > 0) montant_total += prod.rows[0].prix_unitaire * p.quantite;
    }

    const commande = await pool.query(
      "INSERT INTO Commande (user_id, montant_total) VALUES ($1,$2) RETURNING *",
      [req.user.id, montant_total]
    );

    for (let p of produits) {
      const prod = await pool.query("SELECT prix_unitaire FROM Produit WHERE id = $1", [p.produit_id]);
      if (prod.rows.length > 0) {
        await pool.query(
          "INSERT INTO Commande_Produit (commande_id, produit_id, quantite, prix_unitaire) VALUES ($1,$2,$3,$4)",
          [commande.rows[0].id, p.produit_id, p.quantite, prod.rows[0].prix_unitaire]
        );
      }
    }

    res.status(201).json({ message: "✅ Commande créée", commande: commande.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
