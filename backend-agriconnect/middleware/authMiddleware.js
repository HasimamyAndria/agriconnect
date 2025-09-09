const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: " Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, user) => {
    if (err) return res.status(403).json({ message: " Token invalide" });
    req.user = user;
    next();
  });
}

module.exports = verifyToken;
