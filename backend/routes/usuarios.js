// backend/routes/usuarios.js
const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase");
const { verificarAdmin } = require("../middlewares/authMiddleware");
const { db } = require("../config/firebase");

const verificarToken = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        mensaje: "Token requerido"
      });
    }

    const token = authHeader.split(" ")[1];

    const decodedToken =
      await admin.auth().verifyIdToken(token);

    req.user = decodedToken;

    next();

  } catch(error) {

    return res.status(401).json({
      mensaje: "Token inválido"
    });

  }

};

router.post("/:uid/sancionar", verificarAdmin, async (req, res) => {

  try {

    const { motivo, dias } = req.body;

    const fechaInicio = new Date();

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias);

    await db.collection("sanciones").add({
      uid: req.params.uid,
      motivo,
      fechaInicio,
      fechaFin,
      activa: true
    });

    res.json({
      mensaje: "Sanción creada correctamente"
    });

  } catch(error) {

    res.status(500).json({
      mensaje: error.message
    });

  }

});

router.get(
  "/verificar-sancion",
  verificarToken,
  async (req, res) => {

    try {

      const snapshot = await db
        .collection("sanciones")
        .where("uid", "==", req.user.uid)
        .where("activa", "==", true)
        .get();

      if (snapshot.empty) {
        return res.json({
          suspendido: false
        });
      }

      const sancion = snapshot.docs[0].data();

      const ahora = new Date();

      if (sancion.fechaFin.toDate() > ahora) {

        return res.json({
          suspendido: true,
          motivo: sancion.motivo,
          fechaFin: sancion.fechaFin.toDate()
        });

      }

      res.json({
        suspendido: false
      });

    } catch(error) {

      res.status(500).json({
        mensaje: error.message
      });

    }

});


router.get("/", verificarAdmin, async (req, res) => {
  try {
    const result = await admin.auth().listUsers();

    const usuarios = result.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      disabled: user.disabled,
      claims: user.customClaims || {}
    }));

    res.json(usuarios);

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al listar usuarios",
      error: error.message
    });
  }
});

// ELIMINAR USUARIO (Lógica que ya tenías)
router.delete("/:uid", verificarAdmin, async (req, res) => {
  try {
    await admin.auth().deleteUser(req.params.uid);
    res.json({ mensaje: "Usuario eliminado de Firebase correctamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar usuario.", error: error.message });
  }
});

router.put("/:uid/deshabilitar", verificarAdmin, async (req, res) => {
  try {

    await admin.auth().updateUser(req.params.uid, {
      disabled: true
    });

    res.json({
      mensaje: "Usuario suspendido correctamente"
    });

  } catch(error) {

    res.status(500).json({
      mensaje: error.message
    });

  }
});

router.put("/:uid/habilitar", verificarAdmin, async (req, res) => {

  try {

    await admin.auth().updateUser(req.params.uid, {
      disabled: false
    });

    res.json({
      mensaje: "Usuario habilitado"
    });

  } catch(error) {

    res.status(500).json({
      mensaje: error.message
    });

  }

}); 

// ASIGNAR ROL DE ADMIN
// router.post("/crear-primer-admin", async (req, res) => {
//   const { uid } = req.body;
//   if (!uid) {
//     return res.status(400).json({ mensaje: "Falta el UID del usuario" });
//   }

//   try {
//     await admin.auth().setCustomUserClaims(uid, { admin: true });
//     res.json({ mensaje: `Éxito. El usuario con UID ${uid} ahora es ADMINISTRADOR.` });
//   } catch (error) {
//     res.status(500).json({ mensaje: "Error al asignar rol de administrador.", error: error.message });
//   }
// });

module.exports = router;