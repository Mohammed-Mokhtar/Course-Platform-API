import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // decide folder based on file.mimetype
    if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/webm" ||
      file.mimetype === "video/mkv"
    )
      return cb(null, "uploads/videos");
    if (file.mimetype === "application/pdf") return cb(null, "uploads/pdf");
    return cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    // build a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "video/mkv",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});
