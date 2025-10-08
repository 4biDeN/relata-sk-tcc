const path = require("path");
const fs = require("fs");
const multer = require("multer");

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "file", ext)
      .replace(/\s+/g, "_");
    cb(null, `${ts}_${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith("image/"))
    return cb(null, false);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

const toPublicUrl = (file) => {
  const base = (
    process.env.PUBLIC_UPLOAD_URL || "http://localhost:3000/uploads"
  ).replace(/\/+$/, "");
  const name = file?.filename || path.basename(file?.path || "");
  return `${base}/${name}`;
};

module.exports = { upload, toPublicUrl };
