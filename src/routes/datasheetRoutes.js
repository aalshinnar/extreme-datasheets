const express = require('express');
const multer = require('multer');
const datasheetController = require('../controllers/datasheetController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800,
  },
});

router.get('/search', datasheetController.search);
router.get('/stats', datasheetController.getStats);
router.get('/:id', datasheetController.getById);
router.get('/:id/download', authMiddleware, datasheetController.download);

router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), datasheetController.upload);
router.put('/:id', authMiddleware, adminMiddleware, datasheetController.update);
router.delete('/:id', authMiddleware, adminMiddleware, datasheetController.delete);

module.exports = router;
