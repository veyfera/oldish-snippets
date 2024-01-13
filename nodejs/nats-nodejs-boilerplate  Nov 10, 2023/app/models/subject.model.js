const subject = (sequelize, Sequelize) => {
  const Subject = sequelize.define("subject", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING
    },
  }, { timestamps: false });

  return Subject;
};

export default subject;
