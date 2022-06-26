const { set, add, sub, isAfter, format, isBefore } = require('date-fns');

const weeksOld = 23;
const daysOld = 1;
const today = set(new Date(Date.now()), { hours: 1 });
const threePm = set(today, { hours: 14, minutes: 59 });
const elevenPm = set(today, { hours: 22, minutes: 59 });
const tenPm = set(today, { hours: 20, minutes: 59 });
// const wakeTime = '7:00';
const birthday = sub(today, { weeks: weeksOld, days: daysOld })

const numberOfFeedingsByWeeksOld = {
    0: 9,
    2: 8,
    6: 7,
    9: 6,
    14: 5,
    23: 5,
};

const schedule = Object
    .entries(numberOfFeedingsByWeeksOld)
    .reduce((acc, [afterWeek, numberOfFeedingsPerDay], i) => {
        const mergeCount = i + 1;
        const date = add(birthday, { weeks: afterWeek });
        acc.set(date, [numberOfFeedingsPerDay, mergeCount]);
        return acc;
    }, new Map());

const getDailyFeedingsAndMergeCount = () => {
    let feedingsAndMergeCount = null;
    for(var [date, [feedings, mergeCount]] of schedule.entries()) {
        if (isAfter(today, date)) {
            feedingsAndMergeCount = [feedings, mergeCount];
        };
    }
    return feedingsAndMergeCount;
}

const handleFirstTwoWeeks = (wakeTime) => {
    // -1 as we assume the first feeding is already done?
    const numberOfFeedingsToday = getDailyFeedingsAndMergeCount()[0];
    const [hours, minutes] = String(wakeTime).split(':').map((s) => parseInt(s, 10));
    const msgs = [];
    let prevFeed = null;
    for (let i = 1; i <= numberOfFeedingsToday; i++) {
        let currentFeed = prevFeed
            ? add(prevFeed, { hours: 2, minutes: 30 })
            : set(today, { hours, minutes });
        if (prevFeed && isAfter(prevFeed, threePm) && isBefore(prevFeed, elevenPm)) {
            currentFeed = add(prevFeed, { hours: 3 });
        }
        msgs.push(
            `Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')}`
        );
        prevFeed = currentFeed;
    }
    const msg = [''].concat(msgs).join('\n');
    return msg;
}

const handleAfterFirstTwoWeeks = (wakeTime) => {
    // -1 as we assume the first feeding is already done?
    const numberOfFeedingsToday = getDailyFeedingsAndMergeCount()[0];
    const [hours, minutes] = String(wakeTime).split(':').map((s) => parseInt(s, 10));
    const msgs = [];
    let prevFeed = null;
    for (let i = 1; i <= numberOfFeedingsToday; i++) {
        let currentFeed = prevFeed
            ? add(prevFeed, { hours: 2, minutes: 30 })
            : set(today, { hours, minutes });
        if (prevFeed && isAfter(prevFeed, tenPm)) {
            currentFeed = add(prevFeed, { hours: 4 });
        }
        msgs.push(
            `Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')}`
        );
        prevFeed = currentFeed;
    }
    const msg = [''].concat(msgs).join('\n');
    return msg;
}

const handleFourthAndFifth = (isFifth, wakeTime) => {
    // -1 as we assume the first feeding is already done?
    const numberOfFeedingsToday = getDailyFeedingsAndMergeCount()[0];
    const [hours, minutes] = String(wakeTime).split(':').map((s) => parseInt(s, 10));
    const msgs = [];
    let prevFeed = null;
    for (let i = 1; i <= numberOfFeedingsToday; i++) {
        let currentFeed = prevFeed
            ? add(prevFeed, { hours: 3, minutes: 0 })
            : set(today, { hours, minutes });
        if (isFifth && i === 3) {
            msgs.push(`Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')} ** CATNAP **`);
        } else if (i === 4) {
            msgs.push(`Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')} **NO SLEEP TIL BEDTIME**`);
        } else {
            msgs.push(`Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')}`)
        }
        prevFeed = currentFeed;
    }
    if (isFifth) {
        msgs.push(`👆 Mid afternoon adds catnap! (pg 102)`)
    } else {
        msgs.push(`👆 Late afternoon excludes nap and adds waketime! (pg 101)`)
    }
    const msg = [''].concat(msgs).join('\n');
    return msg;
}

handleSixth = (wakeTime) => {
    const numberOfFeedingsToday = getDailyFeedingsAndMergeCount()[0];
    const [hours, minutes] = String(wakeTime).split(':').map((s) => parseInt(s, 10));
    const msgs = [];
    let prevFeed = null;
    for (let i = 1; i <= numberOfFeedingsToday; i++) {
        let currentFeed = prevFeed
            ? add(prevFeed, { hours: 3, minutes: 0 })
            : set(today, { hours, minutes });
        msgs.push(
            i === 4
                ? `Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')} waketime + dinner + more waketime`
                : `Feeding Number ${i} -- ${format(currentFeed, 'hh:mm bbbb')}`
        );
        prevFeed = currentFeed;
    }
    msgs.push(`👆 Late afternoon includes lots of wake time! (pg 103)`)
    const msg = [''].concat(msgs).join('\n');
    return msg;
}


const handleInput = (wakeTime) => {
    const mergeCount = getDailyFeedingsAndMergeCount()[1];
    if (mergeCount === 0) {
        return handleFirstTwoWeeks(wakeTime);
    } else if (mergeCount === 4 || mergeCount === 5) {
        return handleFourthAndFifth(mergeCount === 5, wakeTime);
    } else if (mergeCount > 5) {
        return handleSixth(wakeTime);  
    } else {
        return handleAfterFirstTwoWeeks(wakeTime);
    }
}

exports.handler = function (context, event, callback) {
    const twiml = new Twilio.twiml.MessagingResponse();
    const wakeTime = event.Body;
    let msg = 'Please respond with Nelson\'s wake time in the following format: h:mm; ie, 6:30';
    if (wakeTime.includes(':')) {
        msg = handleInput(wakeTime);
    }
    twiml.message(msg);
    callback(null, twiml);
};
