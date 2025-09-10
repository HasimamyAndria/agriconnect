// controllers/producteur.controller.js
import pool from "../config/db.js";

export const getProducteurs = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT p.id, u.nom, u.prenom, u.email, p.statut_validation FROM Producteur p JOIN Utilisateur u ON p.user_id = u.id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const validerProducteur = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE Producteur SET statut_validation = 'Validé' WHERE id = $1",
      [id]
    );
    res.json({ message: "Producteur validé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const refuserProducteur = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE Producteur SET statut_validation = 'Refusé' WHERE id = $1",
      [id]
    );
    res.json({ message: "Producteur refusé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
