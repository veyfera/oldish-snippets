const student = (sequelize, Sequelize) => {
  const Student = sequelize.define("student", {
    personalCode: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
  }, { timestamps: false });

  return Student;
};

export default student;
