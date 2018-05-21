// pages/home/home.js
Page({
  data: {
    scollTop: 0,
    scroll_into_view: 'foodtype0', // scroll-view的初始位置
    navid: 0,
    imgArray: [], // 导航的图片数组，通过ajax获取
    foodArray: [], // 食品的对象数组
    shoppingList: [], // 购物车储存的对象数组
    totalPrice: 0,  // 购物车的总价格
    totalCount: 0,  // 购物车的总数量
    cartIsHidden: true, // 购物车是否隐藏
    cartIndexIsHidden: true, // 购物车详情菜单是否隐藏 
    showCar: false, // 是否显示购物车列表
    orderList: [],
    merchantId: "40cac207375a4438bdf537229164d09d",

  },

  // 跳页的id 左侧导航与主体联动
  changepage: function (e) {
    // 滚动到指定的id
    let goPage = e.currentTarget.id
    // console.log(e.target.dataset, e.currentTarget)
    // console.log(e.currentTarget.dataset.navid, typeof e.currentTarget.dataset.navid)
    this.setData({
      scroll_into_view: "foodtype" + goPage, 
      navid: e.currentTarget.dataset.navid.toString()
    })
  },
  scroll: function (e) {
    // console.log('scrollTop', e.detail.scrollTop)
    
  },
  // 点击‘+’添加进购物车
  addShopcart: function (e) {
    let shopping_list = this.data.shoppingList;
    let total_price = parseFloat(parseFloat(this.data.totalPrice).toFixed(2));
    let total_count = this.data.totalCount + 1;
    let price = e.target.dataset.price
    total_price = +parseFloat(total_price + price).toFixed(2);
    // console.log(total_price, e.target.dataset.price)
    // debugger
    let itemNum = 1;
    let that = this;
    let total

    // 改变整个foodArray数组 添加num计数
    let foodArray = this.data.foodArray
    let id = e.target.dataset.id
    foodArray.map(item =>{
      // item.foodsIndex.map(food => {
      item.productlist.map(food => {
        if (food.id == id) {
          !food.num ? food.num = 1 : food.num++
          that.setData({foodArray})
        }
      })
    })

    // 是否有同种商品判断
    if (this.data.shoppingList.length > 0) {
      // 商品名是否相同判断，不重复添加同名商品
      let isHave = this.data.shoppingList.findIndex(item => item.id == id)
      if (isHave != -1) {
        that.data.shoppingList[isHave].num++
        total = that.data.shoppingList[isHave].num*that.data.shoppingList[isHave].price
        total = parseFloat(total.toFixed(2))
        that.data.shoppingList[isHave].total = total
      } else {
        // 购物车数组加进新的一样食品
        that.data.shoppingList.push({
          id: id,
          price: parseFloat(e.target.dataset.price.toFixed(2)),
          name: e.target.dataset.name,
          num: itemNum,
          total: parseFloat(e.target.dataset.price.toFixed(2)),
          url: e.target.dataset.url
        })
      }
      // 没有商品时直接添加
    } else {
      this.data.shoppingList.push({
        id: id,
        price: parseFloat(e.target.dataset.price.toFixed(2)),
        name: e.target.dataset.name,
        num: itemNum,
        total: parseFloat(e.target.dataset.price.toFixed(2)),
        url: e.target.dataset.url
      })
    }
    total_price = parseFloat(total_price).toFixed(2)
    this.setData({
      shoppingList: shopping_list,
      totalPrice: total_price,
      totalCount: total_count,
      // 购物车当有商品时弹出
      cartIsHidden: false
    })
    // console.log(this.data.totalPrice)
  },
  // 点击‘-’删除指定商品
  subShopcart: function (e) {
    let that = this,
        total_count = this.data.totalCount,
        total_price = parseFloat(this.data.totalPrice),
        shoppingList = this.data.shoppingList,
        foodArray = this.data.foodArray,
        itemNum = 1

    total_price = parseFloat(total_price.toFixed(2))
    // 点击的商品信息
    let foodPrice = e.target.dataset.price,
        foodName = e.target.dataset.name,
        id = e.target.dataset.id
        console.log(foodPrice, foodName)
    // 计算总价
    total_price = (total_price - foodPrice).toFixed(2);
    total_price = parseFloat(total_price)
    // 修改主体中商品数量
    foodArray.map(item => {
      // item.foodsIndex.map(food => {
      item.productlist.map(food => {
        food.id == id ? food.num-- : ''
      })
    })
    that.setData({ foodArray })
    // 修改购物车列表中物品数量及价格
    let itemIndex = shoppingList.findIndex(item => item.id == id)
    let item = shoppingList[itemIndex]
    if (item.num == 1) {
      shoppingList.splice(itemIndex, 1)
    } else {
      // debugger
      item.num-= 1
      item.total -= item.price
      item.total = parseFloat(item.total.toFixed(2))
    }
    
    console.log(shoppingList, total_price)
    this.setData({
      shoppingList: shoppingList,
      totalPrice: total_price,
      totalCount: total_count - 1
    });

    // 隐藏购物车导航
    let cartIsHidden = this.data.cartIsHidden,
        count = this.data.totalCount
    if (count == 0) {
      this.setData({
        cartIsHidden: true
      })
    }
  },
  // 购物车详情抽屉点击时弹出
  showCart: function (e) {
    let cart_indexIsHidden = !this.data.cartIndexIsHidden;
    this.setData({
      cartIndexIsHidden: cart_indexIsHidden
    })
    let showCar = this.data.showCar,
        count = this.data.totalCount
    // 如果购物车列表为空 购物车导航不可点击
    if (count == 0) {
      this.setData({ showCar: false})
    } else {
      this.setData({
        showCar: !showCar
      })
    }
  },
  // **选好了 去结算
  toCount: function (e) {
    let count = this.data.totalCount
    if (count == 0) { return }
    console.log(this.data.totalCount)
    
    // 待支付订单
    let orderMenu = {
      list: this.data.shoppingList,
      price: this.data.totalPrice,
      count: this.data.totalCount
    }
    // 本地存储待支付订单
    wx.setStorageSync('orderMenu', orderMenu)

    // 使用本地存储 模拟 已支付订单列表
    let orderList = this.data.orderList
    orderList.push(orderMenu)
    this.setData({ orderList })
    wx.setStorageSync('orderList', orderList)

    // 将购物车商品列表隐藏
    this.setData({
      showCar: false
    })

    // 提交订单 跳转到待支付订单页面
    wx.navigateTo({
      url: '../order/order'
    })
  },
  setLocalStorage: function () {
    // ?????
  },
  // 显示隐藏购物车列表
  showCartList: function (e) {
    console.log(this.data.showCar, this.data.shoppingList)
    if (this.data.shoppingList.length != 0) {
      this.setData({
        showCar: !this.data.showCar,
      });
    }
  },
  // 清空购物车列表
  clearCartList: function () {
    let foodArray = this.data.foodArray
    foodArray.map(item => {
      // item.foodsIndex.map(food => { 
      item.productlist.map(food => { 
        food.num ? food.num = 0 : ''
      })
    })
    this.setData({ foodArray })
    this.setData({
      shoppingList: [],
      showCar: false,
      totalPrice: 0,
      totalCount: 0,
    })
  },
  // 购物车 +
  addNumber: function (e) {
    let id = e.target.dataset.id
    let index = e.currentTarget.dataset.index;
    // console.log(index)
    let shoppingList = this.data.shoppingList;
    shoppingList[index].num++;
    let total = this.data.totalPrice + (shoppingList[index].price);
    total = parseFloat(total).toFixed(2)
    shoppingList[index].total += (shoppingList[index].price);
    // 保留两位小数
    shoppingList[index].total = +parseFloat(shoppingList[index].total).toFixed(2)

    console.log(shoppingList[index].num, shoppingList)
    let that = this,
        foodArray = this.data.foodArray
    foodArray.map(item => {
      // item.foodsIndex.map(food => {
      item.productlist.map(food => {
        if (food.id == id) {
          !food.num ? food.num = 1 : food.num++
          that.setData({ foodArray })
        }
      })
    })

    this.setData({
      shoppingList: shoppingList,
      totalPrice: total,
      totalCount: this.data.totalCount + 1
    })
    // console.log(this.data.totalPrice, this.data.totalCount)
  },
  // 购物车 -
  decNumber: function (e) {
    // console.log(e)
    let id = e.target.dataset.id
    console.log(id)
    let index = e.currentTarget.dataset.index;
    // console.log(index)
    let shoppingList = this.data.shoppingList;

    let total = parseFloat(this.data.totalPrice - shoppingList[index].price.toFixed(2));
    shoppingList[index].total -= parseFloat(shoppingList[index].price.toFixed(2));
    shoppingList[index].total = parseFloat(shoppingList[index].total.toFixed(2))
    shoppingList[index].num == 1 ? shoppingList.splice(index, 1) : shoppingList[index].num--;

    let that = this,
        foodArray = this.data.foodArray
    foodArray.map(item => {
      // item.foodsIndex.map(food => {
      item.productlist.map(food => {
        if (food.id == id) {
          if(food.num == 0){ return }
          else {
            food.num ? food.num-- : ''
            that.setData({ foodArray })

          }
        }
      })
    })
 
    total = parseFloat(parseFloat(total).toFixed(2))
    this.setData({
      shoppingList: shoppingList,
      totalPrice: total,
      showCar: shoppingList.length == 0 ? false : true,
      totalCount: this.data.totalCount - 1
    });
    // console.log(this.data.totalPrice, this.data.totalCount)

    // 隐藏购物车导航
    let cartIsHidden = this.data.cartIsHidden,
        count = this.data.totalCount
    if (count == 0) {
      this.setData({
        cartIsHidden: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 设置标题名
    // wx.setNavigationBarTitle({
    //   title: '菜单'
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  // 加载ajax的最佳时机
  onLoad: function (options) {
    console.log(options)
    let that = this,
        imgArray = this.data.imgArray
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10,
      mask: true
    })


    // 商品列表
    wx.request({
      // url: 'http://192.168.98.157/dcback/productController/page',
      url: 'http://192.168.98.157/dcback/productController/xcxPage',
      data: {
        merchantId: "40cac207375a4438bdf537229164d09d"
      },
      header: {
        'Accept': 'application/json'
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        console.log(res.data.total)

        let array = res.data.total
        array.map(item => {
          imgArray.push({"categoryName": item.categoryName})
        })

        that.setData({
          imgArray: imgArray,
          foodArray: array
        })
      },
      fail: function(res) {},
      complete: function(res) {},
    })

    return
    // 发送请求
    wx.request({
      url: 'http://easy-mock.com/mock/5905d4597a878d73716e2c6b/kfc/kfc',
      method: 'GET',
      data: {},
      header: {
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res.data)
        that.setData({
          imgArray: res.data.naletray,
          foodArray: res.data.foodArray
        })
        wx.hideToast()
      }
    })
    // }, function () {
    //   wx.hideToast();
    // })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '点餐小程序',
      path: '/page/home',
      success: function (res) {
        // 转发成功
        console.log('转发成功')
      },
      fail: function (res) {
        // 转发失败
        console.log('转发失败')        
      }
    }
  },

})