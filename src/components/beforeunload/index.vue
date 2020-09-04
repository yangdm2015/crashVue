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
    
        registSw() {
            if (navigator.serviceWorker.controller !== null) {
                window.addEventListener("beforeunload", function () {
                    console.log('beforeunload')
                    // navigator.serviceWorker.controller.postMessage({
                    //     type: 'unload',
                    //     id: sessionId
                    // });
                });
            }
        },
        clearSw() {
            clearInterval(swIt)
        },
        reportSw() {
        

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