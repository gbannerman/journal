const { default: axios } = require("axios");

const searchPhotos = async (accessToken, date) => {
  const { day, month, year} = date;

  const { data } = await axios.post("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
    pageSize: 1,
    filters: {
      dateFilter: {
        dates: [
          {
            year,
            month,
            day,
          }
        ]
      },
      mediaTypeFilter: {
        mediaTypes: [
          "PHOTO",
        ],
      }
    }
  },
  {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-type": "application/json",
    },
  });

  return data.mediaItems || [];
}

module.exports = {
  searchPhotos,
}