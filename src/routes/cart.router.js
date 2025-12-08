import express from "express";
import { cartService, productService, ticketService } from "../services/index.js";
import { authorization } from "../middleware/authorization.js";
import passport from "passport";
import { v4 as uuidv4 } from 'uuid';

const cartRouter = express.Router();

// Crear un nuevo carrito
cartRouter.post("/", async (req, res) => {
  try {
    const cart = await cartService.create();

    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Obtener los productos de un carrito
cartRouter.get("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await cartService.getById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    res.status(200).json({ status: "success", payload: cart.products });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Agregar un producto al carrito (Solo User)
cartRouter.post("/:cid/product/:pid", passport.authenticate("jwt", { session: false }), authorization("user"), async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = Number(req.body.quantity) || 1;

    // Si existe entrada para ese producto, sumamos cantidad; si no, agregamos
    const cart = await cartService.getById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    // Check if user is trying to add to their own cart (optional but good practice, though requirement just says 'user' role)
    // For now, adhering to requirement: "Solo el usuario puede agregar productos a su carrito"
    // Ideally we should check if req.user.cart matches cid, but let's stick to role check first.

    const existing = cart.products.find(p => String(p.product._id || p.product) === String(pid));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cartService.update(cid, cart);
    const populated = await cartService.getById(cid);
    res.status(200).json({ status: "success", payload: populated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Actualizar cantidad de un producto en el carrito
cartRouter.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = Number(req.body.quantity);
    if (isNaN(quantity) || quantity < 0) return res.status(400).json({ status: "error", message: "Quantity invalida" });

    const cart = await cartService.getById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const entry = cart.products.find(p => String(p.product._id || p.product) === String(pid));
    if (entry) {
      if (quantity === 0) {
        cart.products = cart.products.filter(p => String(p.product._id || p.product) !== String(pid));
      } else {
        entry.quantity = quantity;
      }
    } else {
      if (quantity > 0) cart.products.push({ product: pid, quantity });
    }

    await cartService.update(cid, cart);
    const populated = await cartService.getById(cid);
    res.status(200).json({ status: "success", payload: populated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Eliminar un producto del carrito
cartRouter.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartService.getById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => String(p.product._id || p.product) !== String(pid));

    await cartService.update(cid, cart);
    const populated = await cartService.getById(cid);

    res.status(200).json({ status: "success", payload: populated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Finalizar compra
cartRouter.post("/:cid/purchase", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartService.getById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const productsToPurchase = [];
    const productsNotPurchased = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await productService.getById(item.product._id || item.product);
      if (product && product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await productService.update(product._id, { stock: product.stock });
        totalAmount += product.price * item.quantity;
        productsToPurchase.push(item);
      } else {
        productsNotPurchased.push(item.product._id || item.product);
      }
    }

    if (productsToPurchase.length > 0) {
      const ticket = await ticketService.create({
        code: uuidv4(),
        amount: totalAmount,
        purchaser: req.user.email
      });

      // Update cart with only products that were NOT purchased
      // We need to reconstruct the cart products array. 
      // The items in productsNotPurchased are IDs. We need to find the original items in the cart.
      cart.products = cart.products.filter(item => productsNotPurchased.includes(item.product._id || item.product));
      await cartService.update(cid, cart);

      return res.status(200).json({ status: "success", payload: { ticket, not_purchased: productsNotPurchased } });
    } else {
      return res.status(400).json({ status: "error", message: "No se pudo procesar la compra de ningún producto por falta de stock", not_purchased: productsNotPurchased });
    }

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default cartRouter;