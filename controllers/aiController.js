// controllers/aiController.js
// AI Medical Assistant — website navigation help + general health info,
// via services/aiService.js.

const aiService = require('../services/aiService');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.showAssistant = (req, res) => {
  res.render('ai/assistant', { title: 'AI Health Assistant', disclaimer: aiService.DISCLAIMER });
};

exports.chat = catchAsync(async (req, res) => {
  const { message } = req.body;
  const result = await aiService.getReply(message);
  res.json({ success: true, ...result });
});
