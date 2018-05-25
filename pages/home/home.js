// pages/home/home.js
let app = getApp()
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
    hide_good_box: true, // 是否隐藏小球

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
    total_price = +parseFloat(total_price).toFixed(2)
    this.setData({
      shoppingList: shopping_list,
      totalPrice: total_price,
      totalCount: total_count,
      // 购物车当有商品时弹出
      cartIsHidden: false
    })
    // console.log(this.data.totalPrice)

    // 小球动画 点击时手指位置
    this.finger = {};
    // 顶点位置
    var topPoint = {};
    // 点击的坐标
    this.finger['x'] = e.touches["0"].clientX;
    this.finger['y'] = e.touches["0"].clientY;
    // console.log(e.touches["0"])
    // console.log(this.finger)

    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 150;
    } else {
      topPoint['y'] = this.busPos['y'] - 150;
    }
    // Math.abs() 取绝对值
    // topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2;

    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else {//
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }

    //topPoint['x'] = this.busPos['x'] + 80
    // this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);
    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
    this.startAnimation(e);
  },

  // 动画
  startAnimation: function (e) {
    var index = 0,
      that = this,
      bezier_points = that.linePos['bezier_points'];

    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    index = len
    this.timer = setInterval(function () {
      index--;
      // 条件控制 清零时 return
      if (!bezier_points[index]) { return }
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index < 1) {
        clearInterval(that.timer);
        // that.addGoodToCartFn(e);
        that.setData({
          hide_good_box: true
        })
      }
    }, 10);
  },
  // 点击‘-’删除指定商品
  subShopcart: function (e) {
    let that = this,
        total_count = this.data.totalCount,
        total_price = parseFloat(this.data.totalPrice),
        shoppingList = this.data.shoppingList,
        foodArray = this.data.foodArray,
        itemNum = 1

    total_price = +parseFloat(total_price.toFixed(2))
    // 点击的商品信息
    let foodPrice = e.target.dataset.price,
        foodName = e.target.dataset.name,
        id = e.target.dataset.id
        console.log(foodPrice, foodName)
    // 计算总价
    total_price = (total_price - foodPrice).toFixed(2);
    total_price = +parseFloat(total_price).toFixed(2)
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
    console.log(this.data.totalPrice, shoppingList[index].price)
    total = +parseFloat(total).toFixed(2)
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
    // console.log(id)
    let index = e.currentTarget.dataset.index;
    // console.log(index)
    let shoppingList = this.data.shoppingList;

    let total = parseFloat(this.data.totalPrice - shoppingList[index].price.toFixed(2));
    total = +total.toFixed(2)
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
 
    // total = parseFloat(parseFloat(total).toFixed(2))
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
    let json = {
      "total": [
        {
          "categoryId": "753de7375c4d47338f60ee4fce948504",
          "categoryName": "类目3",
          "productlist": [
            {
              "id": "4538ebf3e9d64c08a5d337bd83bfd3b3",
              "productName": "商品8",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 3,
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/d280e7ad27be4e0ba0845e188946019d.jpg",
              "createTime": "2018-05-21 14:38:30",
              "updateTime": "2018-05-22 17:15:10",
              "categoryName": "类目3"
            },
            {
              "id": "5225b7d82b1e4561811de4856e707a5f",
              "productName": "商品8",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 5.9,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/d20805d898e246bfbabab6b0fb3a1cea.jpg",
              "productSpec": "1",
              "createTime": "2018-05-21 14:00:55",
              "updateTime": "2018-05-22 17:15:21",
              "categoryName": "类目3"
            },
            {
              "id": "5acf23d0280b468bb01e524d7c9decf0",
              "productName": "商品7",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 9.8,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/5831932588dd4e6bb4725e73767b385f.jpg",
              "createTime": "2018-05-21 14:00:37",
              "updateTime": "2018-05-21 14:00:36",
              "categoryName": "类目3"
            },
            {
              "id": "612a7ae50e2347a28fddc27641074ead",
              "productName": "商品6",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 2.6,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/97737730fe374b53a56d9e7689154bc8.jpg",
              "createTime": "2018-05-21 13:59:49",
              "updateTime": "2018-05-21 13:59:49",
              "categoryName": "类目3"
            },
            {
              "id": "d8d0a61c7ecc4f04beb1351d5c9daae3",
              "productName": "商品5",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 3.2,
              "productStock": "2",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/83fab184dfb44ff7b9d773aa454f46cd.jpg",
              "createTime": "2018-05-21 13:59:31",
              "updateTime": "2018-05-21 13:59:31",
              "categoryName": "类目3"
            },
            {
              "id": "4f650bac6632458d92ec8f7050ac1886",
              "productName": "商品4",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 2.2,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/1588a5d3640048aeb56d07b7864eb8c1.jpg",
              "createTime": "2018-05-21 13:59:09",
              "updateTime": "2018-05-21 13:59:09",
              "categoryName": "类目3"
            },
            {
              "id": "1677e64377cc4ba681f4193f1d0c9169",
              "productName": "商品3",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 3.2,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/8fad0bf40a2446fb9900042a683e7966.jpg",
              "createTime": "2018-05-21 13:58:50",
              "updateTime": "2018-05-21 13:58:49",
              "categoryName": "类目3"
            },
            {
              "id": "1e289cfe07d0477e94a20a1676f35bbf",
              "productName": "商品2",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 1.4,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/dfcf75eac2114bd0b3afdec49de75bf1.jpg",
              "createTime": "2018-05-21 13:58:30",
              "updateTime": "2018-05-21 13:58:30",
              "categoryName": "类目3"
            },
            {
              "id": "5aa5084094e6411a9a8957975f57872b",
              "productName": "商品1",
              "categoryId": "753de7375c4d47338f60ee4fce948504",
              "productPrice": 1.1,
              "productStock": "3",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/c290b96e2bbb4815a871273a7df19b65.jpg",
              "createTime": "2018-05-21 13:58:06",
              "updateTime": "2018-05-21 13:58:05",
              "categoryName": "类目3"
            }
          ]
        },
        {
          "categoryId": "52425c94b2df4d1fbf3443b6fb513ec0",
          "categoryName": "图片",
          "productlist": [
            {
              "id": "fa13852369644bc19012aad1d52b08c8",
              "productName": "商品3",
              "categoryId": "52425c94b2df4d1fbf3443b6fb513ec0",
              "productPrice": 1,
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/2bec376e331844b1a2b0aa170416c6e4.jpg",
              "createTime": "2018-05-21 14:36:11",
              "updateTime": "2018-05-22 13:23:55",
              "categoryName": "图片"
            },
            {
              "id": "7948e80567d6496d979ace392d72be91",
              "productName": "红烧鸡",
              "categoryId": "52425c94b2df4d1fbf3443b6fb513ec0",
              "productPrice": 3,
              "productStock": "1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/2af7d74cc09f4ef78c8d6ddd50d7d261.jpg",
              "createTime": "2018-05-21 14:35:04",
              "updateTime": "2018-05-21 14:35:04",
              "categoryName": "图片"
            },
            {
              "id": "e688f7bb31214b13a280469065741a5f",
              "productName": "商品6",
              "categoryId": "52425c94b2df4d1fbf3443b6fb513ec0",
              "productPrice": 4,
              "productStock": "2",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/4337509e4d5b44939b1f0a2b1b06106e.jpg",
              "productSpec": "2",
              "createTime": "2018-05-21 11:32:53",
              "updateTime": "2018-05-21 13:47:07",
              "categoryName": "图片"
            },
            {
              "id": "1e2f3e772d80443cad1e0b6132982f6c",
              "productName": "商品1",
              "categoryId": "52425c94b2df4d1fbf3443b6fb513ec0",
              "productPrice": 100,
              "productStock": "2",
              "productDes": "商品1",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/bc565c530b1b4a01bc8dbc52792770d3.jpg",
              "productSpec": "2",
              "createTime": "2018-05-21 09:44:32",
              "updateTime": "2018-05-21 11:01:41",
              "categoryName": "图片"
            }
          ]
        },
        {
          "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
          "categoryName": "类目1",
          "productlist": [
            {
              "id": "941177bc90f44c4cbb95fabbbc5b9287",
              "productName": "商品7",
              "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
              "productPrice": 4,
              "productStock": "3",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/d9f892ebb5bc450ea6ca68ecf0fb4546.jpg",
              "productSpec": "3",
              "createTime": "2018-05-21 13:49:46",
              "updateTime": "2018-05-21 13:50:18",
              "categoryName": "类目1"
            },
            {
              "id": "8c6b00aba1a74d288fe54caa70b53589",
              "productName": "商品5",
              "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
              "productPrice": 0.01,
              "productStock": "1",
              "productSpec": "1",
              "createTime": "2018-05-18 14:45:40",
              "updateTime": "2018-05-22 13:24:57",
              "categoryName": "类目1"
            },
            {
              "id": "3241c73015e646f78abca557b476504c",
              "productName": "商品3",
              "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
              "productPrice": 3,
              "productStock": "2",
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/7d321e3611554ed887103b81ba7b66a4.jpg",
              "productSpec": "2",
              "createTime": "2018-05-18 14:42:04",
              "updateTime": "2018-05-21 13:47:02",
              "categoryName": "类目1"
            },
            {
              "id": "00565eb575e2429884867482e43f308f",
              "productName": "商品2",
              "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
              "productPrice": 2,
              "productStock": "3",
              "productSpec": "2",
              "createTime": "2018-05-18 14:40:43",
              "updateTime": "2018-05-22 13:32:17",
              "categoryName": "类目1"
            },
            {
              "id": "87a9a7dc0837463384ec0d209cd1b1de",
              "productName": "商品4",
              "categoryId": "ec75e480f0ee4051ba42e2b70dc4ce00",
              "productPrice": 1,
              "productIcon": "/dcback/file/7583efdcbf5c4309b39eaab541300989/e24f65fcf17e4cee9c804dabc08f9871.jpg",
              "createTime": "2018-05-18 11:35:13",
              "updateTime": "2018-05-21 10:00:45",
              "categoryName": "类目1"
            }
          ]
        }
      ]
    }
    console.log(options)
    let that = this,
        imgArray = this.data.imgArray
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10,
      mask: true
    })

    // 购物车位置
    this.busPos = {};
    this.busPos['x'] = 35;
    // this.busPos['x'] = app.globalData.ww / 2 - 10;
    this.busPos['y'] = app.globalData.hh - 50;
    console.log(this.busPos)

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