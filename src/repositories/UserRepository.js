import UserDTO from "../dto/UserDTO.js";

export default class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getByEmail(email) {
        return await this.dao.getByEmail(email);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async create(user) {
        return await this.dao.create(user);
    }

    async update(id, user) {
        return await this.dao.update(id, user);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }

    getUserDTO(user) {
        return new UserDTO(user);
    }
}
