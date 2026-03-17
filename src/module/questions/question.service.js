import { Question } from "../../database/model/question.model.js";

export const updateQuestion = async (req, res) => {
  let { id } = req.params;
  let { text, options, correctAnswerIndex } = req.body;
  if (correctAnswerIndex) correctAnswerIndex -= 1;

  const question = await Question.findById(id).populate({
    path: "sessionId",
    populate: {
      path: "courseId",
    },
  });

  if (!question || !req.user._id.equals(question.sessionId.courseId.teacherId)) {
    return res.json({
      message: "this question is not found or you don't own this session",
    });
  }

  text ? (question.text = text) : null;
  options ? (question.options = options) : null;
  correctAnswerIndex ? (question.correctAnswerIndex = correctAnswerIndex) : null;
  await question.save();

  return res.json({ message: "question updated", question });
};

export const deleteQuestion = async (req, res) => {
  let { id } = req.params;

  const question = await Question.findById(id).populate({
    path: "sessionId",
    populate: {
      path: "courseId",
    },
  });

  if (!question || !req.user._id.equals(question.sessionId.courseId.teacherId)) {
    return res.json({
      message: "this question is not found or you don't own this session",
    });
  }

  const deletedQuestion = await Question.findByIdAndDelete(id);
  return res.json({ message: "question deleted", deletedQuestion });
};
