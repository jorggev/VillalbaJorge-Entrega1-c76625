import Cart from "../models/cart.model.js";

export default class CartDAO {
    async getAll() {
        return await Cart.find().populate("products.product");
    }

    async getById(id) {
        return await Cart.findById(id).populate("products.product");
    }

    async create() {
        return await Cart.create({ products: [] });
    }

    async update(id, cart) {
        return await Cart.findByIdAndUpdate(id, cart, { new: true }).populate("products.product");
    }

    async delete(id) {
        return await Cart.findByIdAndDelete(id);
    }
}
