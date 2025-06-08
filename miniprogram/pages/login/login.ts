interface ILoginData {
  username: string;
  password: string;
  loginLoading: boolean;
}

Page({
  data: {
    username: '',
    password: '',
    loginLoading: false
  } as ILoginData,

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },

  onUsernameChange(e: any) {
    this.setData({
      username: e.detail.value
    });
  },

  onPasswordChange(e: any) {
    this.setData({
      password: e.detail.value
    });
  },

  async handleLogin() {
    const { username, password } = this.data;

    if (!username || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loginLoading: true });

    try {
      // 模拟登录验证 - 标注：这里是写死的数据，后续需要连接真实的认证API
      const mockUsers = [
        { username: 'owner', password: '123456', role: 'owner', name: '所有者' },
        { username: 'admin', password: '123456', role: 'admin', name: '管理员' },
        { username: 'sales', password: '123456', role: 'sales', name: '销售人员' },
        // 默认测试账号
        { username: '2097598363@qq.com', password: '123456', role: 'owner', name: '郭四' }
      ];

      const user = mockUsers.find(u => u.username === username && u.password === password);

      if (user) {
        // 存储用户信息到本地存储
        wx.setStorageSync('userInfo', {
          username: user.username,
          role: user.role,
          name: user.name,
          loginTime: new Date().getTime()
        });

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: '用户名或密码错误',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  }
}); 