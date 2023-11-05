const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({ region: "eu-north-1" });

const uploadFile = async (filename, body) => {
  const command = new PutObjectCommand({
    Bucket: process.env.PHOTOS_BUCKET_NAME,
    Key: filename,
    Body: body,
    ACL: "public-read",
    ContentType: "text/html",
    Tagging: "meta=true",
  });

  await client.send(command);
};

module.exports = {
  uploadFile,
};
