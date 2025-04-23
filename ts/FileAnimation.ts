// 在文件顶部声明路径（模块作用域）
let file_location: string[] = ['.']; // 使用 string 而不是 String

// （函数）删除所有的控件
function removeFileBarButtons(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>('div.file_bar .file_button');
  buttons.forEach(button => button.remove());
}
// （函数）添加控件
function createFileButton(
  id: string,
  title: string,
  fileName: string,
  fileSize: string,
  fileType: string,
  wait: number,
): void {
  const fileBar = document.querySelector<HTMLDivElement>('div.file_bar');
  
  if (!fileBar) {
      console.error('找不到 file_bar 容器');
      return;
  }

  const button = document.createElement('button');
  button.className = 'file_button';
  button.id = id;
  button.title = title;

  button.style.animation = 'filein 0.5s ' + wait + 'ms ease-out forwards';

  const fileNameDiv = document.createElement('div');
  fileNameDiv.className = 'file_name';
  fileNameDiv.textContent = fileName;

  const fileSizeDiv = document.createElement('div');
  fileSizeDiv.className = 'file_size';
  fileSizeDiv.textContent = fileSize;

  const downloadImageDiv = document.createElement('div');
  if (fileType === 'file') {
    downloadImageDiv.className = 'download_image';
  } else {
    downloadImageDiv.className = 'diropen_image';
  }
  

  button.appendChild(fileNameDiv);
  button.appendChild(fileSizeDiv);
  button.appendChild(downloadImageDiv);

  fileBar.appendChild(button);
}
// （函数）time.sleep()
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// （函数）发送数据包
async function get_files(input_data: String, input_path: String[]) {
  
  // 定义请求和响应的类型接口
  interface ButtonClickRequest {
    data: String;
    path: String[]
  }

  // 发送post请求
  const requestData: ButtonClickRequest = { data: input_data, path: input_path };
  const response = await fetch('/get_files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  // 返回数据包
  const responseData = await response.json();
  return responseData;

}
// （函数）下载文件
async function downloadFile(filePath: string, fileName: string): Promise<void> {
  try {
      // 1. 创建一个隐藏的 iframe 来触发下载
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // 2. 构建下载 URL（GET 请求）
      const downloadUrl = `/file_download?path=${encodeURIComponent(filePath)}&filename=${encodeURIComponent(fileName)}`;
      
      // 3. 设置 iframe 的 src 来触发下载
      iframe.src = downloadUrl;
      
      // 4. 稍后移除 iframe
      setTimeout(() => {
          document.body.removeChild(iframe);
      }, 5000);
  } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
  }
}

// （函数）格式化字节大小
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 初始化函数
async function start_build_files() {
  
  // 获取当前目录文件
  const file_list = await get_files('.', ['.'])
  // 得到后初始化根目录
  file_location = file_list.root
  // 设置外显
  const file_location_display = document.querySelector('.file_location') as HTMLDivElement;
  file_location_display.textContent = '当前目录：' + file_location.join('/');
  
  // 延迟数值
  var display_wait:number = 0
  
  // 更新目录
  await delay(1000)
  for (let i = 0; i < file_list.dir.length; i++) {
    const item = file_list.dir[i];
    // 添加新的button
    await createFileButton(item.name, item.name, item.name, item.size, item.type, display_wait);
    // 延迟+1
    display_wait += 50
  }
  // 更新文件
  for (let i = 0; i < file_list.file.length; i++) {
    const item = file_list.file[i];
    // 添加新的button
    await createFileButton(item.name, item.name, item.name, item.size, item.type, display_wait);
    // 延迟+1
    display_wait += 50
  }

}

// 初始化
start_build_files()

// 使用事件委托，监听所有按钮点击（包括动态创建的）
document.querySelector('div.file_bar')?.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement;
  
  // 检查点击的是按钮本身，还是按钮内部的子元素（如文件名、文件大小等）
  const button = target.closest('button.file_button') as HTMLButtonElement | null;
  
  if (!button) return; // 如果不是按钮，直接返回
  const buttonId = button.id;
  if (!buttonId) {
      console.warn('点击的按钮没有ID属性');
      return;
  }

  // 获取到了数据
  const file_list = await get_files(buttonId, file_location)
  console.log('服务器响应:', file_list);

  // 检查如果是打开文件夹
  if (file_list.type === 'open') {
    // 得到后初始化根目录
    file_location = file_list.root
    // 删除所有button
    removeFileBarButtons();
    // 设置外显
    const file_location_display = document.querySelector('.file_location') as HTMLDivElement;
    file_location_display.textContent = '当前目录：' + file_location.join('/');
    
    // 延迟数值
    var display_wait:number = 0

    // 更新目录
    for (let i = 0; i < file_list.dir.length; i++) {
      const item = file_list.dir[i];
      // 添加新的button
      await createFileButton(item.name, item.name, item.name, item.size, item.type, display_wait);
      // 延迟+1
      display_wait += 50
    }
    // 更新文件
    for (let i = 0; i < file_list.file.length; i++) {
      const item = file_list.file[i];
      // 添加新的button
      await createFileButton(item.name, item.name, item.name, item.size, item.type, display_wait);
      // 延迟+1
      display_wait += 50
    }
  } else {
    // 如果返回是文件
    // 调用下载函数
    

    const fileName = buttonId; // 使用按钮ID作为文件名
    console.log('下载文件.', fileName)
    await downloadFile(file_list.path, fileName);
  }
});