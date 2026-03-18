import fs from "fs";
import path from "path";
import { Session } from "../../database/model/session.model.js";
import { Question } from "../../database/model/question.model.js";
import { Enrollment } from "../../database/model/enrollment.model.js";

const resolveLocalFilePath = (filePath) => {
  if (!filePath) return null;

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    try {
      const { pathname } = new URL(filePath);
      return path.resolve(pathname.replace(/^\//, ""));
    } catch (err) {
      return null;
    }
  }

  return path.resolve(filePath);
};

const getSessionEnrollment = async (session, studentId) => {
  return Enrollment.findOne({
    courseId: session.courseId,
    studentId,
  });
};

const ensureSessionAccess = async (session, studentId, res) => {
  const isEnrolled = await getSessionEnrollment(session, studentId);
  if (!isEnrolled) {
    return res.json({ message: "you don't  enrolled in this course" });
  }

  if (session.order > 1) {
    const previousSession = await Session.findOne({
      courseId: session.courseId,
      order: session.order - 1,
    });

    if (
      previousSession &&
      !isEnrolled.completedSessions.includes(previousSession._id)
    ) {
      return res.json({
        message:
          "You must complete the previous session before accessing this one",
      });
    }
  }

  return isEnrolled;
};

export const getSessionById = async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id);
  if (!session) return res.json({ message: "no session found" });
  res.json({ message: "session found", session });
};

export const updateSession = async (req, res) => {
  const { id } = req.params;
  const { title, contentType, duration } = req.body;
  const session = await Session.findById(id).populate("courseId");

  if (!session) {
    return res.json({ message: "session not found" });
  }

  if (!session.courseId.teacherId.equals(req.user._id)) {
    return res.json({
      message: "you don't own this course session",
    });
  }

  session.title = title;
  session.contentType = contentType;
  session.duration = duration;

  await session.save();

  return res.json({ message: "session updated", session });
};

export const deleteSession = async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id).populate("courseId");

  if (!session) {
    return res.json({ message: "session not found" });
  }

  if (!session.courseId.teacherId.equals(req.user._id)) {
    return res.json({
      message: "you don't own this course session",
    });
  }

  const localFilePath = resolveLocalFilePath(session.filePath);
  if (localFilePath && fs.existsSync(localFilePath)) {
    await fs.promises.unlink(localFilePath);
  }

  const deletedSession = await Session.findByIdAndDelete(id);

  await Session.updateMany(
    {
      courseId: session.courseId._id,
      order: { $gt: session.order },
    },
    { $inc: { order: -1 } },
  );

  return res.json({ message: "session Deleted", session: deletedSession });
};

export const streamVideo = async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id);

  if (!session || !session.filePath) {
    return res.json({ message: "Video not found" });
  }

  if (session.contentType !== "video") {
    return res.json({ message: "this session is not a video" });
  }

  const hasAccess = await ensureSessionAccess(session, req.user._id, res);
  if (!hasAccess) return;

  const filePath = resolveLocalFilePath(session.filePath);
  if (!fs.existsSync(filePath)) {
    return res.json({ message: "File does not exist on server" });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.status(206);
    Object.entries(head).forEach(([key, value]) => res.setHeader(key, value));
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  const head = {
    "Content-Length": fileSize,
    "Content-Type": "video/mp4",
  };
  Object.entries(head).forEach(([key, value]) => res.setHeader(key, value));
  res.set(head);
  fs.createReadStream(filePath).pipe(res);
};

export const getSessionPdf = async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id);

  if (!session || !session.filePath) {
    return res.json({ message: "PDF not found" });
  }

  const hasAccess = await ensureSessionAccess(session, req.user._id, res);
  if (!hasAccess) return;

  if (session.contentType !== "pdf") {
    return res.json({ message: "this session is not a pdf" });
  }

  const filePath = resolveLocalFilePath(session.filePath);
  if (!filePath || !fs.existsSync(filePath)) {
    return res.json({ message: "File does not exist on server" });
  }

  res.setHeader("Content-Type", "application/pdf");
  return fs.createReadStream(filePath).pipe(res);
};

export const createSessionQuestion = async (req, res) => {
  const { sessionId } = req.params;
  let { text, options, correctAnswerIndex } = req.body;
  correctAnswerIndex -= 1;

  const session = await Session.findById(sessionId).populate("courseId");
  if (!session || !session.courseId.teacherId.equals(req.user._id)) {
    return res.json({
      message: "this session is not exist or you don't own this session",
    });
  }

  const addedQuestion = await Question.create({
    sessionId,
    text,
    options,
    correctAnswerIndex,
  });
  res.json({ message: "question Added", addedQuestion });
};

export const getSessionQuestions = async (req, res) => {
  const { sessionId } = req.params;
  const questions = await Question.find({ sessionId })
    .populate("sessionId")
    .select("-correctAnswerIndex");

  if (!questions.length) {
    return res.json({ message: "no questions found for this session" });
  }

  const isEnrolled = await Enrollment.findOne({
    courseId: questions[0].sessionId.courseId,
    studentId: req.user._id,
  });
  if (!isEnrolled) {
    return res.json({ message: "you are not enrolled in this course" });
  }

  return res.json({ message: "questions found", questions });
};

export const submitSessionQuiz = async (req, res) => {
  const { sessionId } = req.params;
  const { answers } = req.body;
  let rightAnswers = 0;

  const questions = await Question.find({ sessionId }).populate("sessionId");
  if (!questions.length) return res.json({ message: "no questions found" });

  const isEnrolled = await Enrollment.findOne({
    courseId: questions[0].sessionId.courseId,
    studentId: req.user._id,
  });
  if (!isEnrolled) {
    return res.json({ message: "you don't  enrolled in this course" });
  }

  if (isEnrolled.completedSessions.includes(sessionId)) {
    return res.json({ message: "you already submit this exam" });
  }

  if (questions[0].sessionId.order > 1) {
    const previousSession = await Session.findOne({
      courseId: questions[0].sessionId.courseId,
      order: questions[0].sessionId.order - 1,
    });

    if (
      previousSession &&
      !isEnrolled.completedSessions.includes(previousSession._id)
    ) {
      return res.json({
        message:
          "You must complete the previous session before accessing this one",
      });
    }
  }

  questions.forEach((question, index) => {
    if (answers[index] == question.correctAnswerIndex + 1) {
      rightAnswers++;
    }
  });

  const score = (rightAnswers / questions.length) * 100;
  const passed = score >= questions[0].sessionId.passingScoreThreshold;

  if (passed && !isEnrolled.completedSessions.includes(sessionId)) {
    isEnrolled.completedSessions.push(sessionId);
    await isEnrolled.save();
  }

  if (passed) {
    return res.json({
      message: "Quiz submitted and you ready to go the next session",
      score: `${score}%`,
      passed,
    });
  }

  res.json({
    message: "Quiz submitted you have to try again to go to the next session",
    score: `${score}%`,
    passed,
  });
};
