import CartService from "./service.js";
const service = new CartService();

export const CartController = {
  async getUserCart(req, res) {
    const user = req.session.user;
    if (!user) return res.status(401).json({ status: false, message: "Not logged in" });
    const result = await service.getCart(user.id);
    res.json({ status: true, data: result.rows });
  },

  async addItem(req, res) {
    const user = req.session.user;
    const { game_id, quantity } = req.body;
    if (!game_id) return res.status(400).json({ status: false, message: "Missing game_id" });
    const q = quantity > 0 ? quantity : 1;
    const result = await service.addToCart(user.id, game_id, q);
    res.json({ status: true, data: result.rows[0] });
  },

  async removeItem(req, res) {
    const user = req.session.user;
    const { game_id } = req.body;
    const result = await service.removeFromCart(user.id, game_id);
    if (result.rowCount === 0) {
    return { status: false, message: "Item not found in cart" };
  }
    res.json({ status: true, data: result.rows });
  },

  async updateItem(req, res) {
    const user = req.session.user;
    const { game_id, quantity } = req.body;
    const result = await service.updateCartItem(user.id, game_id, quantity);
    res.json({ status: true, data: result.rows });
  },
};
