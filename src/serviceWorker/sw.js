self.addEventListener('install', function (event) {
    console.log('######### sw 已安装123  install');
});
self.skipWaiting()
self.addEventListener('activate', function (event) {
    console.log('######### sw 已激活 activate');
    self.clients.claim();
});

// const CHECK_CRASH_INTERVAL = 4 * 1000; // 每 4s 检查一次
// const CRASH_THRESHOLD = 17 * 1000; // 7s 超过7s没有心跳则认为已经 crash
// let pages = {};
// let timer;
// timer = setInterval(function () {
//     checkCrash();
// }, CHECK_CRASH_INTERVAL);
// let lastTime = null
// function crashReport(body) {
//     return fetch('/crash/report', {
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//         method: 'post',
//     });
// }

// function checkCrash() {
//     const now = Date.now();
//     if ((now - lastTime) > CRASH_THRESHOLD) {
//         // 此时认为计算机休眠了,清空记录
//         console.log('pages = ', pages)
//         let ids = Object.keys(pages).map(key => pages[key].id).join(',');
//         console.log({ id: ids, code: 1011, msg: '计算机从休眠中恢复，sw即将清空记录' })
//         pages = {};
//     }
//     for (var id in pages) {
//         let page = pages[id];

//         if (now - page.t > CRASH_THRESHOLD) {
//             console.log('将要上报崩溃', id, `此时是${new Date()},距离上次上报，过去了${(now - lastTime) / 1000}秒`);
//             crashReport({ id, crash: true, timePassed: (now - page.t) / 1000 });
//             delete pages[id];
//         } else {
//             console.log('将要上报正常', id, `此时是${new Date()},距离上次上报，过去了${(now - lastTime) / 1000}秒`);
//             crashReport({ id, crash: false, timePassed: (now - page.t) / 1000 });
//         }
//     }
//     lastTime = now
// }

// self.addEventListener('message', e => {
//     const data = e.data;
//     if (data.type === 'heartbeat') {
//         pages[data.id] = {
//             t: Date.now(),
//         };
//         if (!timer) {
//             // timer = setInterval(function() {
//             //     checkCrash();
//             // }, CHECK_CRASH_INTERVAL);
//         }
//     } else if (data.type === 'unload') {
//         delete pages[data.id];
//     }
// });
let lastTime = Date.now()
let record = {}
let TIMOUT_SECONDS = 30
let INTERVAL_SPACE = 5
function report({ msg }) {
    console.log(msg)
}

function msgGen(ttl) {
    let ttlIn5 = Math.floor(ttl / INTERVAL_SPACE);
    let ttlMsg = ttlIn5 ? `往返时延TTL大于${ttlIn5 * INTERVAL_SPACE},当前为${ttl}` : '';
    return ttlMsg
}

function getRttInSec(last, now) {
    if (typeof last === 'number' && typeof now === 'number') {
        return ((now - last) / 1000).toFixed(2)
    }
    return 314
}
function rttReport(clientData) {
    let lastTtl = clientData.rttList.slice(-1)[0].rtt
    if (lastTtl < INTERVAL_SPACE) {
        return
    } else {
        let msg = msgGen(lastTtl)
        let pageUrl = clientData.client.url
        let code = 1019
        report({ msg, pageUrl, code })
    }
}


self.addEventListener('message', e => {
    let id = e.source.id
    let clientData = record[id]
    let type = e.data.type
    let data = e.data.data
    switch (type) {
        case 'heartbeat':
            // console.log('data = ', data)
            let now = Date.now();
            let last = clientData.lastSendTime;
            let timePassed = getRttInSec(last, now)

            clientData.rttList.push({
                time: now,
                rtt: timePassed
            });
            clientData.rttCount = clientData.rttCount ? clientData.rttCount + 1 : 1
            if (clientData.rttList.length > 20) {
                clientData.rttList.shift()
            }
            clientData.lastResponseTime = now
            rttReport(clientData)
            break;
        case 'info':
            console.log('record = ', record)
            break;
        default:
            break;
    }
});
setInterval(() => {
    let now = Date.now()
    // console.log(`此时是${new Date(now)},距离上次打点，过去了${(now - lastTime) / 1000}秒`);
    lastTime = now
    // 只获取同源的所有clients
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(cList => {
        // 可见的window收集心跳
        let now = Date.now();
        cList.forEach(c => {
            let id = c.id
            // record[id]有三种情况 1. undefined 表示尚未初始化。 2.对象，表示已经初始化 3. null表示已经超时
            // 对应三种处理
            // 1.初始化 2.查看是否已超时 3.不做任何处理，等待回收进程
            if (!record[id]) {
                if (record[id] === null) {
                    // 如果记录超时，直接返回
                    return
                }
                // 如果记录不存在，就初始化，并发送健康检查
                record[id] = { rttList: [], client: c }
                c.postMessage({ type: 'healthCheck' })
                record[id].lastSendTime = now
            } else {
                // 如果记录存在，检查页面响应健康检查时间间隔
                let lrt = record[id].lastResponseTime
                let lst = record[id].lastSendTime
                if (!lrt) {
                    // 如果一次都没有响应，检查距离上次发送时间是否大于超时门限
                    let timePassed = getRttInSec(lst, now)
                    if (timePassed > TIMOUT_SECONDS) {
                        // 大于门限，记为超时
                        record[id] = null
                    }
                    // 小于门限，继续等待
                    return
                }

                // 如果已经有响应记录，则检查最后一次响应记录的时间距离现在是否超过门限
                let timePassed = getRttInSec(lrt, now)
                if (timePassed > TIMOUT_SECONDS) {
                    // 如果超过门限,就标记为无响应
                    // 无响应，有几种情况：1.卡死 2.正常退出 3.最初就没有回应
                    // 无响应的client标记为null，并返回，等待清理程序处理
                    record[id] = null
                    return
                } else if (lrt >= lst) {
                    // 如果小于门限，则看上一次的健康检查是否已有响应
                    // 如果已有响应，则继续发送下一次健康检查
                    c.postMessage({ type: 'healthCheck' })
                    record[id].lastSendTime = now
                } else {
                    // 如果没有响应，则继续等待
                    return
                }
            }

        })

    })
}, INTERVAL_SPACE * 1000)

// 清理循环，当检测到record无响应时，初始化该页面
setInterval(() => {
    Object.keys(record).forEach(id => {
        if (record[id] === null) {
            delete record[id]
        }
    })
}, 5 * 60 * 1000)