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
// 获取DOM元素
const keyBtn = document.getElementById('key-btn');
const keyInput = document.getElementById('key-input');
// 检查元素是否存在
if (!keyBtn || !keyInput) {
    throw new Error('Required elements not found in the DOM');
}
// 点击事件处理函数
function handleClick() {
    return __awaiter(this, void 0, void 0, function* () {
        const inputValue = keyInput.value.trim();
        console.log(inputValue);
        if (!inputValue) {
            alert('请输入内容');
            return;
        }
        // 变色
        keyBtn.style.backgroundColor = '#66ccff';
        keyBtn.innerText = '处理中';
        // 发送数据
        try {
            // 发送
            const response = yield sendData(inputValue);
            console.log('发送成功:', response);
            // 如果正确
            if (response.result === 'ok') {
                // 通过
                console.log('pass');
                // 更改颜色
                keyBtn.style.backgroundColor = '#ABBFF3';
                keyBtn.innerText = '完成';
                // 设置cookie
                document.cookie = inputValue;
                console.log('设置好cookie了.');
                // 等待1秒
                yield delay(1000);
                // 跳转网页
                window.location.href = 'main.html';
            }
            else {
                // 不正确
                alert('不对捏~');
                // 更改颜色
                keyBtn.style.backgroundColor = '#ABBFF3';
                keyBtn.innerText = '登录';
            }
        }
        catch (error) {
            // 如果发送失败
            console.error('发送失败:', error);
            alert('数据发送失败: ' + (error instanceof Error ? error.message : String(error)));
            // 更改颜色
            keyBtn.style.backgroundColor = '#ABBFF3';
            keyBtn.innerText = '登录';
        }
    });
}
// 发送数据的函数（通过Flask代理）
function sendData(data) {
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
// time.sleep()
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// cookie自动登录
if (document.cookie) {
    console.log('检测到cookie.');
    keyInput.value = document.cookie;
}
// 添加点击事件监听
keyBtn.addEventListener('click', handleClick);
