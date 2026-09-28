/* Extração de cupom por IA multimodal (Google Gemini); a imagem só trafega em memória e não é gravada */
const { extractedReceipt } = require("../lib/schemas");
const { AppError } = require("../lib/errors");

const PROMPT = `Analise este cupom fiscal ou recibo brasileiro. Responda somente com JSON no formato:
{"store_name": string, "cnpj": string|null, "purchase_date": "YYYY-MM-DDTHH:mm:ss", "total_amount": number,
 "document_type": "cupom_fiscal"|"recibo", "products": [{"product_name": string, "quantity": number, "unit_price": number, "total_price": number}]}
Use ponto como separador decimal. Se não houver data legível, use null em purchase_date.`;

/* Remove cercas de código que alguns modelos devolvem */
function stripFences(text) {
  return String(text || "").replace(/```(?:json)?/gi, "").trim();
}

/* Cria o extrator; o cliente da IA é injetado para permitir testes sem rede */
function createGeminiExtractor({ client, model }) {
  return {
    /* Recebe o buffer da imagem e devolve o cupom validado */
    async extract(buffer, mimeType) {
      let text;
      try {
        const response = await client.models.generateContent({
          model,
          contents: [PROMPT, { inlineData: { data: buffer.toString("base64"), mimeType } }],
          config: { responseMimeType: "application/json", temperature: 0 },
        });
        text = response.text;
      } catch (err) {
        throw new AppError(502, "AI_UNAVAILABLE", "O serviço de leitura de cupons está indisponível. Tente novamente.", err.message);
      }
      return parseExtraction(text);
    },
  };
}

/* Converte e valida a resposta textual da IA */
function parseExtraction(text) {
  let json;
  try {
    json = JSON.parse(stripFences(text));
  } catch {
    throw new AppError(422, "AI_UNREADABLE", "Não foi possível ler este cupom. Envie uma foto mais nítida.");
  }
  if (json && json.purchase_date == null) json.purchase_date = new Date().toISOString();
  const result = extractedReceipt.safeParse(json);
  if (!result.success) {
    throw new AppError(422, "AI_INVALID", "O cupom foi lido, mas os dados vieram incompletos. Tente outra foto.", result.error.issues);
  }
  return result.data;
}

module.exports = { createGeminiExtractor, parseExtraction };
/* Fim de receiptExtractor.js */
