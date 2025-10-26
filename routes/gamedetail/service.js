import db from "../databace/db.js";

export default class GameDetailService {
  async getGameById(id) {
    const result = await db.QQuery(
      `SELECT 
         g.id, 
         g.title, 
         g.description_md, 
         g.release_date,
         g.stock_managed, 
         g.platform_flags, 
         g.image_poster,
         p.amount_cents AS price_cents
       FROM games g
       LEFT JOIN prices p ON g.id = p.game_id AND p.is_active = TRUE
       WHERE g.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getGalleryByGameId(id) {
    const result = await db.QQuery(
      `SELECT scr AS image_url 
       FROM game_img 
       WHERE game_id = $1`,
      [id]
    );
    return result.rows;
  }
}
