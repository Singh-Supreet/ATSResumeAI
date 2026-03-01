const express = require('express');
const { uploadResume, getResume, getHistory, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/history', getHistory);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

module.exports = router;
