import User from "../models/user.model.js";

export default class UserDAO {
    async getAll() {
        return await User.find();
    }

    async getByEmail(email) {
        return await User.findOne({ email });
    }

    async getById(id) {
        return await User.findById(id);
    }

    async create(user) {
        return await User.create(user);
    }

    async update(id, user) {
        return await User.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }
}
