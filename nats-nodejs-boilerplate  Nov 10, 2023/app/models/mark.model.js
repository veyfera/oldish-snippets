const mark = (sequelize, Sequelize) => {
  const Mark = sequelize.define("mark", {
    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("now")
    },
    subject: {
      type: Sequelize.INTEGER,
      references: {
        model: "subjects",
        key: "id"
      }
    },
    grade: {
      type: Sequelize.INTEGER
    },
    student: {
      type: Sequelize.STRING,
      references: {
        model: "students",
        key: "personalCode"
      }
    }
  }, { timestamps: false });

  return Mark;
};

export default mark;
