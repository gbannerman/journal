const { default: axios } = require("axios");
const { DateTime } = require("luxon");

const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY;
const IMMICH_BASIC_AUTH_USER = process.env.IMMICH_BASIC_AUTH_USER;
const IMMICH_BASIC_AUTH_PASSWORD = process.env.IMMICH_BASIC_AUTH_PASSWORD;

const searchImmichPhotos = async (date) => {
  const { day, month, year } = date;

  const startDate = DateTime.utc(year, month, day).toISO();
  const endDate = DateTime.utc(year, month, day, 23, 59, 59, 999).toISO();

  console.log(
    `Searching immich for photos between ${startDate} and ${endDate}`
  );

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
      auth: {
        username: IMMICH_BASIC_AUTH_USER,
        password: IMMICH_BASIC_AUTH_PASSWORD,
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
