import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { userService, cartService, mailingService } from "../services/index.js";
import UserDTO from "../dto/UserDTO.js";
import User from "../models/user.model.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: "error", message: "Faltan campos requeridos" });
    }

    const exists = await userService.getByEmail(email);
    if (exists) return res.status(409).json({ status: "error", message: "Email ya registrado" });

    // crear carrito para el usuario
    const cart = await cartService.create();

    const hashed = User.createHash(password);
    const userData = {
      first_name,
      last_name,
      email,
      age: age || 0,
      password: hashed,
      cart: cart._id
    };

    const user = await userService.create(userData);
    const safe = new UserDTO(user);
    return res.status(201).json({ status: "success", payload: safe });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Login (modificado para callback y respuestas JSON claras)
router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, async (err, user, info) => {
    try {
      if (err) return res.status(500).json({ status: "error", message: err.message });
      if (!user) {
        const message = info?.message || "Credenciales inválidas";
        if (/(Usuario no existe)/i.test(message)) {
          return res.status(404).json({ status: "error", message });
        }
        return res.status(401).json({ status: "error", message });
      }

      const payload = { id: user._id, email: user.email, role: user.role, cart: user.cart };
      const token = jwt.sign(payload, process.env.JWT_SECRET || "CHANGE_ME_SECRET", {
        expiresIn: process.env.JWT_EXPIRES || "1h",
      });

      return res.json({ status: "success", token, payload });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  })(req, res, next);
});

// Ruta /current protegida por JWT
router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  const userDTO = new UserDTO(req.user);
  return res.json({ status: "success", payload: userDTO });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.getByEmail(email);
    if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });

    const token = jwt.sign({ email }, process.env.JWT_SECRET || "CHANGE_ME_SECRET", { expiresIn: "1h" });
    const resetLink = `http://localhost:${process.env.PORT || 8080}/reset-password?token=${token}`;

    await mailingService.sendSimpleMail({
      from: "Ecommerce <no-reply@ecommerce.com>",
      to: email,
      subject: "Restablecer contraseña",
      html: `
                <h1>Restablecer contraseña</h1>
                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <a href="${resetLink}">Restablecer contraseña</a>
                <p>Este enlace expira en 1 hora.</p>
            `
    });

    res.json({ status: "success", message: "Correo enviado" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "CHANGE_ME_SECRET");
    } catch (err) {
      return res.status(400).json({ status: "error", message: "Token inválido o expirado" });
    }

    const user = await userService.getByEmail(decoded.email);
    if (!user) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });

    if (User.isValidPassword(user, password)) {
      return res.status(400).json({ status: "error", message: "No puedes usar la misma contraseña" });
    }

    const hashedPassword = User.createHash(password);
    await userService.update(user._id, { password: hashedPassword });

    res.json({ status: "success", message: "Contraseña actualizada" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;