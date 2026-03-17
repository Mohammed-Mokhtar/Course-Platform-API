import fs from "fs";
import path from "path";
import { Router } from "express";
import { Session } from "../../database/model/session.model.js";
import { auth, checkRole } from "../../common/middleware/auth.js";
import { Question } from "../../database/model/question.model.js";
import { addQuestionSchema } from "../questions/question.validate.js";
import { validate } from "../../common/utils/validation.js";
import { Enrollment } from "../../database/model/enrollment.model.js";

const router = Router();

export const streamVideo = async (req, res) => {
  const { id } = req.params;

  // 3. Get filePath from session document
  const session = await Session.findById(id);

  const isEnrolled = await Enrollment.findOne({
    courseId: session.courseId,
    studentId: req.user._id,
  });
  if (!isEnrolled)
    return res.json({ message: "you don't  enrolled in this course" });

  if (session.order > 1) {
    const previousSession = await Session.findOne({
      courseId: session.courseId,
      order: session.order - 1,
    });

    if (
      previousSession &&
      !isEnrolled.completedSessions.includes(previousSession._id)
    ) {
      return res.status(403).json({
        message:
          "You must complete the previous session before accessing this one",
      });
    }
  }

  if (!session || !session.filePath) {
    return res.status(404).json({ message: "Video not found" });
  }

  const filePath = resolveLocalFilePath(session.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File does not exist on server" });
  }

  // 4. const stat = fs.statSync(filePath) -> get total file size
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  // 5. Parse req.headers.range -> e.g. "bytes=0-"
  const range = req.headers.range;

  if (range) {
    // 6. Calculate start, end, chunkSize
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    // 7. Set headers and pipe the stream:
    // res.writeHead(206, { ... })
    // fs.createReadStream(filePath, { start, end }).pipe(res)
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};

export const getSessionPdf = async (req, res) => {
  const { id } = req.params;

  const session = await Session.findById(id);

  const isEnrolled = await Enrollment.findOne({
    courseId: session.courseId,
    studentId: req.user._id,
  });
  if (!isEnrolled)
    return res.json({ message: "you don't  enrolled in this course" });

  if (session.order > 1) {
    const previousSession = await Session.findOne({
      courseId: session.courseId,
      order: session.order - 1,
    });

    if (
      previousSession &&
      !isEnrolled.completedSessions.includes(previousSession._id)
    ) {
      return res.status(403).json({
        message:
          "You must complete the previous session before accessing this one",
      });
    }
  }

  if (!session || !session.filePath) {
    return res.status(404).json({ message: "PDF not found" });
  }

  if (session.contentType !== "pdf") {
    return res.status(400).json({ message: "this session is not a pdf" });
  }

  const filePath = resolveLocalFilePath(session.filePath);

  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File does not exist on server" });
  }

  res.setHeader("Content-Type", "application/pdf");
  return fs.createReadStream(filePath).pipe(res);
};

const resolveLocalFilePath = (filePath) => {
  if (!filePath) return null;

  // If a full URL is stored, convert to local uploads path.
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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id);
  if (!session) return res.json({ message: "no session found" });
  res.json({ message: "session found", session });
});

router.put("/:id", auth, checkRole("teacher"), async (req, res) => {
  const { id } = req.params;
  let { title, contentType, duration } = req.body;
  const session = await Session.findById(id).populate("courseId");

  if (!session) {
    return res.json({ message: "session not found" });
  }

  if (!session.courseId.teacherId.equals(req.user._id))
    return res.json({
      message: "you don't own this course session",
    });

  session.title = title;
  session.contentType = contentType;
  session.duration = duration;

  await session.save();

  return res.json({ message: "session updated", session });
});

router.delete("/:id", auth, checkRole("teacher"), async (req, res) => {
  const { id } = req.params;
  const session = await Session.findById(id).populate("courseId");

  if (!session) {
    return res.json({ message: "session not found" });
  }

  if (!session.courseId.teacherId.equals(req.user._id))
    return res.json({
      message: "you don't own this course session",
    });

  const localFilePath = resolveLocalFilePath(session.filePath);
  console.log(localFilePath);
  if (localFilePath && fs.existsSync(localFilePath)) {
    await fs.promises.unlink(localFilePath);
  }

  const deletedSession = await Session.findByIdAndDelete(id);

  // Reorder remaining sessions in the same course
  await Session.updateMany(
    {
      courseId: session.courseId._id,
      order: { $gt: session.order },
    },
    { $inc: { order: -1 } },
  );

  return res.json({ message: "session Deleted", session: deletedSession });
});

router.get("/:id/stream", auth, checkRole("teacher", "student"), streamVideo);
router.get("/:id/pdf", auth, checkRole("teacher", "student"), getSessionPdf);

router.post(
  "/:sessionId/questions",
  auth,
  checkRole("teacher"),
  validate(addQuestionSchema),
  async (req, res) => {
    let { sessionId } = req.params;
    let { text, options, correctAnswerIndex } = req.body;
    correctAnswerIndex -= 1;
    const session = await Session.findById(sessionId).populate("courseId");
    // console.log(session.courseId.teacherId);
    if (!session || !session.courseId.teacherId.equals(req.user._id))
      return res.json({
        message: "this session is not exist or you don't own this session",
      });
    const addedQuestion = await Question.create({
      sessionId,
      text,
      options,
      correctAnswerIndex,
    });
    res.json({ message: "question Added", addedQuestion });
  },
);

router.get("/:sessionId/questions", auth, async (req, res) => {
  let { sessionId } = req.params;
  const questions = await Question.find({ sessionId })
    .populate("sessionId")
    .select("-correctAnswerIndex");

  if (!questions.length)
    return res.json({ message: "no questions found for this session" });

  const isEnrolled = await Enrollment.findOne({
    courseId: questions[0].sessionId.courseId,
    studentId: req.user._id,
  });
  if (!isEnrolled)
    return res.json({ message: "you are not enrolled in this course" });

  return res.json({ message: "questions found", questions });
});

router.post(
  "/:sessionId/submit",
  auth,
  checkRole("student"),
  async (req, res) => {
    let { sessionId } = req.params;
    let { answers } = req.body;
    let rightAnswers = 0;

    const questions = await Question.find({ sessionId }).populate("sessionId");
    if (!questions.length) return res.json({ message: "no questions found" });

    const isEnrolled = await Enrollment.findOne({
      courseId: questions[0].sessionId.courseId,
      studentId: req.user._id,
    });
    if (!isEnrolled)
      return res.json({ message: "you don't  enrolled in this course" });

    if (isEnrolled.completedSessions.includes(sessionId))
      return res.json({ message: "you already submit this exam" });

    console.log(questions[0].sessionId.order);

    if (questions[0].sessionId.order > 1) {
      const previousSession = await Session.findOne({
        courseId: questions[0].sessionId.courseId,
        order: questions[0].sessionId.order - 1,
      });

      console.log(previousSession);

      if (
        previousSession &&
        !isEnrolled.completedSessions.includes(previousSession._id)
      ) {
        return res.status(403).json({
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

    if (passed)
      return res.json({
        message: "Quiz submitted and you ready to go the next session",
        score: `${score}%`,
        passed,
      });
    res.json({
      message: "Quiz submitted you have to try again to go to the next session",
      score: `${score}%`,
      passed,
    });
  },
);

export default router;

