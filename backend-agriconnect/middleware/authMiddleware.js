import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.get("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({ message: "Token manquant" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Si on attend certains rôles
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Rôle non autorisé" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token invalide ou expiré" });
    }
  };
};

export default authMiddleware;
