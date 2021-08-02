const { Lambda } = require("@aws-sdk/client-lambda");
const { DateTime } = require('luxon');
const { getAccessToken } = require('./auth');
const { searchPhotos } = require('./photos');

exports.handler = async (event) => {
  const { date: dateString } = event;

  const lambdaClient = new Lambda({ region: "eu-north-1" });

  const accessToken = await getAccessToken(process.env.GOOGLE_REFRESH_TOKEN);

  const date = DateTime.fromISO(dateString);

  console.log(date);

  const photos = await searchPhotos(accessToken, date);

  console.log(photos);

  const images = photos.map((x, i) => {
    const [_filename, extension] = x.filename.split(".");
    const updatedFilename = `${date.toFormat("yyyy-MM-dd")}/${i+1}.${extension}`;
    return { url: `${x.baseUrl}=w1024-h512-d`, filename: updatedFilename, contentType: x.mimeType }
  });

  console.log(images);

  // TODO: Handle multiple images
  const image = images.length ? images[0] : null;

  if (!image) {
    return { url: null }
  }

  const uploadPhotosParams = {
    FunctionName: "upload_photos",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify(image),
  };

  const { Payload } = await lambdaClient.invoke(uploadPhotosParams);

  const result = JSON.parse(Buffer.from(Payload));

  return { url: result.s3Url };
};