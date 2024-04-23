import { Sequelize, DataTypes } from "sequelize";

import { Message } from "./message.js";

export function initDb() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
  });

  sequelize.sync();


  Message.init({
    name: DataTypes.STRING,
    text: DataTypes.STRING,
    timeStamp: DataTypes.NUMBER
  }, { sequelize, modelName: 'message' });
}