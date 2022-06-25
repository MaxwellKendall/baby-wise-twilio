const { set, add, isAfter, format, isBefore } = require('date-fns');

const today = new Date(Date.now());
const fivePm = set(today, { hours: 14, minutes: 59 });
const elevenPm = set(today, { hours: 22, minutes: 59 });

const template = {
    // number of feedings during weeks 1-2
    0: 9,
    // number of feedings during weeks 3-6
    3: 8,
    // number of feedings during weeks 7-10
    7: 7
};

// const birthday = set(new Date(), { month: 6, date: 27, hours: 00, minutes: 00 });
const birthday = set(new Date(), { month: 5, date: 25, hours: 00, minutes: 00 });
const schedule = Object
    .entries(template)
    .reduce((acc, [afterWeek, numberOfFeedingsPerDay]) => {
        const date = add(birthday, { weeks: afterWeek });
        acc.set(date, numberOfFeedingsPerDay);
        return acc;
    }, new Map());

const getDailyFeedings = () => {
    let dailyFeedings = null;
    const today = new Date();
    for(var [date, feedings] of schedule.entries()) {
        if (isAfter(today, date)) {
            dailyFeedings = feedings;
        };
    }
    return dailyFeedings;
}

const whichMerge = (dailyFeedings) => {
    if (dailyFeedings === 9) return 0;
    if (dailyFeedings === 8) return 1;
    if (dailyFeedings === 7) return 2;
}

const handleFirstTwoWeeks = () => {
    // -1 as we assume the first feeding is already done?
    const numberOfFeedingsToday = getDailyFeedings();
    const input = '9:00';
    const [hours, minutes] = String(input).split(':').map((s) => parseInt(s, 10));
    const msgs = [];
    let prevFeed = null;
    for (let i = 1; i <= numberOfFeedingsToday; i++) {
        let currentFeed = prevFeed
            ? add(prevFeed, { hours: 2, minutes: 30 })
            : set(today, { hours, minutes });
        if (prevFeed && isAfter(prevFeed, fivePm) && isBefore(prevFeed, elevenPm)) {
            currentFeed = add(prevFeed, { hours: 3 });
        }
        msgs.push(
            `Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')}`
        );
        prevFeed = currentFeed;
    }
    const msg = msgs.join('\n');
    console.log(msg);
}

handleFirstTwoWeeks();