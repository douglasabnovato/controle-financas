const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

// Inicializa o SDK utilizando a chave de ambiente GEMINI_API_KEY
const ai = new GoogleGenAI();

async function processReceiptImage(filePath, mimeType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString("base64");

    const prompt = `
      Analise este cupom fiscal ou recibo com extrema atenção aos detalhes. 
      Extraia as seguintes informações e retorne estritamente em formato JSON válido, sem blocos de código markdown adicionais se possível, estruturado exatamente assim:
      {
        "store_name": "Nome do Estabelecimento",
        "cnpj": "CNPJ do Estabelecimento ou null",
        "purchase_date": "Data da compra no formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ) ou data atual se não especificada",
        "total_amount": 0.00,
        "document_type": "cupom_fiscal ou recibo",
        "products": [
          {
            "product_name": "Nome do Produto",
            "quantity": 1.000,
            "unit_price": 0.00,
            "total_price": 0.00
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ],
    });

    const textResponse = response.text;
    const cleanJsonString = textResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("Erro no processamento da imagem pelo Gemini:", error);
    throw new Error(
      "Falha ao extrair dados do cupom via inteligência artificial.",
    );
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

module.exports = {
  processReceiptImage,
};
