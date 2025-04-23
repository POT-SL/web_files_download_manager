// 发送数据的函数
async function CookieSend(data: string): Promise<any> {
    const url = '/api';
    
    const response = await fetch(url, {
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
    const text = await response.text();
    if (!text.trim()) {
        return { status: "success", message: "Empty response" };
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("Response is not JSON:", text);
        return { rawResponse: text };
    }
}

// cookie检查
async function CheckCookie() {
    // 获取cookie
    if (document.cookie) {
        //如果有cookie
        // 发送cookie
        const response = await CookieSend(document.cookie);
        // 如果cookie不正确
        if (response.result !== 'ok') {
            console.log('你造假nm呢.')
            // 返回登录首页
            window.location.href = 'index.html'
        }
    } else {
        // 如果没有cookie
        console.log('你怎么进来的？？')
        // 返回登录首页
            window.location.href = 'index.html'
    }
}

CheckCookie()