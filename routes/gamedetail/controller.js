// 📁 /routes/gamedetail/controller.js
import GameDetailService from "./service.js";

const service = new GameDetailService();

export const GameDetailController = {
  async showGameDetail(req, res) {
    try {
      // 1️⃣ Get game ID from URL
      const { id } = req.params;

      // 2️⃣ Fetch game data + gallery data
      const [game, gallery] = await Promise.all([
        service.getGameById(id),
        service.getGalleryByGameId(id)
      ]);

      // 3️⃣ Handle not found
      if (!game) {
        return res.status(404).render("error", { 
          message: "Game not found", 
          activePage: "gamedetail" 
        });
      }

      // 4️⃣ Render game detail page
      res.render("gamedetail", {
        title: game.title || "Game Detail",
        game,
        gallery,
        activePage: "gamedetail"
      });
    } catch (err) {
      console.error("❌ Error in GameDetailController:", err);
      res.status(500).render("error", { 
        message: "Internal Server Error", 
        activePage: "gamedetail" 
      });
    }
  }
};
