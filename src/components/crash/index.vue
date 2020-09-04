<template>
    <div>
        <el-form label-width="100px">
            <el-row>
                <el-button type="primary" @click="crashPage">点击开始crash浏览器</el-button>
                <span>
                    此时内存占用为
                    <span class="start">{{memory}}</span> MB,CPU使用指数是
                    <span class="start">{{cpuUsage}}</span> ,浏览器崩溃倒计时
                    <span class="start">{{second}}</span> 秒
                </span>
            </el-row>
            <el-row>
                <el-col :span="8" :offset="8">
                    <el-form-item label="页面id是">
                        {{id}}
                        <el-button @click="clearSw">点击清除上报</el-button>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row>
                <el-col :span="8" :offset="8">
                    <el-form-item label="崩溃的页面有">
                        {{crashedPages}}
                        <el-button @click="getCrashReport">点击获取</el-button>
                        <el-button @click="clearCrashReport">点击清空</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8" :offset="8">
                    <el-form-item label="展示cpu使用率">
                        {{cpuUsage}}
                        <div>
                            <el-button @click="startCpuMea">点击开始统计</el-button>
                            <el-button @click="stopCpuMea">点击清空</el-button>
                        </div>
                        <div>
                            <el-button @click="crashPage(10)">点击开始消耗cpu</el-button>
                            <el-button @click="gc">点击gc</el-button>
                        </div>
                        <div>
                            <el-button @click="ca">点击查看a</el-button>
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-button @click="block(10)">点击开始阻塞js进程10s钟</el-button>
                <el-button @click="block(60)">点击开始阻塞js进程60s钟</el-button>
            </el-row>
        </el-form>
        <div
            style="border: 1px solid red ; width: 100px ; height: 100px ;text-align: center;line-height: 100px;"
            draggable="true"
            id="dragEle"
        ></div>
    </div>
</template>
<script>
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker
//             // .register('/sw-report-crash', { scope: '/' })
//             .register('sw.js', { scope: '/' })
//             .then(registration => {
//                 console.log('service-worker registed');
//             })
//             .catch(error => {
//                 console.log('service-worker registed error', error);
//             });
//     });
// }
let HEARTBEAT_INTERVAL = 5 * 1000; // 每五秒发一次心跳
import { getMem, uuid, wait4gc, heartbeat, crashPage, gc, ca } from '@/utils'
import cpuMea, { consumeCpu } from './cpuMea'
let sessionId = null
let swIt = null
let timer = null
let lastRecordTime = Date.now()
export default {
    data() {
        let id = uuid()
        sessionId = id
        return {
            currentDate: new Date(),
            start: false,
            second: 15,
            memory: 0,
            id,
            crashedPages: [],
            cpuUsage: 0
        }
    },
    created() {
        if (!this.start) {
            setInterval(() => {
                let memory = getMem();
                this.memory = memory.toFixed(2)
                let now = Date.now()
                let timePass = ((now - lastRecordTime) / 1000).toFixed(2)
                this.cpuUsage = cpuMea.getCpu()
                // console.log('我是定时器线程回调函数，距离上次执行过去了', timePass, '秒')
                lastRecordTime = Date.now()

            }, 1000)
        }
        // this.registSw()
        // this.reportSw()
        this.getCrashReport()
        if (!cpuMea.stared) {
            cpuMea.start()
        }
    },
    methods: {
        consumeCpu, gc, ca,
        block(time = 5) {
            let start = Date.now()
            console.log('开始占用')
            while ((Date.now() - start) < time * 1000) {

            }
            console.log('停止占用')
        },
        startCpuMea() {
            cpuMea.start()
            timer = setInterval(() => {
                this.cpuUsage = cpuMea.getCpu()
            }, 500)
        },
        stopCpuMea() {
            cpuMea.stop()

        },
        getCrashReport() {
            fetch('/crash/records').then(rsp => {
                // console.log('崩溃记录返回：', rsp)
                // console.log(' typeof rsp', typeof rsp)
                rsp.json().then(r2 => {
                    console.log('崩溃记录返回2：', r2)
                    let data = r2.data || {}
                    let all = Object.keys(data).reduce((prev, key) => {
                        prev.push({ pageId: key, state: data[key] })
                        return prev
                    }, [])
                    console.log('所有记录', all)
                    this.crashedPages = all.filter(i => i.state === 'true').map(i => i.pageId)
                })
                // if(rsp)
            })
        },
        clearCrashReport() {
            fetch('/crash/clear').then(rsp => {
                console.log('清空返回', rsp)
                this.getCrashReport()
            })
        },
        registSw() {
            if (navigator.serviceWorker.controller !== null) {
                window.addEventListener("beforeunload", function () {
                    console.log('beforeunload', sessionId)
                    navigator.serviceWorker.controller.postMessage({
                        type: 'unload',
                        id: sessionId
                    });
                });
            }
        },
        clearSw() {
            clearInterval(swIt)
        },
        reportSw() {
            swIt = setInterval(function () { heartbeat(sessionId) }, HEARTBEAT_INTERVAL);
            // heartbeat(sessionId);
            // 页面 JavaScript 代码
            // console.log('navigator.serviceWorker.controller = ', navigator.serviceWorker.controller)

        },
        crashPage,

    }
}
</script>
<style lang="scss">
.start {
    color: red;
    font-size: 32px;
    font-weight: 700;
}
</style>