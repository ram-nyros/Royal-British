const router = require("express").Router();
const Application = require("../models/Application");

router.post("/", async (req, res) => {
  try {
    console.log("[Applications] Received submission:", req.body);

    const { name, email, mobile, course } = req.body;

    if (!name || !email || !mobile || !course) {
      console.log("[Applications] Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, mobile, course",
      });
    }

    const application = new Application({ name, email, mobile, course });
    await application.save();

    console.log(
      "[Applications] Application saved successfully:",
      application._id,
    );
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: { id: application._id },
    });
  } catch (error) {
    console.error("[Applications] Error submitting application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
});

module.exports = router;
