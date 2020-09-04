class CpuUsage {
    constructor(timeoutSpan = 50) {
        this.data = null;
        this.t = null;
        this.timer = null;
        this.started = false;
        this.timeoutSpan = timeoutSpan;
    }

    start() {
        this.started = true;
        this.pulse();
        // 60s后自动清除
        setTimeout(() => {
            this.stop();
        }, 60 * 1000);
    }

    getCpu() {
        if (this.data) {
            return this.data;
        }
        return this.timeoutSpan;
    }

    pulse() {
        if (this.t) {
            this.data = (Date.now() - this.t);
        } else {
            this.data = (this.timeoutSpan);
        }
        this.t = Date.now();
        this.timer = setTimeout(this.pulse.bind(this), this.timeoutSpan);
    }

    stop() {
        clearTimeout(this.timer);
        this.data = null;
        this.t = null;
        this.started = false;
    }

}
export default new CpuUsage();



var second = 0

//想要绘制的函数
var f = function (t) {
    return (Math.sin(t) + 1) / 2
}
export function consumeCpu(percent = 1) {
    // var percent = f(second++)//想要看到的 CPU 占用率
    var duration = percent * 1000//死循环需要执行的时间
    var start = Date.now()//记录下面死循环开始的时间
    for (; ;) {
        if (Date.now() - start > duration) {//如果已经执行超过duration的时长了，就退出
            break
        }
    }
}
