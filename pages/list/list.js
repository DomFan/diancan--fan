// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [], // 订单列表
  },

  // 查看订单详情
  toDetail: function (e) {
    console.log(e.target.dataset)
    let menu,
        index = e.target.dataset.index+ 1,
        order = e.target.dataset.order
    wx.setStorageSync('menu', {})
    menu = {
      index: index,
      order: order
    }
    wx.setStorageSync('menu', menu)

    wx.navigateTo({
      // url: './detail?index=' + index + '&order=' + order,
      url: './detail',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderList = wx.getStorageSync('orderList')
    // console.log(orderList)
    this.setData({ orderList })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let orderList = wx.getStorageSync('orderList')
    console.log(orderList)
    this.setData({ orderList })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})