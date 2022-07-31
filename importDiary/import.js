const { putItem } = require("./db");
const { DateTime } = require("luxon");
const showdown = require("showdown");
const fm = require("front-matter");
const fs = require("fs");
const path = require("path");

const DIARY_ENTRY_DIRECTORY = "/Users/gavinbannerman/obsidian/diary/entries";

async function readDiary() {
  const diary = [];

  return new Promise((resolve, reject) => {
    fs.readdir(DIARY_ENTRY_DIRECTORY, (err, files) => {
      if (err) {
        console.error("Could not list the directory.", err);
        process.exit(1);
      }

      files.forEach(function (file) {
        const filePath = path.join(DIARY_ENTRY_DIRECTORY, file);
        try {
          const text = fs.readFileSync(filePath, { encoding: "utf8" });
          diary.push(fm(text));
        } catch (err) {
          console.log(err);
        }
      });

      return resolve(diary);
    });
  });
}

function formatDiary(diary) {
  return diary.map((e) => formatDiaryEntry(e));
}

function formatDiaryEntry({ body, attributes }) {
  const date = DateTime.fromISO(attributes.date);

  const converter = new showdown.Converter({ strikethrough: true });
  const content = converter.makeHtml(body);

  return {
    year: parseInt(date.toFormat("yyyy"), 10),
    day: date.toFormat("MM-dd"),
    tripName: attributes.trip,
    country: attributes.country,
    content,
  };
}

const addEntriesToDatabase = async (diary) => {
  diary.forEach(async (entry) => {
    await putItem(entry);
  });
};

const updateDatabaseWithDiaryEntries = async () => {
  const diary = await readDiary();
  const formattedDiary = formatDiary(diary);
  await addEntriesToDatabase(formattedDiary);
};

module.exports = {
  updateDatabaseWithDiaryEntries,
};
