// backend/middlewares/authMiddleware.js
const { admin } = require("../config/firebase");

const verificarAutenticado = async (req, res, next) => {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Acceso denegado. Regístrate o inicia sesión." });
  }

  const token = tokenHeader.split(" ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: "Token inválido o expirado." });
  }
};

const verificarAdmin = async (req, res, next) => {
  await verificarAutenticado(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ mensaje: "Acceso denegado. Se requieren permisos de administrador." });
    }
  });
};

module.exports = { verificarAutenticado, verificarAdmin };