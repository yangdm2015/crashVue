self.addEventListener("install", function(event) {
  console.log("######### sw 已安装  install");
});
self.addEventListener("activate", function(event) {
  console.log("######### sw 已激活 activate");
  console.log("self.clients = ", self.clients);
  self.clients.claim();
});

const CHECK_CRASH_INTERVAL = 10 * 1000; // 每 10s 检查一次
const CRASH_THRESHOLD = 15 * 1000; // 15s 超过15s没有心跳则认为已经 crash
const pages = {};
let timer;

function checkCrash() {
  const now = Date.now();
  for (var id in pages) {
    let page = pages[id];
    console.log(
      `${id}的t是${
        page.t
      },now = ${now},(now - page.t) > CRASH_THRESHOLD? ${now - page.t >
        CRASH_THRESHOLD}`
    );
    if (now - page.t > CRASH_THRESHOLD) {
      // 上报 crash
      // let pageIds = localStorage.getItem('crash-pageIds') || {}
      // pageIds[page] = pageIds[page] ? pageIds[page] + 1 : 1
      // localStorage.setItem('crash-pageIds', JSON.stringify(pageIds))
      fetch("");
      delete pages[id];
    }
  }
  if (Object.keys(pages).length == 0) {
    clearInterval(timer);
    timer = null;
  }
}

self.addEventListener("message", e => {
  // console.log('$$$$ sw 接收到信息：', e)
  console.log("pages = ", pages);

  const data = e.data;
  if (data.type === "heartbeat") {
    pages[data.id] = {
      t: Date.now()
    };
    if (!timer) {
      timer = setInterval(function() {
        checkCrash();
      }, CHECK_CRASH_INTERVAL);
    }
  } else if (data.type === "unload") {
    delete pages[data.id];
  }
});
