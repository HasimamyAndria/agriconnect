// routes/producteur.routes.js
import express from "express";
import { getProducteurs, validerProducteur, refuserProducteur } from "../controllers/producteur.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin seulement
router.get("/", authMiddleware(["Admin"]), getProducteurs);
router.put("/:id/valider", authMiddleware(["Admin"]), validerProducteur);
router.put("/:id/refuser", authMiddleware(["Admin"]), refuserProducteur);

export default router;
