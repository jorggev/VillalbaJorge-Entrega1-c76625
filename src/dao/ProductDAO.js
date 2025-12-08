import Product from "../models/product.model.js";

export default class ProductDAO {
    async getAll(query, options) {
        return await Product.paginate(query, options);
    }

    async getById(id) {
        return await Product.findById(id);
    }

    async create(product) {
        return await Product.create(product);
    }

    async update(id, product) {
        return await Product.findByIdAndUpdate(id, product, { new: true });
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }
}
