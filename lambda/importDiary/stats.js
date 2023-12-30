const { uploadFile } = require("./s3");

const getWordCount = (entry) =>
  entry.rawContent.split(" ").filter((n) => n !== "").length;

const getMostCommonStats = (countMap) => {
  const entries = Object.entries(countMap);

  const [value, count] = entries.sort((a, b) => b[1] - a[1])[0];

  return {
    total: entries.length,
    mostCommon: {
      value,
      count,
    },
  };
};

const generateStatistics = (formattedDiary) => {
  const earliest = formattedDiary[0].date;
  const latest = formattedDiary[formattedDiary.length - 1].date;

  let wordCount = 0;

  const trips = [];

  const countries = {};
  const years = {};

  formattedDiary.forEach((entry) => {
    wordCount = wordCount + getWordCount(entry);

    if (trips.indexOf(entry.tripName) === -1) {
      trips.push(entry.tripName);
    }

    if (!countries[entry.country]) {
      countries[entry.country] = 1;
    } else {
      countries[entry.country] = countries[entry.country] + 1;
    }

    if (!years[entry.year]) {
      years[entry.year] = 1;
    } else {
      years[entry.year] = years[entry.year] + 1;
    }
  });

  const stats = {
    numberOfEntries: formattedDiary.length,
    wordCount,
    earliest: earliest.toISODate(),
    latest: latest.toISODate(),
    trips: {
      total: trips.length,
    },
    countries: getMostCommonStats(countries),
    years: getMostCommonStats(years),
  };

  return JSON.stringify(stats);
};

const uploadStatistics = async (formattedDiary) => {
  const statistics = generateStatistics(formattedDiary);
  await uploadFile("meta/stats.json", statistics);
};

module.exports = {
  uploadStatistics,
};
