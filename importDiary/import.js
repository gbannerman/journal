const { putItem } = require('./db');
const parseGoogleDocsJson = require("parse-google-docs-json");
const { DateTime } = require("luxon");
 
async function readDiary() {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n');

    const parsed = await parseGoogleDocsJson({
        documentId: "1t3dNiJVg8oF14ro82Z-zf6Rh2Cf6iLV3JFsnMe0mUks",
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey,
    });
 
    return formatDiary(parsed.toJson());
}

const formatDiary = (parsedJson) => {
    const contentArray = parsedJson.content;

    const diary = [];

    let tripName = null;
    let entry = null;

    for (let content of contentArray) {

        if (content.h2) {
            tripName = content.h2;
        } else if (content.h3) {
            if (entry) {
                diary.push(entry);
            }
            const date = parseDate(content.h3);
            entry = { date };
        } else if (content.p && entry && entry.date) {
            if (entry.content) {
                entry = { ...entry, content: `${entry.content}\n${content.p}`, tripName };
            } else {
                entry = { ...entry, content: content.p, tripName };
            }
        } else if (content.ol && entry && entry.date) {
            const orderedList = content.ol.map((li, i) => `${i + 1}. ${li}`).join('\n');
            if (entry.content) {
                entry = { ...entry, content: `${entry.content}\n${orderedList}`, tripName };
            } else {
                entry = { ...entry, content: orderedList, tripName };
            }
        } else if (content.ul && entry && entry.date) {
            const unorderedList = content.ul.map((li) => `- ${li}`).join('\n');
            if (entry.content) {
                entry = { ...entry, content: `${entry.content}\n${unorderedList}`, tripName };
            } else {
                entry = { ...entry, content: unorderedList, tripName };
            }
        }
    }

    return diary;
}

const newFormat = (diary) => diary.map(x => ({
    year: parseInt(x.date.toFormat("yyyy"), 10),
    day: x.date.toFormat("MM-dd"),
    content: x.content,
    tripName: x.tripName,
}));

const parseDate = (dateString) => {
    const ordinalDateRegex = /(\d+)st|(\d+)nd|(\d+)rd|(\d+)th/g;
    const fixedDate = dateString.replace(ordinalDateRegex, "$1$2$3$4");

    let parsedDate = DateTime.fromFormat(fixedDate, "cccc d LLLL yyyy");

    if (parsedDate.isValid) {
        return parsedDate;
    }

    parsedDate = DateTime.fromFormat(fixedDate, "d LLLL yyyy");

    if (!parsedDate.isValid) {
        throw new Error("No valid date");
    }

    return parsedDate;
}

const addEntriesToDatabase = async (diary) => {
    diary.forEach(async (entry) => {
        await putItem(entry);
    });
};

const updateDatabaseWithDiaryEntries = async () => {
    const diary = await readDiary();
    const updated = newFormat(diary);
    await addEntriesToDatabase(updated);
}

module.exports = {
    updateDatabaseWithDiaryEntries
}