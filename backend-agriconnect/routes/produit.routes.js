import express from "express";
import { addProduit, getProduits } from "../controllers/produit.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkProducteurValide from "../middleware/checkProducteurValide.js";

const router = express.Router();

// Ajout de produit → seulement Producteur validé
router.post("/", authMiddleware(["Producteur"]), checkProducteurValide, addProduit);

// Liste des produits d’un producteur → seulement Producteur validé
router.get("/", authMiddleware(["Producteur"]), checkProducteurValide, getProduits);

export default router;
