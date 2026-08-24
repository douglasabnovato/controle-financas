const { Router } = require('express');
const { createProfile } = require('../controllers/profileController');

const router = Router();

router.post('/', createProfile);

module.exports = router;