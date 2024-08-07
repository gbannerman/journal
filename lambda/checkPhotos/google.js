const { default: axios } = require("axios");

const searchGooglePhotos = async (accessToken, date) => {
  const { day, month, year } = date;

  const { data } = await axios.post(
    "https://photoslibrary.googleapis.com/v1/mediaItems:search",
    {
      pageSize: 100,
      filters: {
        dateFilter: {
          dates: [
            {
              year,
              month,
              day,
            },
          ],
        },
        mediaTypeFilter: {
          mediaTypes: ["PHOTO"],
        },
        contentFilter: {
          excludedContentCategories: [
            "RECEIPTS",
            "DOCUMENTS",
            "WHITEBOARDS",
            "SCREENSHOTS",
            "UTILITY",
          ],
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-type": "application/json",
      },
    }
  );

  return data.mediaItems
    ? data.mediaItems.map((i) => ({ ...i, source: "GOOGLE" }))
    : [];
};

module.exports = {
  searchGooglePhotos,
};
