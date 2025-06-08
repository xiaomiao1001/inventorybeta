/**
 * 配置设置脚本
 * 从 .env 文件读取环境变量并更新 project.config.json
 */
const fs = require('fs');
const path = require('path');

// 读取 .env 文件
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env 文件不存在，请先创建 .env 文件');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  
  return env;
}

// 更新 project.config.json
function updateProjectConfig() {
  const env = loadEnv();
  const configPath = path.join(__dirname, 'project.config.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ project.config.json 文件不存在');
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (env.WECHAT_APPID) {
    config.appid = env.WECHAT_APPID;
    console.log('✅ 已更新 project.config.json 中的 appid');
  }
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('🎉 配置更新完成！');
}

updateProjectConfig(); 