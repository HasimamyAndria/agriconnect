const express = require("express");
const pool = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Liste des utilisateurs (Admin seulement)
router.get("/users", verifyToken, authorizeRoles("Admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nom, prenom, email, role FROM Utilisateur");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
