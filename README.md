# kk哥的个人博客

一个基于Node.js + Express + SQLite的个人博客网站，采用黑白配色，极简高级风格。

## 项目特点

- **博客风格**：个人博客风格，文章卡片式布局
- **损友内容**：需要输入外号解锁（莫总、死人猪/啊猪、全部）
- **留言功能**：SQLite持久化存储，所有人可留言查看
- **设计风格**：黑白配色，极简高级
- **生活理念**："爱咋咋地老子最吊"

## 技术栈

- **后端**：Node.js + Express
- **数据库**：SQLite
- **前端**：HTML + CSS + JavaScript
- **部署**：OpenClaw + 阿里云ECS

## 项目结构

```
kk-website-git/
├── public/              # 前端文件
│   ├── index.html      # 主页面
│   └── style.css       # 样式文件（如果需要）
├── server.js           # 服务器主文件
├── package.json        # 项目依赖
├── start.sh            # 启动脚本
├── guestbook.db        # SQLite数据库文件
├── .gitignore          # Git忽略文件
└── README.md           # 项目说明
```

## 运行方式

### 本地运行

```bash
# 安装依赖
npm install

# 启动服务器
npm start

# 或者使用启动脚本
./start.sh
```

### 访问地址

- **本地访问**：http://localhost:3000
- **公网访问**：http://101.37.105.81:3000

## 功能说明

### 1. 博客展示
- 个人简介
- 兴趣爱好
- 损友故事（需要解锁）

### 2. 留言功能
- 任何人可以留言
- 留言持久化存储在SQLite数据库
- 留言公开显示

### 3. 损友内容解锁
- 需要输入特定外号才能查看损友内容
- 支持的外号：莫总、死人猪/啊猪、全部

## 开发说明

### 前端修改
1. 修改 `public/index.html` 文件
2. 刷新浏览器即可看到效果

### 后端修改
1. 修改 `server.js` 文件
2. 重启服务器

### 数据库
- 数据库文件：`guestbook.db`
- 使用SQLite，无需额外配置

## Git工作流

### 1. 克隆仓库
```bash
git clone <your-repo-url> kk-website
cd kk-website
```

### 2. 本地开发
```bash
# 修改代码后
git add .
git commit -m "描述你的修改"
git push origin master
```

### 3. 更新到服务器
```bash
# 在服务器上
git pull origin master
# 重启服务器
pm2 restart kk-website
# 或者
./start.sh
```

## 部署说明

### 阿里云ECS部署

1. **安装Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **安装PM2（进程管理器）**
```bash
npm install -g pm2
```

3. **克隆仓库**
```bash
cd /var/www
git clone <your-repo-url> kk-website
cd kk-website
npm install
```

4. **启动服务**
```bash
pm2 start server.js --name kk-website
pm2 save
pm2 startup
```

5. **配置Nginx（可选）**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 注意事项

1. **数据库文件**：`guestbook.db` 包含用户留言数据，需要妥善备份
2. **端口占用**：确保3000端口未被其他程序占用
3. **文件权限**：确保服务器有读写权限
4. **安全考虑**：生产环境建议添加身份验证

## 更新日志

### 2026-03-02
- 创建独立Git仓库
- 添加.gitignore文件
- 添加README.md文件
- 实现左中右布局
- 实现独立板块显示

### 2026-03-01
- 项目初始化
- 创建基本博客结构
- 添加留言板功能
- 添加损友内容解锁功能

## 联系方式

- **开发者**：kk哥
- **技术栈**：TypeScript + X-Template框架
- **职业**：Dota2游廊开发工程师

---

**爱咋咋地老子最吊** 🚀