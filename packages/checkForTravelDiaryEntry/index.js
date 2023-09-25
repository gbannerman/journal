const { Lambda } = require("@aws-sdk/client-lambda");
const { DateTime } = require("luxon");
const { getEntryForDate } = require("./diary");

exports.handler = async () => {
  const lambdaClient = new Lambda({ region: "eu-north-1" });

  const day = DateTime.now();

  console.log(`Getting entries for ${day.toISODate()}`);

  const entries = await getEntryForDate(day);

  const formattedDay = day.toFormat("d MMMM");

  const formattedEntries = entries.map((x) => ({
    ...x,
    yearsAgo: parseInt(day.toFormat("yyyy")) - x.year,
  }));

  if (entries.length) {
    const checkPhotosParams = formattedEntries.map((x) => ({
      FunctionName: "checkPhotos",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ date: `${x.year}-${x.day}` }),
    }));

    const lambdaResults = await Promise.all(
      checkPhotosParams.map((x) => lambdaClient.invoke(x))
    );

    const results = lambdaResults.map(
      ({ Payload, FunctionError, StatusCode }, index) => {
        console.info(
          checkPhotosParams[index].Payload,
          StatusCode,
          FunctionError,
          Buffer.from(Payload).toString()
        );
        return JSON.parse(Buffer.from(Payload));
      }
    );

    console.log(results);

    results.forEach((x, i) => {
      if (x.url) {
        formattedEntries[i].url = x.url;
      }
    });

    const params = {
      FunctionName: "sendOnThisDayEmail",
      InvocationType: "Event",
      Payload: JSON.stringify({ formattedEntries, formattedDay }),
    };

    await lambdaClient.invoke(params);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(formattedEntries),
  };

  return response;
};
