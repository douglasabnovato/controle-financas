/* Repositórios PostgreSQL: usuários, perfis e cupons (consultas parametrizadas) */

/* Converte DECIMAL (string no driver pg) para número */
const num = (v) => (v == null ? null : Number(v));

/* Código sequencial legível do cupom (C001, C002, ...) derivado do id */
const code = (id) => `C${String(id).padStart(3, "0")}`;

/* Normaliza a linha de cupom para a API */
function toReceipt(r) {
  return {
    id: r.id,
    code: code(r.id),
    store_name: r.store_name,
    cnpj: r.cnpj,
    purchase_date: r.purchase_date,
    total_amount: num(r.total_amount),
    document_type: r.document_type,
    created_at: r.created_at,
  };
}

/* Cria os repositórios sobre um pg.Pool */
function createRepositories(pool) {
  return {
    users: {
      async create(u) {
        const { rows } = await pool.query(
          `INSERT INTO users (full_name, email, nickname, whatsapp) VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
           RETURNING id, full_name, email, nickname, created_at`,
          [u.full_name, u.email, u.nickname, u.whatsapp]
        );
        return rows[0];
      },
      async findWithProfiles(id) {
        const user = await pool.query("SELECT id, full_name, email, nickname, created_at FROM users WHERE id = $1", [id]);
        if (!user.rows[0]) return null;
        const profiles = await pool.query("SELECT id, profile_name, created_at FROM profiles WHERE user_id = $1 ORDER BY created_at", [id]);
        return { user: user.rows[0], profiles: profiles.rows };
      },
    },
    profiles: {
      async create(p) {
        const { rows } = await pool.query(
          "INSERT INTO profiles (user_id, profile_name) VALUES ($1, $2) RETURNING id, user_id, profile_name, created_at",
          [p.user_id, p.profile_name]
        );
        return rows[0];
      },
      async exists(id) {
        const { rowCount } = await pool.query("SELECT 1 FROM profiles WHERE id = $1", [id]);
        return rowCount === 1;
      },
    },
    receipts: {
      /* Grava cupom e itens numa transação; devolve null se for duplicado */
      async create(profileId, data) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const inserted = await client.query(
            `INSERT INTO receipts (profile_id, store_name, cnpj, purchase_date, total_amount, document_type, raw_transcription)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING RETURNING *`,
            [profileId, data.store_name, data.cnpj, data.purchase_date, data.total_amount, data.document_type, JSON.stringify(data)]
          );
          if (!inserted.rows[0]) {
            await client.query("ROLLBACK");
            return null;
          }
          const receipt = inserted.rows[0];
          for (const p of data.products) {
            await client.query(
              "INSERT INTO products (receipt_id, product_name, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5)",
              [receipt.id, p.product_name, p.quantity, p.unit_price, p.total_price]
            );
          }
          await client.query("COMMIT");
          return toReceipt(receipt);
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      },
      async listByProfile(profileId) {
        const { rows } = await pool.query(
          "SELECT * FROM receipts WHERE profile_id = $1 ORDER BY purchase_date DESC, id DESC LIMIT 500",
          [profileId]
        );
        return rows.map(toReceipt);
      },
      /* Detalhe só quando o cupom pertence ao perfil informado (evita IDOR) */
      async findInProfile(id, profileId) {
        const receipt = await pool.query("SELECT * FROM receipts WHERE id = $1 AND profile_id = $2", [id, profileId]);
        if (!receipt.rows[0]) return null;
        const products = await pool.query(
          "SELECT id, product_name, quantity, unit_price, total_price FROM products WHERE receipt_id = $1 ORDER BY product_name",
          [id]
        );
        return {
          receipt: toReceipt(receipt.rows[0]),
          products: products.rows.map((p) => ({ ...p, quantity: num(p.quantity), unit_price: num(p.unit_price), total_price: num(p.total_price) })),
        };
      },
      async summary(profileId) {
        const totals = await pool.query(
          `SELECT count(id)::int AS total_receipts, coalesce(sum(total_amount), 0) AS total_spent,
                  coalesce(avg(total_amount), 0) AS average_ticket
           FROM receipts WHERE profile_id = $1`,
          [profileId]
        );
        const stores = await pool.query(
          `SELECT store_name, count(id)::int AS visit_count, sum(total_amount) AS spent_at_store
           FROM receipts WHERE profile_id = $1 GROUP BY store_name ORDER BY spent_at_store DESC LIMIT 10`,
          [profileId]
        );
        const t = totals.rows[0];
        return {
          summary: { total_receipts: t.total_receipts, total_spent: num(t.total_spent), average_ticket: Math.round(num(t.average_ticket) * 100) / 100 },
          top_stores: stores.rows.map((s) => ({ ...s, spent_at_store: num(s.spent_at_store) })),
        };
      },
    },
  };
}

module.exports = { createRepositories, code };
/* Fim de repositories/index.js */
