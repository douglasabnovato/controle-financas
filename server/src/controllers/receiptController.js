const db = require("../database/connection");
const { processReceiptImage } = require("../services/geminiService");

// 1. Processamento e salvamento via IA (Mantido exatamente como testado e aprovado)
async function uploadAndProcessReceipt(req, res) {
  const { profile_id } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nenhuma imagem de cupom enviada." });
  }

  if (!profile_id) {
    return res
      .status(400)
      .json({ error: "O ID do perfil (BU) é obrigatório." });
  }

  try {
    const extractedData = await processReceiptImage(file.path, file.mimetype);

    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      const receiptQuery = `
        INSERT INTO receipts (profile_id, store_name, cnpj, purchase_date, total_amount, document_type, raw_transcription)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const receiptValues = [
        profile_id,
        extractedData.store_name,
        extractedData.cnpj,
        extractedData.purchase_date,
        extractedData.total_amount,
        extractedData.document_type,
        JSON.stringify(extractedData),
      ];

      const receiptResult = await client.query(receiptQuery, receiptValues);
      const savedReceipt = receiptResult.rows[0];

      const savedProducts = [];
      if (extractedData.products && Array.isArray(extractedData.products)) {
        for (const prod of extractedData.products) {
          const productQuery = `
            INSERT INTO products (receipt_id, product_name, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
          `;
          const productValues = [
            savedReceipt.id,
            prod.product_name,
            prod.quantity,
            prod.unit_price,
            prod.total_price,
          ];
          const productResult = await client.query(productQuery, productValues);
          savedProducts.push(productResult.rows[0]);
        }
      }

      await client.query("COMMIT");
      client.release();

      return res.status(201).json({
        message: "Cupom processado e salvo com sucesso!",
        receipt: savedReceipt,
        products: savedProducts,
      });
    } catch (dbError) {
      await client.query("ROLLBACK");
      client.release();
      throw dbError;
    }
  } catch (error) {
    console.error("Erro ao processar cupom:", error);
    return res
      .status(500)
      .json({ error: error.message || "Erro interno ao processar o cupom." });
  }
}

// 2. Listagem de recibos por perfil/BU (GET /api/receipts?profile_id=...)
async function getReceiptsByProfile(req, res) {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({ error: "O parâmetro 'profile_id' é obrigatório na query string." });
    }

    const query = `
      SELECT * FROM receipts 
      WHERE profile_id = $1 
      ORDER BY purchase_date DESC
    `;
    const result = await db.query(query, [profile_id]);

    return res.status(200).json({
      total: result.rows.length,
      receipts: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar recibos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar recibos.' });
  }
}

// 3. Detalhamento completo de um recibo específico e seus produtos (GET /api/receipts/:id)
async function getReceiptDetails(req, res) {
  try {
    const { id } = req.params;

    const receiptQuery = `SELECT * FROM receipts WHERE id = $1`;
    const receiptResult = await db.query(receiptQuery, [id]);

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recibo não encontrado.' });
    }

    const productsQuery = `SELECT * FROM products WHERE receipt_id = $1`;
    const productsResult = await db.query(productsQuery, [id]);

    return res.status(200).json({
      receipt: receiptResult.rows[0],
      products: productsResult.rows
    });
  } catch (error) {
    console.error('Erro ao detalhar recibo:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar detalhes do recibo.' });
  }
}

// 4. Resumo financeiro e estatísticas para o dashboard (GET /api/dashboard/summary?profile_id=...)
async function getDashboardSummary(req, res) {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({ error: "O parâmetro 'profile_id' é obrigatório." });
    }

    const summaryQuery = `
      SELECT 
        COUNT(id) as total_receipts,
        COALESCE(SUM(total_amount), 0) as total_spent,
        COALESCE(AVG(total_amount), 0) as average_ticket
      FROM receipts 
      WHERE profile_id = $1
    `;
    
    const storesQuery = `
      SELECT 
        store_name, 
        COUNT(id) as visit_count, 
        SUM(total_amount) as spent_at_store
      FROM receipts 
      WHERE profile_id = $1
      GROUP BY store_name
      ORDER BY spent_at_store DESC
    `;

    const summaryResult = await db.query(summaryQuery, [profile_id]);
    const storesResult = await db.query(storesQuery, [profile_id]);

    return res.status(200).json({
      summary: summaryResult.rows[0],
      top_stores: storesResult.rows
    });
  } catch (error) {
    console.error('Erro ao gerar resumo do dashboard:', error);
    return res.status(500).json({ error: 'Erro interno ao gerar sumário financeiro.' });
  }
}

module.exports = {
  uploadAndProcessReceipt,
  getReceiptsByProfile,
  getReceiptDetails,
  getDashboardSummary,
};