const multer = require('multer');
const express = require("express");
const router = express.Router();
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/Img/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: req.file.path,
            success: true
        })
    } catch (error) {
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
})

const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/document/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const documentFilter = (req, file, cb) => {
    const allowedTypes = /docx|txt|pdf|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents are allowed'));
    }
};

const documentUpload = multer({
    storage: documentStorage,
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: documentFilter
});

router.post('/upload-document', documentUpload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.status(200).json({
            message: 'File uploaded successfully',
            filePath: req.file.path,
            success: true
        })
    } catch (error) {
        res.status(500).json({ message: 'File upload failed', error: error.message });
    }
})

module.exports = router;