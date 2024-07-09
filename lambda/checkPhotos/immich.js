const { default: axios } = require("axios");
const { DateTime } = require("luxon");

const IMMICH_BASE_URL = process.env.IMMICH_BASE_URL;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY;
const IMMICH_BASIC_AUTH_USER = process.env.IMMICH_BASIC_AUTH_USER;
const IMMICH_BASIC_AUTH_PASSWORD = process.env.IMMICH_BASIC_AUTH_PASSWORD;

const searchImmichPhotos = async (date) => {
  const { day, month, year } = date;
  const timeBucket = DateTime.utc(year, month, day).toISO();

  console.log(`Searching immich for photos in timeBucket: ${timeBucket}`);

  const { data } = await axios.get(
    `${IMMICH_BASE_URL}/api/timeline/bucket?size=DAY&timeBucket=${timeBucket}`,
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
