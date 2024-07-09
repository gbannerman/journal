const { DateTime } = require("luxon");
const { getAccessToken } = require("./auth");
const { searchGooglePhotos } = require("./google");
const { searchImmichPhotos } = require("./immich");

exports.handler = async (event) => {
  const { date: dateString } = event;

  const accessToken = await getAccessToken(process.env.GOOGLE_REFRESH_TOKEN);

  const date = DateTime.fromISO(dateString);

  console.log(date);

  const googlePhotos = searchGooglePhotos(accessToken, date);
  const immichPhotos = searchImmichPhotos(date);

  const photoResults = await Promise.all([googlePhotos, immichPhotos]);

  const photos = photoResults.flat();

  console.log(photos);

  if (!photos.length) {
    return {
      images: [],
    };
  }

  shuffleArray(photos);

  const images = photos.slice(0, 5).map((x, i) => {
    const filename = `${date.toFormat("yyyy-MM-dd")}/${i + 1}`;
    switch (x.source) {
      case "GOOGLE":
        return mapGooglePhotosImage(x, filename);
      case "IMMICH":
        return mapImmichImage(x, filename);
    }
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

function mapGooglePhotosImage(image, filename) {
  const [_filename, extension] = image.filename.split(".");
  const updatedFilename = `${filename}.${extension.toLowerCase()}`;
  return {
    url: `${image.baseUrl}=w1024-h512-d`,
    filename: updatedFilename,
    contentType: image.mimeType,
    source: "GOOGLE",
  };
}

function mapImmichImage(image, filename) {
  const [_filename, extension] = image.originalFileName.split(".");
  const updatedFilename = `${filename}.${extension.toLowerCase()}`;
  return {
    id: image.id,
    filename: updatedFilename,
    contentType: image.originalMimeType,
    source: "IMMICH",
  };
}
