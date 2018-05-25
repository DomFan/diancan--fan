//app.js
var server = require('./utils/server');
App({
  onLaunch: function () {
    let that = this;
    wx.getSystemInfo({//  获取页面的有关信息
      success: function (res) {
        // console.log('getSystemInfo', res)
        wx.setStorageSync('systemInfo', res)
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    });
    // console.log('App Launch')
    var self = this;
    var rd_session = wx.getStorageSync('rd_session');
    if (!rd_session) {
      self.login();
    } else {
      wx.checkSession({
        success: function () {
          // 登录态未过期
          console.log('登录态未过期')
          self.rd_session = rd_session;
          self.getUserInfo();
        },
        fail: function () {
          //登录态过期
          console.log('过期');
          self.login();
        }
      })
    }
    wx.getSetting({
      success: res => {
        console.log(res);
        console.log('得到用户信息成功');
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              // console.log(2);
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    // console.log('App Show')
  },
  onHide: function () {
    // console.log('App Hide')
  },
  globalData: {
    hasLogin: false,
    cartList: [],
    userInfo: [],
  },
  rd_session: null,
  login: function () {
    var self = this;
    wx.login({
      success: function (res) {
        
        console.log('wx.login', res)
        return
        server.getJSON('dwq/WxAppApi/setUserSessionKey.php', { code: res.code }, function (res) {
          self.rd_session = res.data.rd_session;
          self.globalData.hasLogin = true;
          wx.setStorageSync('rd_session', self.rd_session);
          self.getUserInfo();
        });
      }
    });
  },
  getUserInfo: function () {
    var self = this;
    wx.getUserInfo({
      success: function (res) {
        self.globalData.userInfo = res.userInfo;
        server.getJSON('dwq/WxAppApi/checkSignature.php', {
          rd_session: self.rd_session,
          signature: res.signature,
          raw_data: res.rawData
        }, function (res) {
          if (!res.data.is_pass) {
            // TODO:验证有误处理
            self.login();
          }
        });
      }
    });
  },
  // 贝塞尔曲线
  bezier: function (pots, amount) {
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }
    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0];//点击
      pointB = points[1];//中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },
  
})

// App({
  //   onLaunch: function () {
  //     // 展示本地存储能力
  //     var logs = wx.getStorageSync('logs') || []
  //     logs.unshift(Date.now())
  //     wx.setStorageSync('logs', logs)

  //     // 登录
  //     wx.login({
  //       success: res => {
  //         // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //       }
  //     })
  //     // 获取用户信息
  //     wx.getSetting({
  //       success: res => {
  //         if (res.authSetting['scope.userInfo']) {
  //           // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //           wx.getUserInfo({
  //             success: res => {
  //               // 可以将 res 发送给后台解码出 unionId
  //               this.globalData.userInfo = res.userInfo

  //               // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //               // 所以此处加入 callback 以防止这种情况
  //               if (this.userInfoReadyCallback) {
  //                 this.userInfoReadyCallback(res)
  //               }
  //             }
  //           })
  //         }
  //       }
  //     })
  //   },
  //   globalData: {
  //     userInfo: null
  //   }
// })