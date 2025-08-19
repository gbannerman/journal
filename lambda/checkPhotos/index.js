const { DateTime } = require("luxon");
const { searchImmichPhotos } = require("./immich");

exports.handler = async (event) => {
  const { date: dateString } = event;

  const date = DateTime.fromISO(dateString);

  console.log(date);

  let photoResults = [];

  try {
    photoResults = await searchImmichPhotos(date);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return {
      images: [],
    };
  }

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
      case "IMMICH":
        return mapImmichImage(x, filename);
    }
  });

  images.sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
  );

  console.log(images);

  return { images };
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function mapImmichImage(image, filename) {
  const [_filename, extension] = image.originalFileName.split(".");
  const updatedFilename = `${filename}.${extension.toLowerCase()}`;
  const createdAt =
    image.exifInfo?.dateTimeOriginal ?? image.fileCreatedAt ?? null;
  return {
    id: image.id,
    filename: updatedFilename,
    contentType: image.originalMimeType,
    source: "IMMICH",
    createdAt: createdAt ? DateTime.fromISO(createdAt) : null,
  };
}
