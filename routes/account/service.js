// 📁 /routes/account/service.js
import q from '../databace/db.js'

class Providers {
  async login(email, password) {
    return await q.QQuery(
      `SELECT * FROM users WHERE email=$1 AND password_hash=crypt($2,password_hash)`,
      [email, password]
    );
  }

  async register(email, password, display_name) {
    return await q.QQuery(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, crypt($2, gen_salt('bf')), $3) RETURNING *`,
      [email, password, display_name]
    );
  }

  async getUserById(id) {
    return await q.QQuery(`SELECT * FROM users WHERE id=$1 AND deleted_at IS NULL`, [id]);
  }

  async getUserByEmail(email) {
    return await q.QQuery(`SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL`, [email]);
  }

  async updateUser(id, display_name) {
    return await q.QQuery(
      `UPDATE users SET display_name=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [display_name, id]
    );
  }

  async updatePassword(id, password) {
    return await q.QQuery(
      `UPDATE users SET password_hash=crypt($1, gen_salt('bf')), updated_at=NOW() WHERE id=$2 RETURNING *`,
      [password, id]
    );
  }

  async deleteUser(id) {
    return await q.QQuery(`DELETE FROM users WHERE id=$1 RETURNING *`, [id]);
  }

  async ReUser(id) {
    return await q.QQuery(
      `UPDATE users SET is_active=true, deleted_at=NULL WHERE id=$1 RETURNING *`,
      [id]
    );
  }

  async listUsers() {
    return await q.QQuery(
      `SELECT id, email, display_name, role, is_active, created_at, updated_at
       FROM users WHERE deleted_at IS NULL`
    );
  }

  async setUserRole(id, role) {
    return await q.QQuery(
      `UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [role, id]
    );
  }

  async setUserActiveStatus(id, is_active) {
    return await q.QQuery(
      `UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [is_active, id]
    );
  }

    async updateProfileImage(id, imgPath) {
    const result = await db.QQuery(
      `UPDATE users 
       SET profile_image = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING profile_image;`,
      [imgPath, id]
    );
    return result;
  }

  /** ✅ ดึงรูปโปรไฟล์ตาม id */
  async getProfileImage(id) {
    const result = await db.QQuery(
      `SELECT profile_image FROM users WHERE id = $1;`,
      [id]
    );
    return result;
  }
}

export default Providers;
