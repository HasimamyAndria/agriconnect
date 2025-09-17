import pool from "../config/db.js";
import supabase from "../config/supabaseClient.js"; 
import { v4 as uuidv4 } from 'uuid';

// ➕ Ajouter un produit (producteur validé uniquement)
export const addProduit = async (req, res) => {
  try {
    const { nom, prix_unitaire, stock } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ message: "Veuillez télécharger une image pour le produit." });
    }

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

    // --- Logique d'upload d'image vers Supabase ---
    const fileName = `${uuidv4()}-${imageFile.originalname}`;
    const path = `${producteur.id}/${fileName}`;
    
    const { data, error: uploadError } = await supabase.storage
      .from('produits')
      .upload(path, imageFile.buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: imageFile.mimetype,
      });
    
    if (uploadError) {
      console.error("Erreur de téléchargement Supabase:", uploadError.message);
      return res.status(500).json({ message: "Échec du téléchargement de l'image." });
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('produits')
      .getPublicUrl(path);

    const imageUrl = publicUrlData.publicUrl;
      
    // Insérer le produit
    const result = await pool.query(
      "INSERT INTO Produit (producteur_id, nom, prix_unitaire, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [producteur.id, nom, prix_unitaire, stock, imageUrl]
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
      "SELECT id, nom, prix_unitaire, stock, image_url FROM Produit WHERE producteur_id = $1",
      [producteur.id]
    );

    console.log("Données envoyées au client:", result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error("Erreur getProduits:", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
