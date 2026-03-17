import { Course } from "../../database/model/course.model.js";
import { Session } from "../../database/model/session.model.js";
import { Enrollment } from "../../database/model/enrollment.model.js";
import { Transaction } from "../../database/model/transaction.model.js";

export const getMyCourses = async (req, res) => {
  console.log("hello world");
  const courses = await Course.find({
    teacherId: req.user._id,
  });
  if (!courses.length)
    return res.json({
      message: "this course is not found or you don't own any course",
    });
  res.json({ message: "courses found successfully", courses });
};

export const createCourse = async (req, res) => {
  const { title, description, price, category } = req.body;
  let thumbnail = "";
  if (req.file) {
    console.log(req.file);
    thumbnail = `http://localhost:3000/uploads/images/${req.file.filename}`;
  }
  const courseAdded = await Course.create({
    teacherId: req.user._id,
    title,
    description,
    price,
    thumbnail,
    price,
    category,
  });
  res.json({ message: "course added", courseAdded });
};

export const getCourses = async (req, res) => {
  const { q, category, isFree, page = 1, limit = 10 } = req.query;
  let filter = {};

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }
  if (category) {
    filter.category = category;
  }
  if (isFree === "true") {
    filter.price = "0";
  }
  console.log(filter);

  const skip = (page - 1) * limit;
  const courses = await Course.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .populate("teacherId", "name email");

  const total = await Course.countDocuments(filter);

  res.json({ message: "success", page, limit, total, courses });
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  res.json({ course });
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  const course = await Course.findOneAndDelete({
    _id: id,
    teacherId: req.user._id,
  });
  if (!course)
    return res.json({
      message: "this course is not found or you don't own this course",
    });
  res.json({ message: "course Deleted successfully", course });
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category } = req.body;
  let thumbnail = "";
  if (req.file) {
    console.log(req.file);
    thumbnail = `http://localhost:3000/uploads/images/${req.file.filename}`;
  }

  const updateData = {
    title,
    description,
    category,
    price,
  };

  if (thumbnail) {
    updateData.thumbnail = thumbnail;
  }

  const course = await Course.findOneAndUpdate(
    {
      _id: id,
      teacherId: req.user._id,
    },
    updateData,
    { runValidators: true, new: true },
  );
  if (!course)
    return res.json({
      message: "this course is not found or you don't own this course",
    });
  res.json({ message: "course updated successfully", course });
};

export const addSession = async (req, res) => {
  try {
    let { courseId } = req.params;
    let { title, contentType, duration, passingScoreThreshold } = req.body;
    const course = await Course.findOne({
      _id: courseId,
      teacherId: req.user._id,
    });
    if (!course)
      return res.json({
        message: "no course found or you don't own this course",
      });

    let filePath = "";
    if (req.file) {
      console.log(req.file);
      if (req.file.destination === "uploads/videos")
        filePath = `http://localhost:3000/uploads/videos/${req.file.filename}`;
      if (req.file.destination === "uploads/pdf")
        filePath = `http://localhost:3000/uploads/pdf/${req.file.filename}`;
    }
    const lastSession = await Session.findOne({ courseId }).sort({ order: -1 });
    const order = lastSession ? lastSession.order + 1 : 1;

    const sessionAdded = await Session.create({
      courseId,
      title,
      contentType,
      duration,
      order,
      filePath,
      passingScoreThreshold,
    });

    res.json({ message: "session added successfully", sessionAdded });
  } catch (err) {
    res.json({ message: err.message });
  }
};

export const getCourseSessions = async (req, res) => {
  let { courseId } = req.params;
  const courseWithSessions = await Course.findOne({
    _id: courseId,
    teacherId: req.user._id,
  }).populate("sessions");

  const isEnrolled = await Enrollment.findOne({
    courseId: courseId,
    studentId: req.user._id,
  });

  if (!isEnrolled)
    return res.json({ message: "you aren't enrolled in this course" });

  if (!courseWithSessions)
    return res.json({
      message: "course not found or you don't own this course",
    });
  res.json({ message: "course found", courseWithSessions });
};

export const subscribeToCourse = async (req, res) => {
  let { id } = req.params;
  let { cardNumber } = req.body;

  const course = await Course.findById(id);
  if (!course) return res.json({ message: "no course found" });

  const isEnrolled = await Enrollment.findOne({
    courseId: id,
    studentId: req.user._id,
  });
  if (isEnrolled)
    return res.json({ message: "you already enrolled in this course" });

  if (course.price && !cardNumber)
    return res.json({
      message: "you have to include a card to pay for this course",
    });
  const enrollment = await Enrollment.create({
    studentId: req.user._id,
    courseId: course._id,
  });
  const transaction = await Transaction.create({
    studentId: req.user._id,
    teacherId: course.teacherId,
    courseId: course._id,
    amount: course.price,
    status: "success",
  });

  return res.json({ message: "course subscribed", enrollment, transaction });
};

