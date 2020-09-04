<template>
    <div>
        <el-button @click="fetchLog">点击发送fetch</el-button>
    </div>
</template>
<script>


import '@fastly/performance-observer-polyfill/polyfill'
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
        console.log('duration = ', entry.duration);
    });
});
observer.observe({ entryTypes: ['longtask'] });
function fib(num) {
    if (num === 0) return 0;
    if (num === 1) return 1;
    return fib(num - 2) + fib(num - 1);
}
export default {
    data() {
        return {
            currentDate: new Date(),

        }
    },
    created() {

    },
    methods: {
        fetchLog() {
            // return new Promise((resolve) => {
            //     console.log('fetchLog begin');
            //     fib(40);
            //     console.log('fetchLog done');
            //     resolve()
            // })

            fetch('http://manager.mall.test.sankuai.com/api/resource/log', {

            }).then(rsp => {

            }).catch(e => {
                console.log('begin');
                fib(40);

                // setTimeout(() => {
                //     fib(40);
                // }, 0)
                console.log('done');
            });
        }
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