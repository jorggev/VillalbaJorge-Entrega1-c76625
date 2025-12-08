import Ticket from "../models/ticket.model.js";

export default class TicketDAO {
    async create(ticket) {
        return await Ticket.create(ticket);
    }
}
