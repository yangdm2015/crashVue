export function crashPage(time = 10) {
    let now = Date.now()
    console.log('开始占用')
    while (Date.now() - now < time * 1000) { }
    console.log('结束占用')
}
export function getMem() {
    let memory = window.performance.memory.usedJSHeapSize / 1024 / 1024; // 单位mb
    return memory.toFixed(2);
}
export function dateFormat(fmt, date) {
    let ret;
    let opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}
export function sendMessageToSw(msg) {
    navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage(msg);
}

export function getSwInfo() {
    if (navigator.serviceWorker.controller !== null) {
        navigator.serviceWorker.controller.postMessage({
            type: 'info'
        });
    }
}