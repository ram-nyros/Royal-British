const router = require("express").Router();
const Application = require("../models/Application");

router.post("/", async (req, res) => {
  try {
    console.log("[Applications] ========== NEW SUBMISSION ==========");
    console.log(
      "[Applications] Headers:",
      JSON.stringify(req.headers, null, 2),
    );
    console.log("[Applications] Body:", JSON.stringify(req.body, null, 2));

    const { name, email, mobile, course, message } = req.body;

    if (!name || !email || !mobile || !course) {
      console.log("[Applications] Missing required fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, mobile, course",
      });
    }

    const application = new Application({
      name,
      email,
      mobile,
      course,
      message,
    });
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
