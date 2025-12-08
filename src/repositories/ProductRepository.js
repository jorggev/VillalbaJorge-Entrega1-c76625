export default class ProductRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getAll(query, options) {
        return await this.dao.getAll(query, options);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async create(product) {
        return await this.dao.create(product);
    }

    async update(id, product) {
        return await this.dao.update(id, product);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }
}
