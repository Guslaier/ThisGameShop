import q from '../databace/db.js'

class Providers {
  async login(email, password) {
    const query = `
      SELECT * 
      FROM users 
      WHERE email = $1 
        AND password_hash = crypt($2, password_hash)
    `;
    const rows = await q.QQuery(query, [email, password]);
    return rows;
  }

  async register(email, password, display_name) {
    const query = `
      INSERT INTO users (email, password_hash, display_name) 
      VALUES ($1, crypt($2, gen_salt('bf')), $3) 
      RETURNING *
    `;
    const rows = await q.QQuery(query, [email, password, display_name]);
    console.log(rows);
    return rows;
  }

  async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const rows = await q.QQuery(query, [id]);
    return rows;
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const rows = await q.QQuery(query, [email]);
    return rows;
  } 

  async updateUser(id, display_name) {
    const query = `
      UPDATE users 
      SET display_name = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3 
      RETURNING *
    `;
    const rows = await q.QQuery(query, [display_name, id]);
    return rows;
  }
  async updatePassword(id, newPassword) {
    const query = `
      UPDATE users 
      SET password_hash = crypt($1, gen_salt('bf')), 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const rows = await q.QQuery(query, [newPassword, id]);
    return rows;
  }

  async deleteUser(id) {
    const query = `DELETE FROM users WHERE id = $1`;
    const rows = await q.QQuery(query, [id]);
    return rows;
  } 
  
  async listUsers() {
    const query = `
      SELECT id, email, display_name, role, is_active, created_at, updated_at 
      FROM users
    `;
    const rows = await q.QQuery(query);
    return rows;
  }

  async setUserRole(id, role) {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const rows = await q.QQuery(query, [role, id]);
    return rows;
  }

  async setUserActiveStatus(id, is_active) {
    const query = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    const rows = await q.QQuery(query, [is_active, id]);
    return rows;
  } 
} 

export default Providers;
