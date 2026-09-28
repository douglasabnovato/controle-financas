/* Esquemas zod: entrada da API e saída da IA (nunca confiar no JSON do modelo sem validar) */
const { z } = require("zod");

const money = z.coerce.number().finite().nonnegative().max(1_000_000).transform((n) => Math.round(n * 100) / 100);

const userInput = z.object({
  full_name: z.string().trim().min(3).max(255),
  email: z.string().trim().toLowerCase().email().max(255),
  nickname: z.string().trim().min(2).max(100),
  whatsapp: z.string().transform((s) => s.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
});

const profileInput = z.object({
  user_id: z.string().uuid(),
  profile_name: z.string().trim().min(2).max(100),
});

const profileQuery = z.object({ profile_id: z.string().uuid() });

const extractedReceipt = z.object({
  store_name: z.string().trim().min(1).max(255),
  cnpj: z.string().trim().max(50).nullable().optional().transform((v) => (v ? v : null)),
  purchase_date: z.coerce.date(),
  total_amount: money,
  document_type: z.string().trim().min(1).max(50).catch("cupom_fiscal"),
  products: z
    .array(
      z.object({
        product_name: z.string().trim().min(1).max(255),
        quantity: z.coerce.number().positive().max(100000),
        unit_price: money,
        total_price: money,
      })
    )
    .max(300)
    .default([]),
});

module.exports = { userInput, profileInput, profileQuery, extractedReceipt };
/* Fim de schemas.js */
