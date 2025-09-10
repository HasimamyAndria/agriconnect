import pool from "../config/db.js";

// ➕ Ajouter un produit (producteur validé uniquement)
export const addProduit = async (req, res) => {
  try {
    const { nom, prix_unitaire, stock } = req.body;

    // Vérifier que l’utilisateur est un producteur
    const producteurResult = await pool.query(
      "SELECT id, statut_validation FROM Producteur WHERE user_id = $1",
      [req.user.id]
    );

    if (producteurResult.rows.length === 0) {
      return res.status(403).json({ message: "Vous n’êtes pas enregistré comme producteur" });
    }

    const producteur = producteurResult.rows[0];

    if (producteur.statut_validation !== "Validé") {
      return res.status(403).json({ message: "Votre compte producteur n’est pas validé" });
    }

    // Insérer le produit
    const result = await pool.query(
      "INSERT INTO Produit (producteur_id, nom, prix_unitaire, stock) VALUES ($1, $2, $3, $4) RETURNING *",
      [producteur.id, nom, prix_unitaire, stock]
    );

    res.status(201).json({ message: "Produit ajouté avec succès", produit: result.rows[0] });
  } catch (error) {
    console.error("Erreur addProduit:", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📦 Lister les produits
export const getProduits = async (req, res) => {
  try {
    // Si l’utilisateur est admin → voir tous les produits
    if (req.user.role === "admin") {
      const result = await pool.query(
        `SELECT p.id, p.nom, p.prix_unitaire, p.stock, pr.nom AS producteur
         FROM Produit p
         JOIN Producteur pr ON p.producteur_id = pr.id`
      );
      return res.json(result.rows);
    }

    // Sinon, vérifier si l’utilisateur est un producteur
    const producteurResult = await pool.query(
      "SELECT id, statut_validation FROM Producteur WHERE user_id = $1",
      [req.user.id]
    );

    if (producteurResult.rows.length === 0) {
      return res.status(403).json({ message: "Accès interdit, vous n’êtes pas producteur" });
    }

    const producteur = producteurResult.rows[0];

    if (producteur.statut_validation !== "Validé") {
      return res.status(403).json({ message: "Votre compte producteur n’est pas validé" });
    }

    // Récupérer seulement ses produits
    const result = await pool.query(
      "SELECT id, nom, prix_unitaire, stock FROM Produit WHERE producteur_id = $1",
      [producteur.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getProduits:", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
