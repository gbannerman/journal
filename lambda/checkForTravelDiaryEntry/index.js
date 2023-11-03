const { DateTime } = require("luxon");
const { getEntryForDate } = require("./diary");

exports.handler = async (event) => {
  const day = event.dateOverride
    ? DateTime.fromISO(event.dateOverride)
    : DateTime.now();

  console.log(`Getting entries for ${day.toISODate()}`);

  const entries = await getEntryForDate(day);

  const formattedDate = day.toFormat("d MMMM");

  const formattedEntries = (entries ?? []).map((x) => ({
    ...x,
    date: `${x.year}-${x.day}`,
    yearsAgo: parseInt(day.toFormat("yyyy")) - x.year,
  }));

  return {
    formattedDate,
    entries: formattedEntries,
    entriesFound: !!formattedEntries.length,
  };
};
