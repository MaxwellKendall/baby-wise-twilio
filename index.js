const { set, add, sub, isAfter, format, isBefore } = require('date-fns');

const weeksOld = 23;
const daysOld = 1;
const today = set(new Date(Date.now()), { hours: 1 });
const threePm = set(today, { hours: 14, minutes: 59 });
const elevenPm = set(today, { hours: 22, minutes: 59 });
const tenPm = set(today, { hours: 20, minutes: 59 });
const wakeTime = '7:00';
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

const handleFirstTwoWeeks = () => {
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
    const msg = msgs.join('\n');
    console.log(msg);
}

const handleAfterFirstTwoWeeks = () => {
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
    const msg = msgs.join('\n');
    console.log(msg);
}

const handleFourthAndFifth = (isFifth) => {
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
    const msg = msgs.join('\n');
    console.log(msg);
}

handleSixth = () => {
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
    const msg = msgs.join('\n');
    console.log(msg);
}


const main = () => {
    const mergeCount = getDailyFeedingsAndMergeCount()[1];
    console.log('mergeCount', mergeCount)
    if (mergeCount === 0) {
        handleFirstTwoWeeks();
    } else if (mergeCount === 4 || mergeCount === 5) {
        handleFourthAndFifth(mergeCount === 5);
    } else if (mergeCount > 5) {
        handleSixth();  
    } else {
        handleAfterFirstTwoWeeks();
    }
}

main();