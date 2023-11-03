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

  const images = photos.map((x, i) => {
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

  if (!images.length) {
    return {
      url: null,
      filename: null,
      contentType: null,
    };
  }

  // TODO: Handle multiple images
  const image = images[(images.length * Math.random()) | 0];

  return { ...image };
};
