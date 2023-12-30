require("dotenv").config();

const {
  updateDatabaseWithDiaryEntries,
  readAndFormatDiary,
} = require("./import");
const { uploadStatistics } = require("./stats");
const { uploadVisualisation } = require("./visualise");

const main = async () => {
  const formattedDiary = await readAndFormatDiary();

  updateDatabaseWithDiaryEntries(formattedDiary);
  uploadStatistics(formattedDiary);
  uploadVisualisation(formattedDiary);
};

main();
