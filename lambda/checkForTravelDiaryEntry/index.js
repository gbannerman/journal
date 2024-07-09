const { DateTime } = require("luxon");
const { getEntryForDate } = require("./diary");

exports.handler = async (event) => {
  const day = event.dateOverride
    ? DateTime.fromISO(event.dateOverride)
    : DateTime.now();

  console.log(`Getting entries for ${day.toISODate()}`);

  const entries = await getEntryForDate(day);

  const formattedDate = day.toFormat("d MMMM");

  const formattedEntries = (entries ?? []).map((x) => {
    const isoDateString = `${x.year}-${x.day}`;
    return {
      ...x,
      date: isoDateString,
      yearsAgo: Math.floor(
        Math.abs(DateTime.fromISO(isoDateString).diffNow("years").years)
      ),
    };
  });

  return {
    formattedDate,
    entries: formattedEntries,
    entriesFound: !!formattedEntries.length,
  };
};
