const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 8,
    fields: 4,
    parts: 20,
  },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      const error = new Error("Upload PDF, JPEG, or PNG documents only.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

const hasValidSignature = (file) => {
  const bytes = file.buffer;
  if (file.mimetype === "application/pdf") return bytes.subarray(0, 5).toString() === "%PDF-";
  if (file.mimetype === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return false;
};

const uploadKycDocuments = (req, res, next) => {
  upload.array("documents", 8)(req, res, (error) => {
    if (error) {
      const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
      return res.status(status).json({ success: false, message: error.message || "Document upload failed." });
    }
    if ((req.files || []).some((file) => !hasValidSignature(file))) {
      return res.status(400).json({ success: false, message: "One or more files do not match their stated format." });
    }
    next();
  });
};

module.exports = { uploadKycDocuments, MAX_FILE_SIZE };
