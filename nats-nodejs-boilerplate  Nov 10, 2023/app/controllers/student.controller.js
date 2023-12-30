import db from "../models/index.js";
const Student = db.student;

// Create and Save a new Student
export const create = async (data) => {
  // Validate data
  if (!data || !Object.keys(data).length) {
    console.log("a better way to throw an error if the data obj is empty");
    return;
  }

  // Create a Student
  const student = {
    personalCode: data.personalCode,
    name: data.name,
    lastName: data.lastName,
  };

  // Save Student in the database
  try {
    await Student.create(student);
  } catch(errr) {
    console.log("a better way to throw an errror if could not save Student to db", err);
  }
};

// Retrieve statistics for a single Student with id
export const getStatistic = async (req, res) => {
  const id = req.params.id;

  const student = await findOne(id);
  if (student){
    const subjects = await db.sequelize.query(`SELECT subjects.name as subject, MAX(marks.grade) as maxGrade, MIN(marks.grade) as minGrade, avg(marks.grade)::numeric(10,2) as avgGrade, count(marks.id) as totalGrades FROM subjects left JOIN marks on marks.subject = subjects.id and marks.student = '${id}' GROUP BY subjects.name`);
    student.dataValues.subjects = subjects[0];
    res.send(student);
  } else {
    res.send({message: `Could not find student with id: ${id}`});
  }

}

// Find a single Student with an id
export const findOne = async (id) => {
  let result = {};

  try {
    result = await Student.findByPk(id);
  } catch(err) {
    console.log(`Error retrieving Student with id = ${id}`);
  }

  return result;
};

