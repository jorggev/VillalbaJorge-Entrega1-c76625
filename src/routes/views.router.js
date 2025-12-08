import express from "express";
import { productService } from "../services/index.js";
import passport from "passport";

const viewsRouter = express.Router();

// Ruta para la vista de productos
viewsRouter.get("/", async (req, res) => {
  try {
    console.log("TRACE: home handler start");
    const { limit = 10, page = 1 } = req.query;

    console.log("TRACE: calling productService.getAll", { limit, page });
    const options = { limit: Number(limit), page: Number(page), lean: true };
    const data = await productService.getAll({}, options);
    console.log("TRACE: productService.getAll returned");

    const products = data.docs || [];
    delete data.docs;

    const links = [];
    for (let i = 1; i <= (data.totalPages || 1); i++) {
      links.push({ text: i, link: `/?limit=${limit}&page=${i}` });
    }

    console.log("TRACE: rendering home view");
    res.render("home", { products, links });
    console.log("TRACE: render called");
  } catch (error) {
    console.error("Error rendering home view:", error);
    res.status(500).send("Error interno al renderizar home");
  }
});

// Vista realtime
viewsRouter.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

// Vista detalle de producto
viewsRouter.get("/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productService.getById(pid);
    if (!product) return res.status(404).send("Producto no encontrado");

    // Mongoose returns a document, but handlebars needs a plain object if not using lean() query
    // Since getById might not use lean(), we convert to object if possible
    const productObj = product.toObject ? product.toObject() : product;

    res.render("productDetails", { product: productObj });
  } catch (error) {
    console.error("Error product details:", error);
    res.status(500).send("Error interno");
  }
});

// Login (form)
viewsRouter.get("/login", (req, res) => {
  res.render("login");
});

// Profile
viewsRouter.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.render("profile", { user: req.user });
  }
);

// Añadir ruta GET /register para renderizar la vista de registro
viewsRouter.get("/register", (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.error("Error rendering register view:", error);
    res.status(500).send("Error interno");
  }
});

viewsRouter.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});

viewsRouter.get("/reset-password", (req, res) => {
  res.render("resetPassword");
});

export default viewsRouter;
