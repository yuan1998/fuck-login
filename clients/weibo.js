import puppeteer from 'puppeteer';
import {convertImageToBase64, formatCookie, ocrImage} from "../utils/helper.js";

export const weiboLogin = async (account, url = null) => {
    const {username, password} = account;
    const browser = await puppeteer.launch({
        headless:  process.env.HEADLESS || false,
        args: ["--no-sandbox"]
    });
    const page = await browser.newPage();
    let cookies = null;
    try {
        await page.setViewport({
            width: 1440,
            height: 980,
            deviceScaleFactor: 1,
        });
        // 导航到新浪微博登录页面
        url = url || 'https://weibo.com/login.php';
        console.log("url", url);
        await page.goto(url);
        // await page.waitForNavigation({ waitUntil: 'networkidle' });

        await page.waitForSelector('a[action-type="btn_submit"]');
        // 输入用户名和密码
        let inputPhone = '';
        do {
            await page.$eval('#loginname', input => input.value = '');
            await page.type('#loginname', username, {
                delay: 100
            });
            inputPhone = await page.evaluate(() => {
                return document.querySelector('#loginname').value;
            });
        } while (inputPhone !== username)

        let inputPassword = '';
        do {
            let selector = '.W_input[type="password"]';
            await page.$eval(selector, input => input.value = '');
            await page.type(selector, password, {
                delay: 100
            });
            inputPassword = await page.evaluate(() => {
                return document.querySelector('.W_input[type="password"]').value;
            });
        } while (inputPassword !== password)

        const loginBtn = async () => {
            await page.click('a[action-type="btn_submit"]');
            await page.waitForTimeout(3000)
        }
        await loginBtn();
        // 点击登录按钮
        const checkCapCode = async () => {
            const codeImgExists = async () => {
                return await page.evaluate(async () => {
                    const imgElement = document.querySelector(".info_list.verify img"); // 替换为你要判断的元素选择器
                    return imgElement?.src && imgElement.src !== 'about:blank'
                });
            }
            if (await codeImgExists()) {
                let imgEl = await page.$(".info_list.verify img");
                await imgEl.screenshot({path: 'code.png'});
                let base64 = await convertImageToBase64("./code.png")
                let word = await ocrImage(base64);
                if (word)
                    await page.type('.info_list.verify input', word, {
                        delay: 100
                    });
                await loginBtn();
            }
            return !(await codeImgExists());
        }

        let codePass = false;
        do {
            codePass = await checkCapCode();
            console.log("codePass", codePass);
        } while (!codePass)
        await page.waitForNetworkIdle({
            timeout: 8000
        });

        // 获取登录后的cookie
        await page.screenshot({path: 'example.png'});
        cookies = await page.cookies();
    } catch (e) {
        await page.screenshot({path: 'error.png'});
        console.log("e", e);
    }

    await browser?.close();
    return cookies?.map(cookie => formatCookie(cookie))
}
