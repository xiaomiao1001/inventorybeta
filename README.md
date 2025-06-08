# 微信小程序库存管理系统

## 📖 项目简介

这是一个基于微信小程序的库存管理系统，帮助商家进行高效的库存管理。

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/xiaomiao1001/inventorybeta.git
cd inventorybeta
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制 `.env.example` 文件为 `.env`，并填入你的微信小程序配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
WECHAT_APPID=你的微信小程序AppID
```

### 4. 更新配置
运行配置脚本：
```bash
npm run setup
```

### 5. 开发预览
使用微信开发者工具打开项目目录进行开发。

## 📁 项目结构

```
├── miniprogram/           # 小程序源码目录
├── .env                   # 环境变量配置（不提交到git）
├── .env.example          # 环境变量模板
├── setup-config.js       # 配置设置脚本
├── project.config.json   # 微信小程序项目配置
└── package.json          # 项目依赖配置
```

## 🔒 安全说明

- `.env` 文件包含敏感信息，已添加到 `.gitignore` 中，不会提交到代码仓库
- `project.config.json` 中的 `appid` 已替换为占位符
- 使用 `npm run setup` 命令可以从 `.env` 文件自动更新配置

## 📝 开发说明

1. 所有敏感配置信息请放在 `.env` 文件中
2. 提交代码前请确保 `.env` 文件不会被提交
3. 新成员加入项目时，需要创建自己的 `.env` 文件

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支
3. 提交你的改动
4. 推送到分支
5. 创建一个 Pull Request
