const expertModel = require("../models/expertModel");

async function getExpertProfile(req, res) {
  try {
    const expertId = req.params.id;

    const expert = await expertModel.getExpertById(expertId);

    if (!expert) {
      return res.status(404).json({
        message: "Expert not found.",
      });
    }

    return res.status(200).json({
      message: "Expert profile retrieved successfully!",
      expert: expert,
    });
  } catch (error) {
    console.error("Get expert profile error:", error.message);

    return res.status(500).json({
      message: "An error occurred while retrieving the expert profile.",
    });
  }
}

module.exports = {
  getExpertProfile,
};
