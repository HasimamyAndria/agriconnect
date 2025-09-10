import pool from "../config/db.js";

const checkProducteurValide = async (req, res, next) => {
  try {
    if (req.user.role !== "Producteur") {
      return res.status(403).json({ message: "Accès réservé aux producteurs" });
    }

    const result = await pool.query(
      "SELECT statut_validation FROM Producteur WHERE user_id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Vous n’êtes pas enregistré comme producteur" });
    }

    const statut = result.rows[0].statut_validation;

    if (statut !== "Validé") {
      return res.status(403).json({ message: "Votre compte producteur n’est pas encore validé par l’admin" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export default checkProducteurValide;
