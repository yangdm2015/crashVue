// const redis = require('redis');
// const client = redis.createClient();
// client.on('error', err => {
//     console.log(`Error ${err}`);
// });
const fs = require('fs')
let lastT = 0
module.exports = {
    'POST /crash/report': (req, res) => {
        // const { password, username } = req.body

        try {
            let { id, crash, timePassed } = req.body;
            if (crash) {
                fs.appendFile('./record', `\n 崩溃啦 ID= ${id}`)

                console.log('崩溃拉 id = ', id);
                // client.hmset(['page', id, crash], (err, v1) => {
                //     if (err) throw err;
                //     // console.log('page = ', v1);
                //     res.json({ data: v1, code: 0 });
                // });
                res.json({ data: 'success', code: 200 });

            } else {
                let t = (new Date()).getTime()
                let inter = (t - lastT) / 1000
                lastT = t
                console.log('没有崩溃 id = ', id, '时间过去了', inter, '秒', 'sw时间过去了', timePassed, '秒');
                res.json({ data: 'success', code: 200 });
            }
        } catch (error) {
            console.log('error', error);
            res.json({ data: error, code: 500 });
        }
    },
    'GET /crash/records': (req, res) => {
        try {
            // client.hgetall('page', (err, v1) => {
            //     if (err) throw err;
            //     res.json({ data: v1, code: 0 });
            // });
        } catch (error) {
            console.log('error', error);
            res.json({ data: error, code: 500 });
        }
    },
    'GET /crash/clear': (req, res) => {
        try {
            // client.del('page', (err, v1) => {
            //     if (err) throw err;
            //     res.json({ data: v1, code: 0 });
            // });
        } catch (error) {
            console.log('error', error);
            res.json({ data: error, code: 500 });
        }
    },
};