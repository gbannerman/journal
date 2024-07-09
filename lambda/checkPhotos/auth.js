const { default: axios } = require("axios");

const getAccessToken = async (refreshToken) => {
  let accessToken = null;

  try {
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    accessToken = data.access_token;
  } catch (err) {
    console.log(err);
  }

  return accessToken;
};

module.exports = {
  getAccessToken,
};
