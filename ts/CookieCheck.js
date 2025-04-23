"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// 发送数据的函数
function CookieSend(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = '/api';
        const response = yield fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 处理空响应
        const text = yield response.text();
        if (!text.trim()) {
            return { status: "success", message: "Empty response" };
        }
        try {
            return JSON.parse(text);
        }
        catch (e) {
            console.warn("Response is not JSON:", text);
            return { rawResponse: text };
        }
    });
}
// cookie检查
function CheckCookie() {
    return __awaiter(this, void 0, void 0, function* () {
        // 获取cookie
        if (document.cookie) {
            //如果有cookie
            // 发送cookie
            const response = yield CookieSend(document.cookie);
            // 如果cookie不正确
            if (response.result !== 'ok') {
                console.log('你造假nm呢.');
                // 返回登录首页
                window.location.href = 'index.html';
            }
        }
        else {
            // 如果没有cookie
            console.log('你怎么进来的？？');
            // 返回登录首页
            window.location.href = 'index.html';
        }
    });
}
CheckCookie();
