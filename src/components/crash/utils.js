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
    return 'abcdefghigklmnopqrstuvwxyz' [index];
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