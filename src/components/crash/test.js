/*
 * @Author: yangshan
 * @Date: 2019-11-06 16:30:34
 * @LastEditTime: 2019-11-06 22:32:06
 * @LastEditors: Please set LastEditors
 * @Description: 检测并上报系统崩溃事件
 * @FilePath: /mall-fe-pc/src/utils/CrashReport/index.js
 */
import cpuUsage from './CpuUsage';
import defaultConfig from './config';

let uid = null;

/**
 * @description: 获取cookie
 * @param {name:cookie的名字}
 * @return:
 */
function getCookie(name) {
    let reg = new RegExp(`(^| )${name}=([^;]*)(;|$)`);
    let arr = document.cookie.match(reg);
    if (arr) {
        return unescape(arr[2]);
    }
    return null;
}


/**
 * @description: 获取页面内存使用量，用于评估页面崩溃原因
 * @param {type}
 * @return:
 */
function getMem(win) {
    if ((win || window).performance.memory) {
        let memory = (win || window).performance.memory.usedJSHeapSize / 1024 / 1024; // 单位mb
        return memory.toFixed(2);
    }
    return 3.14;
}

/**
 * @description: 使页面崩溃的函数，用来验证本工具工作正常
 * @param {type}
 * @return:
 */
async function crashPage() {
    if (localStorage.getItem('crashDebug')) {
        await new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 3000);
        });
        let a = [];
        for (let i = 0; i < 5000; i++) {
            /* eslint-disable */
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 30);
            });
            /* eslint-enable */
            let b = new Array(10000000);
            b.fill({});
            a.push(b);
        }
    }
}

function getSwInfo() {
    if (navigator.serviceWorker.controller !== null) {
        navigator.serviceWorker.controller.postMessage({
            type: 'info'
        });
    }
}

/**
 * @description: 获取页面唯一id
 * @param {type}
 * @return:
 */
function getId() {
    if (!uid) {
        let mis = getCookie('msid');
        let start = window.performance.timing.navigationStart;
        uid = `${mis}-pageHeartbeat-${start}`;
    }
    return uid;
}


/**
 * @description: 上报用于分析崩溃事件的相关信息的函数
 * @param {type}
 * @return:
 */
function crashInfo(params) {
    let body = {
        action: 'crash-report',
        pageUrl: location.href,
        ...params
    };
    return fetch('/api/resource/log', {
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        method: 'post',
    });
}

function msgGen({ memory, cpu }) {
    let memIn500 = Math.floor(memory / 500);
    let cpuIn50 = Math.floor(cpu / 50);
    return `浏览器内存使用大于${memIn500 * 500}MB,当前使用了${memory}MB;cpu使用指数大于${cpuIn50 * 50},当前为${cpu}`;
}


/**
 * @description: 崩溃上报工具类
 * @param {type}
 * @prop {
 *  config:{
 *    HEARTBEAT_INTERVAL : 本地心跳记录间隔，默认每五秒发一次心跳
 *    CRASH_THRESHOLD    : 认为页面已经崩溃的检测门限，默认超过11s没有心跳则认为页面已经崩溃
 *  },
 *  iframe : xx-layout-iframe对象，用来获取页面当前打开的tab等信息，用来辅助分析页面崩溃时的环境
 *  InterId : setInterval 的返回变量，用来 clear
 *  uid : 页面唯一标识
 * }
 * @return:
 */
class CrashReport {
    constructor(config) {
        this.setting(config);
        this.InterId = null;
        this.uid = getId();
    }

    setting(config) {
        // 最新的配置 - 覆盖上一次的配置 - 覆盖默认配置
        this.config = Object.assign({}, { ...defaultConfig }, this.config, config);
    }

    /**
     * @description: 初始化函数
     * 1、设置心跳记录
     * 2、检查是否有页面崩溃
     * 3、页面正常关闭/休眠时，清空记录
     * 4、页面从休眠中恢复时，初始化
     *
     * @param {type}
     * @return:
     */
    init(config) {
        this.setting(config);
        crashInfo({ id: this.uid, code: 1005, msg: '页面被打开(sw)' });
        if (top !== window) {
            // 如果当前在iframe中，就不记录心跳，因为在iframe中没有beforeunload事件
            return;
        }
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then(registration => {
                    crashInfo({ id: this.uid, code: 1009, msg: 'service Worker正常运行' });
                    console.log('service-worker registed');
                })
                .catch(error => {
                    console.log('service-worker registed error', error);
                });
        }
        this.setAlive();
        if (navigator.serviceWorker.controller !== null) {
            window.addEventListener('beforeunload', () => {
                console.log('beforeunload', this.uid);
                this.clearHeartBeat();
            });
        }
        this.recordsObj = null;
    }

    clearHeartBeat() {
        if (navigator.serviceWorker.controller !== null) {
            navigator.serviceWorker.controller.postMessage({
                type: 'unload',
                id: this.uid
            });
        }
    }

    /**
     * @description: 循环设置心跳记录
     * @param {type}
     * @return:
     */
    setAlive() {
        this.setAliveRecord();
        this.InterId = setInterval(() => {
            this.setAliveRecord();
        }, this.config.HEARTBEAT_INTERVAL);
    }

    /**
     * @description: 设置心跳记录
     * @param {type}
     * @return:
     */
    setAliveRecord() {
        // 设置记录基础信息
        let time = Date.now();
        let recordInfo = {};
        try {
            // 获取外部传入的信息
            recordInfo = this.config.getReportInfo();
        } catch (error) {

        }
        // let urls = this.iframe ? this.iframe.pages.map(i => i.url) : null;
        let memory = getMem(window);
        let pageUrl = location.href;
        let ua = navigator.userAgent;
        let value = { time, memory, pageUrl, ...recordInfo, ua };

        this.setRecord(this.uid, value);
    }

    /**
     * @description:在本地设置心跳记录
     * @param {type}
     * @return:
     */
    setRecord(pageKey, value) {
        // 设置记录累计信息
        try {
            this.recordsObj = this.buildRecord({ value, pageKey });
            if (navigator.serviceWorker.controller !== null) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'heartbeat',
                    id: this.uid,
                    data: this.recordsObj // 附加信息，如果页面 crash，上报的附加数据
                });
            }
        } catch (error) {
            crashInfo({ id: pageKey, code: 1004, msg: `写入心跳出错，错误信息：${error}` });
        }
    }


    /**
     * @description:心跳记录构建
     * @param {type}
     * @return:
     */
    buildRecord({ value, pageKey }) {
        let val = Object.assign({}, value);
        let recordsObj = this.recordsObj;
        let lastTime = 0;
        if (recordsObj) {
            lastTime = recordsObj.time;
            let recordArr = recordsObj.recordArr || [];
            let recordCount = recordsObj.recordCount || 0;
            let memory = getMem();
            let timeObj = { timeStamp: val.time, memory };
            let timePassd = (val.time - lastTime) / 1000;
            // 离上次记录间隔超过35s，或者内存使用超过300m,就开始记录cpu使用率指数
            if ((timePassd >= this.config.CPU_USAGE_RECORD_TIME_THRESHOLD
                || memory > this.config.CPU_USAGE_RECORD_MEMORY_THRESHOLD)
                && !cpuUsage.started) {
                cpuUsage.start();
            }
            if (cpuUsage.started) {
                let tmp = cpuUsage.getCpu();
                timeObj.cpuUsage = tmp;
            }
            recordArr.push(timeObj);
            if (recordArr.length > 10) {
                recordArr.shift();
            }
            recordCount++;
            val.recordCount = recordCount;
            val.recordArr = recordArr;
            val.msg = msgGen({ memory, cpu: timeObj.cpuUsage });
            if (localStorage.getItem('showCrashMsg')) {
                console.log(`将要把${pageKey}设置为${val.time},也就是${Date(val.time)},距离上次记录过去了${timePassd}秒,timeObj.cpuUsage = ${timeObj.cpuUsage}，memory = ${timeObj.memory}`);
            }
        } else {
            // 第一次始终开启
            cpuUsage.start();
        }
        return val;
    }
}

window.crashPage = crashPage;
const cr = new CrashReport();

window._cr = cr;
window.getSwInfo = getSwInfo;
export default cr;


// cpuUsage.start();
// setInterval(() => {
//     let tmp = cpuUsage.getCpu();
//     console.log('cpu = ', tmp);
// }, 1000);
