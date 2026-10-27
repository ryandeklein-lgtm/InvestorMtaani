const multer = require("multer");

const MAX_MEDIA_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_SIZE, files: 1, fields: 2, parts: 4 },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      const error = new Error("Choose a JPEG, PNG, WebP, MP4, or WebM file.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

const hasValidSignature = (file) => {
  const bytes = file.buffer;
  if (file.mimetype === "image/png") {
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (file.mimetype === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (file.mimetype === "image/webp") {
    return bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  }
  if (file.mimetype === "video/webm") {
    return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  }
  if (file.mimetype === "video/mp4") {
    return bytes.subarray(4, 8).toString() === "ftyp";
  }
  return false;
};

const uploadCommunityMedia = (req, res, next) => {
  upload.single("media")(req, res, (error) => {
    if (error) {
      const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
      return res.status(status).json({ success: false, message: error.message || "Media upload failed." });
    }
    if (req.file && !hasValidSignature(req.file)) {
      return res.status(400).json({ success: false, message: "The selected file does not match its stated format." });
    }
    next();
  });
};

module.exports = { uploadCommunityMedia, MAX_MEDIA_SIZE };
