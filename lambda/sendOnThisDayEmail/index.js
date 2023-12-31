const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const ses = new SESClient({ region: "eu-north-1" });

exports.handler = async function (event) {
  const { entries, formattedDate } = event;

  const bucketUrl = new URL(`https://${process.env.BUCKET_DOMAIN_NAME}`);

  return ses.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: ["bannermangavin@gmail.com"],
      },
      Message: {
        Body: {
          Html: { Data: buildEmailBody(entries, bucketUrl) },
        },

        Subject: { Data: `${formattedDate}: On this day...` },
      },
      Source: "Holleedate <journal@hollee.date>",
    })
  );
};

const buildEmailBody = (entries, bucketUrl) => {
  const summaryUrl = new URL(bucketUrl);
  summaryUrl.pathname = "/meta/summary.html";

  const buildEntryImages = (entry) => {
    if (!entry.images?.urls || !entry.images?.urls?.length) {
      return "";
    }

    return entry.images.urls
      .map(
        (url) =>
          `<tr><td class="article-content" style="padding: 0 0 20px 30px; text-align: center;"><img style="width: 100%;" src="${url}"/></td></tr>`
      )
      .join("");
  };

  const buildEntry = (entry) => {
    return `<table align="center" border="0" width="640" cellpadding="0" cellspacing="0" class="container" style="width: 640px;"><tr><td><table class="container" align="left" border="0" width="400" cellpadding="0" cellspacing="0" style="width: 400px;"><tr><td class="article-button" style="padding: 20px 0 20px 30px;"><table align="left" border="0" width="125" cellpadding="0" cellspacing="0" style="width: 140px; text-align: center;"><tr><td style="border: 2px solid #05204a; padding: 8px;"> <div style="text-decoration: none; color: #05204a; font-weight: bold; font-family: 'Noto sans', sans-serif; text-transform: uppercase; font-size: 14px;">${formatYearsAgo(
      entry.yearsAgo
    )}</div><img style="margin-top:10px;width:100%" alt="${entry.country.toLowerCase()} flag" src="https://raw.githubusercontent.com/hampusborgos/country-flags/main/png250px/${entry.country.toLowerCase()}.png"/></td></tr></table></td></tr><tr><td class="article-title" style="padding: 0 0 15px 30px; font-size: 22px; font-weight: bold; text-align: left; font-family: 'Noto sans';"><span style="color: #05204a; text-decoration: none;">${
      entry.tripName
    }</span></td></tr><tr><td class="article-content" style="padding: 0 0 20px 30px;text-align:justify;line-height:22px;color:#05204a;">${
      entry.content
    }</td></tr>${buildEntryImages(
      entry
    )}<tr><td class="article-button" style="padding: 0 0 20px 30px; text-align: center;"><a class="button-link" target="_blank" rel="noreferrer" href="${summaryUrl.toString()}">View Summary</a></td></tr></table></td></tr></table>`;
  };

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" /><title>holleedate</title><link href="https://fonts.googleapis.com/css?family=Inter:wght@400;700" rel="stylesheet" type="text/css"><link href="https://fonts.googleapis.com/css?family=Noto+Sans:400,700,400italic,700italic" rel="stylesheet" type="text/css"><!--[if gte mso 15]><style type="text/css">table{font-size:1px;line-height:0;mso-margin-top-alt:1px;mso-line-height-rule:exactly}*{mso-line-height-rule:exactly}</style><![endif]--><style type="text/css">/*<![CDATA[*/html,body{margin:0 !important;padding:0 !important;height:100% !important;width:100% !important;font-family:'Inter',sans-serif;color:#05204a;}*{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}div[style*="margin: 16px 0"]{margin:0 !important}table,td{mso-table-lspace:0pt !important;mso-table-rspace:0pt !important}table{border-spacing:0 !important;border-collapse:collapse !important;table-layout:fixed !important;margin:0 auto !important}table table table{table-layout:auto}img{-ms-interpolation-mode:bicubic}.yshortcuts a{border-bottom:none !important}.mobile-link--footer a,a[x-apple-data-detectors]{color:inherit !important;text-decoration:underline !important}.logo{margin-top:30px !important}@media (max-width: 700px){.container{width:100% !important}.container-outer{padding:0 !important}.logo{float:none;text-align:center}.header-title{text-align:center !important;font-size:32px !important}.header-divider{padding-bottom:60px !important;text-align:center !important}.article-thumb,.article-title,.article-button{text-align:center !important;padding-left:15px !important}.article-content{text-align:justify !important;padding:0 25px 20px 25px !important}.article-thumb{padding:30px 0 15px 0 !important}.article-title{padding:0 0 15px 0 !important}.article-button{padding:0 0 20px 0 !important}.article-button>table{float:none}.footer-copy{text-align:center !important}.social{padding:10px 0 0 0 !important}.social>table{float:none}}a.button-link{display: inline-block;background-color: #05204a;color: white;padding: 0.8em 1.2em;position: relative;text-decoration: none;border-radius: 5px;margin: 25px;}</style></head><body style="margin: 0; padding: 0;" bgcolor="#f5f5f5" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0"><table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" bgcolor="#f5f5f5"><tr><td class="container-outer" align="center" valign="top" style="padding: 30px 0 30px 0;"><table border="0" width="700" cellpadding="0" cellspacing="0" bgcolor="#f5f5f5" class="container" style="width: 700px;"><tr><td style="border-top: 10px solid #F15156;"><table align="center" border="0" width="640" cellpadding="0" cellspacing="0" class="container" style="width: 640px;"><tr><td style="text-align: center;"><img style="width: 80%;" src="https://raw.githubusercontent.com/gbannerman/journal/main/logo.png"/></td></tr></table></td></tr></table><table align="center" border="0" width="640" cellpadding="0" cellspacing="0" class="container" style="width: 640px;"><tr><td class="header-title" style="padding: 60px 0 20px 0; font-weight: bold; font-size: 45px; font-family: 'Noto sans', sans-serif; text-align: left;">On This Day</td></tr><tr><td class="header-divider" style="padding-bottom: 90px; text-align: left;"><img src="https://raw.githubusercontent.com/Slicejack/briar-email/master/img/divider-110x6.jpg"></td></tr></table>${entries
    .map((x) => buildEntry(x))
    .join(
      ""
    )}<table align="center" border="0" width="700" cellpadding="0" cellspacing="0" class="container" style="width: 700px; background-color: #F15156;"><tr><td style="padding: 40px 0 40px 0;"><table class="container" align="left" width="225" border="0" cellpadding="0" cellspacing="0" style="width: 225px;"><tr><td class="footer-copy" style="text-transform: uppercase; text-align: right; font-size: 10px; color: #ffffff; font-family: 'Noto sans', sans-serif; padding: 5px 0 0 0;">Powered by hollee.date</td></tr></table><table class="container" align="left" width="400" border="0" cellpadding="0" cellspacing="0" style="width: 400px;"><tr><td class="social" style="padding-left: 30px;"><table align="left" border="0" cellpadding="0" cellspacing="0"><tr><td><a href="https://github.com/gbannerman"><img border="0" width="40" style="border-radius: 6px;" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"></a></td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>`;
};

const formatYearsAgo = (yearsAgo) =>
  `${yearsAgo} ${yearsAgo > 1 ? "years" : "year"} ago`;
