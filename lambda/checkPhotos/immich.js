const { default: axios } = require("axios");
const { DateTime } = require("luxon");

const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY;

const searchImmichPhotos = async (date) => {
  const { day, month, year } = date;

  const startDate = DateTime.utc(year, month, day).toISO();
  const endDate = DateTime.utc(year, month, day, 23, 59, 59, 999).toISO();

  console.log(
    `Searching immich for photos between ${startDate} and ${endDate}`
  );

  console.log(`Using Immich base URL: ${IMMICH_BASE_URL}`);
  console.log(`Using Immich API Key: ${IMMICH_API_KEY}`);

  const { data } = await axios.post(
    `${IMMICH_BASE_URL}/api/search/metadata`,
    {
      takenAfter: startDate,
      takenBefore: endDate,
    },
    {
      headers: {
        "x-api-key": IMMICH_API_KEY,
      },
    }
  );

  return data && data.length
    ? data.map((i) => ({ ...i, source: "IMMICH" }))
    : [];
};

module.exports = {
  searchImmichPhotos,
};
