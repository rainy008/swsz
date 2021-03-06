var that;
var Bmob = require('../../utils/bmob.js');
Page({


  data: {
    score:0,
    choseQuestionBank:'',
    singleQuestionList: [],
    multiQuestionList: [],
    loading:true,
    defeatNumber: 0,
    averageScore: 0,
    correctRate: 0
  },


  onLoad: function (options) {
    that=this;

    var choseQuestionBank = getApp().globalData.choseQuestionBank;
    that.setData({
      choseQuestionBank: choseQuestionBank
    });
    var currentUser = Bmob.User.current();
    var currentUserId = currentUser.id;
    var getSingleQuestionList = getApp().globalData.singleChoiceAnswerNow;
    var getMultiQuestionList = getApp().globalData.multiChoiceAnswerNow;
    console.log(getSingleQuestionList);
    for (var i = 0; i < 20; i++) {
      getSingleQuestionList[i].attributes.number = i + 1;
    }
    for (var j = 0; j < 20; j++) {
      getMultiQuestionList[j].attributes.number = j + 1;
    }
   
    var score = getApp().globalData.score;
    that.setData({
      score: score,
      singleQuestionList: getSingleQuestionList,
      multiQuestionList: getMultiQuestionList,
    });
    console.log(getSingleQuestionList);
    var saveSingleQuestionList=new Array();
    var saveMultiQuestionList = new Array();
    for(var i=0;i<20;i++){
      saveSingleQuestionList[i] = getSingleQuestionList[i].attributes;
      saveMultiQuestionList[i] = getMultiQuestionList[i].attributes;
    }
    console.log(saveMultiQuestionList)

    that.deleteHistory(currentUserId, choseQuestionBank, currentUserId, score, saveSingleQuestionList, saveMultiQuestionList)
  },

  deleteHistory: function (userId, choseQuestionBank, currentUserId, score, saveSingleQuestionList, saveMultiQuestionList){
    var History = Bmob.Object.extend("history");
    var queryHistory = new Bmob.Query(History);
    queryHistory.equalTo("user", userId);
    queryHistory.equalTo("choseQuestionBank", choseQuestionBank);
    queryHistory.find().then(function (todos) {
      return Bmob.Object.destroyAll(todos);
    }).then(function (todos) {
      console.log(todos);
      that.inputHistory(currentUserId, score, saveSingleQuestionList, saveMultiQuestionList, choseQuestionBank);
      that.saveQBAttributes();
      that.getHistory();
      that.getDefeatNumber();
    }, function (error) {
      // 异常处理
    });
  },

  inputHistory: function (userId, score, getSingleQuestionList, getMultiQuestionList, choseQuestionBank){

    var User = Bmob.Object.extend("_User");
    var queryUser = new Bmob.Query(User);
    var currentUser = Bmob.User.current();
    var currentUserId = currentUser.id;
    queryUser.get(currentUserId, {
      success: function (result) {

        var university = result.get("university");
        var realName = result.get("realName");
        var userPic = result.get("userPic");

        var History = Bmob.Object.extend("history");
        var History = new History();
        History.set("user", userId);
        History.set("university", university);
        History.set("realName", realName);
        History.set("userPic", userPic);
        History.set("likeList", []);
        History.set("score", score);
        History.set("likeNumber", 0);
        History.set("singleQuestionList", getSingleQuestionList);
        History.set("multiQuestionList", getMultiQuestionList);
        History.set("choseQuestionBank", choseQuestionBank);
        History.save(null, {
          success: function (result) {
            result.save();
          }
        })

      },
      error: function (object, error) {
        // 查询失败
      }
    });
  },

  getHistory:function(){
    var choseQuestionBank = that.data.choseQuestionBank;
    var History = Bmob.Object.extend("history");
    var queryHistory = new Bmob.Query(History);
    var overPeople=0;
    queryHistory.equalTo("choseQuestionBank", choseQuestionBank);
    queryHistory.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          if (getApp().globalData.score>results[i].attributes.score){
            overPeople++;
          }
        }
        console.log(overPeople)
        that.setOverPeople(overPeople)
      },
      error: function (error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },


  setOverPeople: function (overPeople){
    console.log(overPeople)
    var History = Bmob.Object.extend("history");
    var queryHistory = new Bmob.Query(History);
    var currentUser = Bmob.User.current();
    var currentUserId = currentUser.id;
    queryHistory.get(currentUserId,{
      success: function (result) {
        result.set('overPeople', overPeople);
        result.save();
      },
      error: function (object, error) {

      }
    });
  },

  showDetail: function (e) {
    var index = e.currentTarget.dataset.index;
    var choseType = e.currentTarget.dataset.chosetype;
    if (choseType =='single'){
      wx.navigateTo({
        url: '../analysis/analysis?choseType=single&index=' + index
      });
    }
    else if (choseType == 'multi')
    wx.navigateTo({
      url: '../analysis/analysis?choseType=multi&index=' + index
    });
  },


  saveQBAttributes: function () {
    var choseQuestionBank = that.data.choseQuestionBank;
    var QBAttributes = Bmob.Object.extend("QBAttributes");
    var queryQBAttributes = new Bmob.Query(QBAttributes);
    if (choseQuestionBank =='警务实战知识'){
      queryQBAttributes.get('bKhn444H', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
    else if (choseQuestionBank == '题库1') {
      queryQBAttributes.get('oNR5UUU7', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
    else if (choseQuestionBank == '题库2') {
      queryQBAttributes.get('2S3A000S', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
    else if (choseQuestionBank == '题库3') {
      queryQBAttributes.get('vOeIBBBi', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
    else if (choseQuestionBank == '题库4') {
      queryQBAttributes.get('XHJSNNNP', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
    else if (choseQuestionBank == '题库5') {
      queryQBAttributes.get('lkjnFFFS', {
        success: function (result) {
          var peopleNumber = result.attributes.PeopleNumber + 1;
          var allScore = getApp().globalData.score + result.attributes.allScore;
          var averageScore = allScore / peopleNumber;
          var newAverageScore = averageScore.toFixed(1);
          var correctRate = getApp().globalData.score / 60 * 100;
          var newCorrectRate = correctRate.toFixed(1);
          result.set('PeopleNumber', peopleNumber);
          result.set('allScore', allScore);
          result.set('averageScore', averageScore);
          result.save();
          that.setData({
            // defeatNumber: ,
            averageScore: newAverageScore,
            correctRate: newCorrectRate
          });
        },
        error: function (object, error) {
          console.log("ccc")
        }
      });
    }
  },

  allAnalysis:function(){
    var index = 0;
    wx.navigateTo({
      url: '../analysis/analysis?choseType=single&index=' + index
    });
  },

  returnMainPage:function(){
    wx.switchTab({
      url: '../choiceMain/choiceMain'
    })
  },

  getDefeatNumber: function () {
    var choseQuestionBank = that.data.choseQuestionBank;
    var History = Bmob.Object.extend("history");
    var queryHistory = new Bmob.Query(History);
    var defeatNumber = 0;
    if (choseQuestionBank == '警务实战知识') {
      queryHistory.equalTo("choseQuestionBank", "警务实战知识");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (choseQuestionBank == '题库1') {
      queryHistory.equalTo("choseQuestionBank", "题库1");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (choseQuestionBank == '题库2') {
      queryHistory.equalTo("choseQuestionBank", "题库2");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (choseQuestionBank == '题库3') {
      queryHistory.equalTo("choseQuestionBank", "题库3");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (choseQuestionBank == '题库4') {
      queryHistory.equalTo("choseQuestionBank", "题库4");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
    else if (choseQuestionBank == '题库5') {
      queryHistory.equalTo("choseQuestionBank", "题库5");
      queryHistory.find({
        success: function (results) {
          for (var i = 0; i < results.length; i++) {
            var score = results[i].attributes.score;
            if (that.data.score > score) {
              defeatNumber++;
            }
          }
          that.setData({
            defeatNumber: defeatNumber,
            loading: false
          });
        },
        error: function (error) {
          console.log("查询失败: " + error.code + " " + error.message);
        }
      });
    }
  },


  


 
})