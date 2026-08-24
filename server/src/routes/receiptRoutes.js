const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Importando o controller correto que está na sua árvore de pastas
const receiptController = require('../controllers/receiptController');

// Rotas de consulta e dashboard (Devem vir ANTES da rota /:id)
router.get('/dashboard/summary', receiptController.getDashboardSummary);
router.get('/', receiptController.getReceiptsByProfile);
router.get('/:id', receiptController.getReceiptDetails);

// Rota de processamento via IA
router.post('/process', upload.single('receipt_image'), receiptController.uploadAndProcessReceipt);

module.exports = router;