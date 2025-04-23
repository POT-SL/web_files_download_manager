from flask import Flask, send_from_directory, request, send_file
from requests import post
from json import loads, dumps
from os import listdir, getcwd, chdir
from os.path import isdir, basename
from subprocess import run
from urllib.parse import unquote

'''密码和路径（要修改的）'''
psw = '66ccff'    # 密码（服务方提供）
location = '/hdd/datacenter/'   # 路径（一定要记得加最后的/）

########################################################################################################################

'''计算文件大小'''
def get_folder_size_du(folder_path):
    result = run(["du", "-sbh", folder_path], capture_output=True, text=True)
    size = result.stdout.split()[0]
    return size

'''扫描目录文件'''
def scan_files(folder_path):
    # 拼接路径
    folder_location = location + folder_path
    # 扫描分类
    fl = []
    dl = []
    tmp = listdir(folder_location)
    # 批量检查目录和文件
    for i in tmp:
        # 如果是文件夹
        if isdir(folder_location + '/' + i):
            # 添加
            dl.append({'name': i, 'type': 'dir', 'size': ' '})
        # 如果是文件
        else:
            # 计算文件大小
            size = get_folder_size_du(folder_location + '/' + i)
            # 添加
            fl.append({'name': i, 'type': 'file', 'size': size})
    # 发送
    return {'dir': dl, 'file': fl}

########################################################################################################################

# 创建flask
# 有个傻卵写成了app = False(__name__)，请后人不要犯此错误
app = Flask(__name__, static_url_path='', static_folder='./')

'''前端'''
@app.route('/')
def index():
    return send_from_directory('./', 'index.html')

'''密码验证'''
@app.route('/api', methods=['POST'])
def proxy_api():
    try:
        data = loads(request.get_data().decode('utf-8'))
        if data.get('data') == psw:
            return dumps({'result': 'ok'})
        else:
            raise KeyError
    except:
        return dumps({'result': 'failed'})

'''目录获取'''
@app.route('/get_files', methods=['POST'])
def proxy_files():

    global location

    # 解析
    data = loads(request.get_data().decode('utf-8'))
    print(data)

    # 如果是首次访问
    if data.get('data') == '.':
        # 扫描根目录文件
        tmp = scan_files('')
        # 返回结果
        result = {'root': ['.'], 'type': 'open'}
        result.update(tmp)
        return dumps(result)
    # 如果是访问下一层
    else:
        # 如果是准备返回上一级
        if data.get('data') == '←返回[../]':
            # 处理目录
            del data['path'][-1]
            # 扫描文件
            tmp = scan_files('/'.join(data['path']))
            # 如果现在不是第一层
            if len(data.get('path')) > 1:
                # 添加回退按钮
                tmp['dir'].insert(0, {'name': '←返回[../]', 'type': 'dir', 'size': ' '})
            # 返回结果
            result = {'root': data['path'], 'type': 'open'}
            result.update(tmp)
            return dumps(result)
        # 如果是打开下一级
        else:
            # 检查文件类型
            data['path'].append(data.get('data'))
            file_type ='/'.join(data['path'])
            # 拼接路径
            folder_location = location + '/'.join(data['path'][1:])
            # 如果是文件夹
            if isdir(folder_location):
                # 处理目录
                # 扫描文件
                tmp = scan_files(file_type)
                # 添加回退按钮
                tmp['dir'].insert(0, {'name': '←返回[../]', 'type': 'dir', 'size': ' '})
                # 返回结果
                result = {'root': data['path'], 'type': 'open'}
                result.update(tmp)
                return dumps(result)

            # 如果是文件
            else:
                print('这是文件')
                # 发送文件（需要修改的地方）
                return dumps({'type': 'download', 'path': folder_location})

'''文件下载'''
@app.route('/file_download')
def file_download():
    # 获取参数
    file_path = unquote(request.args.get('path', ''))
    suggested_name = unquote(request.args.get('filename', ''))

    # 获取实际文件名（防止路径遍历）
    actual_filename = basename(file_path)

    return send_file(
        file_path,
        as_attachment=True,
        download_name=suggested_name or actual_filename,  # 优先使用建议的文件名
        mimetype='application/octet-stream'
    )

'''开启'''
def main():
    app.run(host='0.0.0.0', port=4413, ssl_context='adhoc')

if __name__ == '__main__':
    main()