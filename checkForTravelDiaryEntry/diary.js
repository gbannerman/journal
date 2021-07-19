const { getItemsByKey } = require("./db");

const getEntryForDate = async (date) => {
    const day = date.toFormat("MM-dd");

    let items = null;

    try {
        items = await getItemsByKey("#day = :v1", { ":v1": day }, { "#day": "day" });
    } catch (e) {
        console.error(e);
    }

    console.log(items);
    return items;
}

module.exports = {
    getEntryForDate,
}
