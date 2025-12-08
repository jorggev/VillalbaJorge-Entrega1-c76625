import UserDAO from "../dao/UserDAO.js";
import ProductDAO from "../dao/ProductDAO.js";
import CartDAO from "../dao/CartDAO.js";
import TicketDAO from "../dao/TicketDAO.js";

import UserRepository from "../repositories/UserRepository.js";
import ProductRepository from "../repositories/ProductRepository.js";
import CartRepository from "../repositories/CartRepository.js";
import TicketRepository from "../repositories/TicketRepository.js";
import MailingService from "./MailingService.js";

export const userService = new UserRepository(new UserDAO());
export const productService = new ProductRepository(new ProductDAO());
export const cartService = new CartRepository(new CartDAO());
export const ticketService = new TicketRepository(new TicketDAO());
export const mailingService = new MailingService();
