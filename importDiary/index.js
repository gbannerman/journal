require("dotenv").config();

const { updateDatabaseWithDiaryEntries } = require("./import");

updateDatabaseWithDiaryEntries();
