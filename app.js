import express from 'express'
import {query, validationResult} from 'express-validator'
import 'dotenv/config'
import {HTTP_BAD_REQUEST, HTTP_LOGIN_FAIL, HTTP_OK} from "./utils/http_constant.js";
import {weiboLogin} from "./clients/weibo.js";

const app = express()
const port = 3005

app.get('/', (req, res) => {
    res.send({
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
    })
})

app.get('/weibo', [
    query('username').exists(),
    query('password').exists(),
], async (req, res, next) => {
    try {
        const errors = validationResult(req);

        // if there is error then return Error
        if (!errors.isEmpty()) {
            return res.json({
                code: HTTP_BAD_REQUEST,
                errors: errors.array(),
            });
        }
        const {username, password,url} = req.query;
        let cookies = await weiboLogin({username, password},url)
        if (!cookies)
            return res.json({
                code: HTTP_LOGIN_FAIL,
                msg: '登陆失败'
            })

        return res.json({code: HTTP_OK, data: cookies});
    } catch (err) {
        next(err);
    }

})


app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`)
})
