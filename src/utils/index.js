export function uuid(id) {
    id = id ? id : getId()
    return '' + id + '-' + new Date().getTime();
}
export function getMem() {
    let memory = window.performance.memory.usedJSHeapSize / 1024 / 1024; // 单位mb
    return memory;
}
let rowLen = 100;
let colLen = 20000000;
const CRASH_THRESHOLD = 7 * 1000; // 7s 超过7s没有心跳则认为已经 crash

export async function wait4gc(time = 3) {
    let memory = getMem();
    // console.log('before gc, memory = ', memory);
    // console.log('after gc, memory = ', memory);
    return new Promise((resolve, rejcet) => {
        setTimeout(() => {
            resolve('ok');
        }, time * 1000);
    });
}

function getChar() {
    let index = Math.floor(Math.random() * 26);
    return 'abcdefghigklmnopqrstuvwxyz'[index];
}
export function getId(length = 3) {
    if (isNaN(length)) {
        return 'err';
    }
    return new Array(length)
        .fill('')
        .map(getChar)
        .join('');
}

export function heartbeat(sessionId) {
    // console.log(' in heartbeat')
    navigator.serviceWorker.controller.postMessage({
        type: 'heartbeat',
        id: sessionId,
        data: {} // 附加信息，如果页面 crash，上报的附加数据
    });
}
function setRecord(pageKey, value) {
    let crashRecords = {}
    try {
        let recordsStr = localStorage.getItem('crashRecords')
        let recordsObj = JSON.parse(recordsStr)
        if (recordsObj) {
            crashRecords = recordsObj
        }

        crashRecords[pageKey] = value
        localStorage.setItem('crashRecords', JSON.stringify(crashRecords))
    } catch (error) {
        console.log('出错了', error)
    }
}
function crashReport(body) {
    return fetch('/crash/report', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        method: 'post',
    });
}
function clearRecord(pageKey) {
    let crashRecords = {}
    try {
        let recordsStr = localStorage.getItem('crashRecords')
        let recordsObj = JSON.parse(recordsStr)
        if (recordsObj) {
            crashRecords = recordsObj
        }

        if (crashRecords[pageKey]) {
            delete crashRecords[pageKey]
        }

        localStorage.setItem('crashRecords', JSON.stringify(crashRecords))
    } catch (error) {
        console.log('出错了', error)

    }
}


export function checkCrach() { } {
    let now = Date.now()
    try {
        let recordsStr = localStorage.getItem('crashRecords')
        let recordsObj = JSON.parse(recordsStr)
        Object.keys(recordsObj).forEach(pageKey => {
            let pageTime = recordsObj[pageKey]
            if (now - pageTime > CRASH_THRESHOLD) {
                // 超过门限
                crashReport({ id: pageKey, crash: true, timePassed: (now - pageTime) / 1000 });
                clearRecord(pageKey)
                // db5589393d56de456f2f9f6edfb5aeb3f04c55fa
            }
        })
    } catch (error) {

    }
}

export function setAliveRecord(sessionId) {
    let time = Date.now()
    setRecord(sessionId, time)
}
export function clearAliveRecord(sessionId) {
    clearRecord(sessionId)
}
var a = []
export async function crashPage(time) {
    if (typeof time !== 'number') {
        time = 5000
    }
    console.log('time = ', time)
    setInterval(() => {
        if (this.second > 0) {
            this.second--
        }
    }, 1000)
    for (var i = 0; i < time; i++) {
        let memory = getMem();
        this.memory = memory.toFixed(2)
        console.log('memory = ', memory);
        await wait4gc(0.01);
        // }
        var b = new Array(10000000)
        b.fill({ a: 1 })
        a.push(b)
    }
}

export function gc() {
    console.log("start,a.length = ", a.length)
    let c = Date.now()
    while (a.length) {
        a[a.length - 1] = null
        a.pop()
    }
    console.log("end", Date.now() - c)

}

export function ca() {
    console.log('a = ', a)
}