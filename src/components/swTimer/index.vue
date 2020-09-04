<template>
    <div>
        <div>
            内存占用量为
            <span class="red">{{memory}}MB</span>
            现在时间是
            <span class="red">{{dateFormat('HH:MM:SS',time)}}</span>
        </div>
        <el-button @click="crashPage(10)">点击开始消耗cpu 10s</el-button>
        <div>渲染进程检查</div>
        <div
            style="background:red ; width: 100px ; height: 100px ;text-align: center;line-height: 100px;"
            draggable="true"
            id="dragEle"
        ></div>
        <div>
            <el-table :data="tableData" style="width: 100%">
                <el-table-column prop="date" label="日期" width="180"></el-table-column>
                <el-table-column prop="name" label="姓名" width="180"></el-table-column>
                <el-table-column prop="address" label="地址"></el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { getMem, crashPage, dateFormat, sendMessageToSw, getSwInfo } from './utils'
window.getSwInfo = getSwInfo
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            // .register('/sw-report-crash', { scope: '/' })
            .register('sw.js', { scope: '/' })
            .then(registration => {
                console.log('service-worker registed');
            })
            .catch(error => {
                console.log('service-worker registed error', error);
            });
    });
    navigator.serviceWorker.addEventListener('message', event => {
        // console.log('msg', event)
        if (event.origin === location.origin) {
            // 只接受同源sw消息
            let type = null
            try {
                type = event.data.type
            } catch (error) { }
            if (type === 'healthCheck') {
                sendMessageToSw({ type: 'heartbeat', data: { mis: 'yangshan08' } })
            }
        }

    })
}


export default {
    data() {
        let list = []
        for (let i = 0; i < 100; i++) {
            let n = Math.floor(Math.random() * 100)
            let item = {
                date: '2016-05-02',
                name: '王小虎',
                address: `上海市普陀区金沙江路 ${n} 弄`
            }
            list.push(item)
        }
        return {
            tableData: list,
            memory: 0,
            time: new Date()
        }
    },
    created() {
        setInterval(() => {
            this.memory = getMem()
            this.time = new Date()
        }, 1000);
    },
    methods: {
        crashPage, dateFormat,
        registSw() {
            if (navigator.serviceWorker.controller !== null) {
                // window.addEventListener("beforeunload", function () {
                //     console.log('beforeunload', sessionId)
                //     navigator.serviceWorker.controller.postMessage({
                //         type: 'unload',
                //         id: sessionId
                //     });
                // });
            }
        },
        reportSw() {
            swIt = setInterval(function () { heartbeat(sessionId) }, HEARTBEAT_INTERVAL);
        },
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