import db from "../../databace/db.js";

export default class LibraryService {
  async grantLibraryFromOrder(order_id) {
    await db.QQuery(`
      INSERT INTO library_items (user_id, game_id, order_item_id, cd_key)
      SELECT o.user_id, oi.game_id, oi.id,
             md5(random()::text || clock_timestamp()::text)
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.id = $1
      ON CONFLICT DO NOTHING;
    `, [order_id]);
  }

  async getUserLibrary(user_id) {
    return await db.QQuery(`
      SELECT g.title, li.cd_key, li.acquired_at
      FROM library_items li
      JOIN games g ON li.game_id = g.id
      WHERE li.user_id=$1 AND li.deleted_at IS NULL;
    `, [user_id]);
  }

}
