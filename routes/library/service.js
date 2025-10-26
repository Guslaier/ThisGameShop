import db from "../databace/db.js";

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

   async getLibraryItemById(user_id, library_item_id) {
    return db.QQuery(`
      SELECT
        li.id,
        li.user_id,
        li.game_id,
        g.title,
        g.platform_flags,
        li.cd_key,
        li.acquired_at,
        li.order_item_id
      FROM library_items li
      JOIN games g ON g.id = li.game_id
      WHERE li.id = $1
        AND li.user_id = $2
        AND li.deleted_at IS NULL
      LIMIT 1;
    `, [library_item_id, user_id]);
  }

  async listUserLibrary(user_id) {
  return db.QQuery(`
    SELECT
      li.id,
      li.user_id,
      li.game_id,
      g.title,
      g.platform_flags,
      li.cd_key,
      li.acquired_at
    FROM library_items li
    JOIN games g ON g.id = li.game_id
    WHERE li.user_id = $1
      AND li.deleted_at IS NULL
    ORDER BY li.acquired_at DESC, li.id DESC;
  `, [user_id]);
}

}
