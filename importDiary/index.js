require("dotenv").config();

const {
  updateDatabaseWithDiaryEntries,
  readAndFormatDiary,
} = require("./import");
const { uploadVisualisation } = require("./visualise");

const main = async () => {
  const formattedDiary = await readAndFormatDiary();

  updateDatabaseWithDiaryEntries(formattedDiary);
  uploadVisualisation(formattedDiary);
};

main();
