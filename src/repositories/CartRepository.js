export default class CartRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async create() {
        return await this.dao.create();
    }

    async update(id, cart) {
        return await this.dao.update(id, cart);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }
}
