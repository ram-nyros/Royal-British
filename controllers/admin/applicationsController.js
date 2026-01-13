const Application = require("../../models/Application");

exports.list = async (req, res) => {
  try {
    const apps = await Application.find().populate("user", "name email");
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.get = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application removed", app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
