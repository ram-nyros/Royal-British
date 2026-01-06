const router = require("express").Router();
const Application = require("../models/Application");

router.post("/", async (req, res) => {
  const application = new Application(req.body);
  await application.save();
  res.json({ success: true });
});

module.exports = router;
