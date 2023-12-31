const { DateTime } = require("luxon");
const { getAccessToken } = require("./auth");
const { searchPhotos } = require("./photos");

exports.handler = async (event) => {
  const { date: dateString } = event;

  const accessToken = await getAccessToken(process.env.GOOGLE_REFRESH_TOKEN);

  const date = DateTime.fromISO(dateString);

  console.log(date);

  const photos = await searchPhotos(accessToken, date);

  console.log(photos);

  if (!photos.length) {
    return {
      images: null,
    };
  }

  shuffleArray(photos);

  const images = photos.slice(0, 3).map((x, i) => {
    const [_filename, extension] = x.filename.split(".");
    const updatedFilename = `${date.toFormat("yyyy-MM-dd")}/${
      i + 1
    }.${extension}`;
    return {
      url: `${x.baseUrl}=w1024-h512-d`,
      filename: updatedFilename,
      contentType: x.mimeType,
    };
  });

  console.log(images);

  return { images };
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
