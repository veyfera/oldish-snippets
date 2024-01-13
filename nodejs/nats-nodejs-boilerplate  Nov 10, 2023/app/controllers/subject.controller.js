import db from '../models/index.js';

const Subject = db.subject;

// Create and Save a new Subject
export const findOrCreate = async (name) => {
  // Validate request
  if (!name) {
    console.log("a better way to throw an error if subject name is not provided");
    return;
  }

  // Save Subject in the database
  try {
    const result = await Subject.findOrCreate({
      where: { name: name },
      defaults: { name: name }
    });

    return result[0].dataValues.id;
  } catch(err){
      console.log("a better way to throw an errror if could not save Subject to db", err);
    }
};

