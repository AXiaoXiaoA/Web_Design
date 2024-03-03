var cityMap = {
    "安徽": "340000",
    "合肥市": "340100",
    "北京": '110000',
    "北京市": "110100",
    "福建": '350000',
    "福州市": "350100",
    "南平市": "350700",
    "广东": '440000',
    "珠海市": "440400",
    "河北": '130000',
    "邯郸市": "130400",
    "黑龙江": '230000',
    "哈尔滨市": "230100",
    "河南": '410000',
    "郑州市": "410100",
    "开封市": "410200",
    "洛阳市": "410300",
    "焦作市": "410800",
    "吉林": '220000',
    "长春市": "220100",
    "延边朝鲜族自治州": "222400",
    "四川": '510000',
    "成都市": "510100",
    "德阳市": "510600",
    "广元市": "510800",
    "新疆": '650000',
    "乌鲁木齐市": "650100",
    "吐鲁番地区": "652100",
    "巴音郭楞蒙古自治州": "652800",
    "伊犁哈萨克自治州": "654000",
    "阿勒泰地区": "654300",
}
$(function () {//dom加载后执行
    mapChart('mapChart')
})
/**
 * 根据Json里的数据构造Echarts地图所需要的数据
 * @param {} mapJson 
 */
function initMapData(mapJson) {
    var mapData = [];
    for (var i = 0; i < mapJson.features.length; i++) {
        mapData.push({
            name: mapJson.features[i].properties.name,
        })
    }
    return mapData;
}

/**
 * 返回上一级地图
 */
function back() {
    if (mapStack.length != 0) {//如果有上级目录则执行
        var map = mapStack.pop();
        $.get('../json/' + map.mapId + '.json', function (mapJson) {
            registerAndsetOption(myChart, map.mapId, map.mapName, mapJson, false)
            //返回上一级后，父级的ID、Name随之改变
            parentId = map.mapId;
            parentName = map.mapName;
        })
    }
}

//中国地图（第一级地图）的ID、Name、Json数据
var chinaId = 100000;
var chinaName = 'china'
var chinaJson = null;
//记录父级ID、Name
var mapStack = [];
var parentId = null;
var parentName = null;
var cityId = null;
//Echarts地图全局变量，主要是在返回上级地图的方法中会用到
var myChart = null;
function mapChart(divid) {
    $.get('../json/' + chinaId + '.json', function (mapJson) {
        chinaJson = mapJson;
        myChart = echarts.init(document.getElementById(divid));
        registerAndsetOption(myChart, chinaId, chinaName, mapJson, false)
        parentId = chinaId;
        parentName = 'china'
        window.addEventListener('resize', function () {
            myChart.resize();
        });
        myChart.on('click', function (param) {
            cityId = cityMap[param.name];
            if (cityId && mapStack.length > 0) {
                showModal(cityId);
            }
            else if (cityId) {
                $.get('../json/' + cityId + '.json', function (mapJson) {
                    registerAndsetOption(myChart, cityId, param.name, mapJson, true)
                })
            }
        });
    })
}

/**
 * 
 * @param {*} myChart 
 * @param {*} id        省市县Id
 * @param {*} name      省市县名称
 * @param {*} mapJson   地图Json数据
 * @param {*} flag      是否往mapStack里添加parentId，parentName
 */
function registerAndsetOption(myChart, id, name, mapJson, flag) {
    echarts.registerMap(name, mapJson);
    myChart.setOption({
        series: [{
            type: 'map',
            map: name,
            itemStyle: {
                normal: {
                    areaColor: 'rgba(23, 27, 57,0)',
                    borderColor: '#1dc199',
                    borderWidth: 1.5,
                },
                emphasis: {
                    areaColor: 'rgba(23, 27, 57,1)',
                    borderColor: '#1dc199',
                    borderWidth: 1,
                },
            },
            data: initMapData(mapJson)
        }]
    });
    if (flag) {//往mapStack里添加parentId，parentName,返回上一级使用
        mapStack.push({
            mapId: parentId,
            mapName: parentName
        });
        parentId = id;
        parentName = name;
    }
}

$(document).ready(function () {
    $('.close').click(function () {
        closeModal(cityId); // 关闭模态框
    });
});

// 显示模态框
function showModal(cityId) {
    var modalId = getModalId(cityId);
    $('#' + modalId).css('display', 'block');
}

// 关闭模态框
function closeModal(cityId) {
    var modalId = getModalId(cityId);
    $('#' + modalId).css('display', 'none');
}

// 根据城市ID获取模态框ID
function getModalId(cityId) {
    return 'Modal-' + cityId;
}