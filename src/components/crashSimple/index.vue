<template>
    <div>
        <el-form label-width="100px">
            <el-row>
                <el-button type="primary" @click="crashPage">点击开始crash浏览器</el-button>
                <span>
                    此时内存占用为
                    <span class="start">{{memory}}</span> MB,浏览器崩溃倒计时
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
        </el-form>
    </div>
</template>
<script>

let HEARTBEAT_INTERVAL = 5 * 1000; // 每五秒发一次心跳

import { getMem, uuid, wait4gc, setAliveRecord, crashPage, clearAliveRecord, checkCrach } from '@/utils'
let sessionId = null
let swIt = null
window.addEventListener("beforeunload", function () {
    console.log('beforeunload', sessionId)
    clearAliveRecord(sessionId)
});

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
            crashedPages: []
        }
    },
    created() {
        if (!this.start) {
            setInterval(() => {
                let memory = getMem();
                this.memory = memory.toFixed(2)
            }, 1000)
        }
        // this.registSw()
        this.setAlive()
        this.getCrashReport()
        this.checkCrach()
    },
    methods: {
        checkCrach() {

        },
        getCrashReport() {
            fetch('/crash/records').then(rsp => {
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
        clearSw() {
            clearInterval(swIt)
        },
        setAlive() {
            swIt = setInterval(function () { setAliveRecord(sessionId) }, HEARTBEAT_INTERVAL);
        },
        crashPage
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