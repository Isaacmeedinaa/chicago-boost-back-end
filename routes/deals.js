const express = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/deals-photos");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 },
});
const dealController = require("../controllers/dealController");

const router = express.Router();

router.get("/", dealController.getDeals);
router.get("/:id", dealController.getDeal);
router.post("/", upload.array("multiplePhotos", 10), dealController.createDeal);
router.put(
  "/:id",
  upload.array("multiplePhotos", 10),
  dealController.updateDeal
);
router.delete("/:id", dealController.deleteDeal);

module.exports = router;
