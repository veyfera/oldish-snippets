import db from "../models/index.js";
const Mark = db.mark;
const MARKS_PER_PAGE = 5;

// Create and Save a new Mark
export const create = async (data) => {
  // Validate data
  if (!data || !Object.keys(data).length) {
    console.log("a better way to throw an error if data is not provided");
    return;
  }

  //Create a Mark
  const mark = {
    subject: data.subjectId,
    grade: data.grade,
    student: data.personalCode
  }

  // Save Mark in the database
  try {
    await Mark.create(mark);
  } catch(err){
    console.log("a better way to throw an errror if could not save Mark to db", err);
  }
};

// find all Marks sorted by date
export const findAllDateSort = (req, res) => {
  const page = Math.abs(req.query.page) || 1;

  Mark.findAll({
    limit: MARKS_PER_PAGE,
    offset: MARKS_PER_PAGE * (page - 1),
    order: [["date", "ASC"]]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
        err.message || "Some error occurred while retrieving marks."
      });
    });
};

