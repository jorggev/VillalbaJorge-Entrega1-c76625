import express from "express";
import { productService } from "../services/index.js";
import { authorization } from "../middleware/authorization.js";
import passport from "passport";

const productsRouter = express.Router();

// Obtener todos los productos con paginación
productsRouter.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: Number(limit),
            page: Number(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
            lean: true
        };
        
        const filter = query ? { category: query } : {}; 

        const data = await productService.getAll(filter, options);

        res.status(200).json({ status: "success", payload: data.docs, ...data, docs: undefined });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al recuperar los productos" });
    }
});

// Obtener un producto por su ID
productsRouter.get("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;

        const product = await productService.getById(pid);
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al recuperar los productos" });
    }
})

// Agregar un nuevo producto (Solo Admin)
productsRouter.post("/", passport.authenticate("jwt", { session: false }), authorization("admin"), async (req, res) => {
    try {
        const { title, description, image, price, stock, category } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ status: "error", message: "title y price son requeridos" });
        }

        const productData = {
            title,
            description: description || "",
            thumbnail: image || "",
            price: Number(price),
            stock: Number(stock) || 0,
            category: category || ""
        };

        const product = await productService.create(productData);
        res.status(201).json({ status: "success", payload: product });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al agregar un producto" });
    }
});

// Actualizar un producto existente (Solo Admin)
productsRouter.put("/:pid", passport.authenticate("jwt", { session: false }), authorization("admin"), async (req, res) => {
    try {
        const pid = req.params.pid;
        const updates = req.body;

        const updatedProduct = await productService.update(pid, updates);
        if (!updatedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: updatedProduct })
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar un producto" });
    }
});

// Eliminar un producto (Solo Admin)
productsRouter.delete("/:pid", passport.authenticate("jwt", { session: false }), authorization("admin"), async (req, res) => {
    try {
        const pid = req.params.pid;

        const deletedProduct = await productService.delete(pid);
        if (!deletedProduct) return res.status(404).json({ status: "error", message: "Producto no encontrado" });

        res.status(200).json({ status: "success", payload: deletedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar un producto" });
    }
});

export default productsRouter;