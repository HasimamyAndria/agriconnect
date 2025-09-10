import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role } = req.body;

  try {
    // Vérifier si email déjà utilisé
    const userExists = await pool.query("SELECT * FROM Utilisateur WHERE email=$1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Création de l'utilisateur
    const newUser = await pool.query(
      "INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, role) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [nom, prenom, email, hashedPassword, role]
    );

    // Si Producteur → créer une ligne dans la table Producteur
    if (role === "Producteur") {
      await pool.query(
        "INSERT INTO Producteur (user_id, statut_validation) VALUES ($1, 'En attente')",
        [newUser.rows[0].id]
      );
    }

    res.status(201).json({ message: "Utilisateur créé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query("SELECT * FROM Utilisateur WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  // Ici on ne fait rien côté serveur, le frontend doit supprimer le token
  res.json({ message: "Déconnexion réussie (supprimer le token côté client)" });
};
