/*
Mon Sep 22 2014 17:08:39 GMT+0800 (CST)
combined files by KMD:

index.js
lib/util.js
*/

KISSY.add('kg/curve/1.0.0/index',["node","base","./lib/util"],function(S ,require, exports, module) {
var Node = require('node');
var Base = require('base');
var Util = require('./lib/util');

var $ = Node.all;

var Curve = Base.extend({

    initializer : function(){
        this._initStage();
    },

    rotate : function(v){
        if(this.get('load')){
            this._load(v);
        }else{
            this._rotate(v);
        }
    },

    _initStage : function(){
        var self = this;

        var items = $(self.get('item'));

        //单个元素宽高
        var item = $(items[0]);
        self._itemH = item.outerHeight();
        self._itemW = item.outerWidth();

        // init container
        var perspective = self.get('perspective') + 'px';
        self.get('container').css({
            '-webkit-perspective': perspective,
            'perspective': perspective
        });

        // init stage
        self.get('stage').css({
            'height': self._itemH,
            'width': self._itemW,
            'margin': '0 auto',
            'position': 'relative',
            'transform-style': 'preserve-3d',
            '-webkit-transition': '-webkit-transform 1s',
            '-moz-transition': '-moz-transform 1s',
            'transition': 'transform 1s'
        });

        //设定旋转范围
        self._initStageTransform();

        // init item
        self._initItemCatch();
        S.each(items, function(item, index){
            var pos = self.itemCatch[index].pos;
            self._rePositionItem(item, pos);
        });

    },

    _initStageTransform : function(){
        var self = this;

        var step = self.get('step');
        var items = $(self.get('item'));

        //容器1/2宽度
        var W = self.get('container').outerWidth()/2;

        //圆弧半径
        var R = Util.getHypotenuse({
            o : self._itemW/2,
            d : step/2
        });

        //圆弧所对圆心角的1/2
        var D = Util.getDegree({
            o : W,
            r : R
        });

        //container到圆心距离
        self._H = Util.getAdjacent({
            d : D,
            r : R
        });

        var l_rotate = D - step/2; //第一个元素贴近左边界时需要的旋转角度
        var r_rotate = step * items.length - (D + step/2); //最后一个元素贴近右边界的旋转角度

        self.set('range', {
            min : Math.min(l_rotate, r_rotate),
            max : Math.max(l_rotate, r_rotate),
            visualRange : 2 * D,
            visualNum : 2 * D/step
        });

        self._rotate(l_rotate);
    },


    _rotate : function(v){
        var range = this.get('range');

        if(v < range.min){
            v = range.min;
        }else if(v > range.max){
            v = range.max;
        }

        var transformValue = 'translateZ('+ this._H +'px) rotateY(' + v + 'deg)';

        this.get('stage').css({
            '-ms-transform': transformValue,
            '-webkit-transform': transformValue,
            '-moz-transform': transformValue,
            'transform': transformValue
        });

        this.set('range', {
            cur : v
        });
    },

    _load : function(v){
        var self = this;

        var range = this.get('range');
        var step = this.get('step');
        var n = 0;

        if(v < range.min){

            n = Math.ceil((range.min - v)/step);
            this.fire('load',{
                loadType : 'prepend',
                num : n,
                callback : function(html){
                    self._prependItems(html);
                    self._rotate(v);
                }
            });

        }else if(v > range.max){

            n = Math.ceil((v - range.max)/step);
            this.fire('load',{
                loadType : 'append',
                num : n,
                callback : function(html){
                    self._appendItems(html);
                    self._rotate(v);
                }
            });

        }else{
            this._rotate(v);
        }
    },

    /**
     * 往当前节点之前增加内容
     * @param html
     * @private
     */
    _prependItems : function(html){
        var self = this;

        var items = $(html);
        var range = self.get('range');
        var step = this.get('step');

        var index;
        var posInfo;
        S.each(items, function(item){
            self._prependItemCatch([item]);
            index = self.itemCatch.first;
            posInfo = self.itemCatch[index].pos;
            self._rePositionItem(item, posInfo);
        });

        self.get('stage').prepend(items);

        var len = items.length;
        self.set('range', {
            min : range.min - step * len
        });
    },

    /**
     * 往后追加
     * @param html
     * @private
     */
    _appendItems : function(html){
        var self = this;

        var items = $(html);
        var range = self.get('range');
        var step = this.get('step');

        var index;
        var posInfo;
        S.each(items, function(item){
            self._appendItemCatch([item]);
            index = self.itemCatch.last;
            posInfo = self.itemCatch[index].pos;
            self._rePositionItem(item, posInfo);
        });

        self.get('stage').append(items);

        var len = items.length;
        self.set('range', {
            max : range.max + step * len
        });
    },


    /**
     * 调整元素位置
     * @param itemEl 节点
     * @param itemPos  位置信息
     * @private
     */
    _rePositionItem : function(itemEl, itemPos){
        var d = 0 - itemPos.d;
        var transformValue = 'translateZ(' + itemPos.z + 'px)  rotateY(' + d +'deg)';

        $(itemEl).css({
            'display' : 'block',
            'position' : 'absolute',
            'left': itemPos.left  + 'px',
            '-ms-transform-origin-x': 'left',
            '-webkit-transform-origin-x': 'left',
            '-moz-transform-origin-x': 'left',
            'transform-origin-x': 'left',
            '-ms-transform': transformValue,
            '-moz-transform': transformValue,
            '-webkit-transform': transformValue,
            'transform': transformValue
        });
    },



    _initItemCatch : function(){
        var self = this;

        var items = S.makeArray($(self.get('item')));

        if(!items.length){
            return ;
        }

        self.itemCatch = {
            first : 0,
            last : 0
        };

        //第一个元素到圆心的距离
        var z = Util.getAdjacent({
            o : self._itemW/2,
            d : self.get('step')/2
        });

        self.itemCatch[0] = {
            pos : {
                d : 0, //选转角度
                w : self._itemW,  //投影后的宽度
                h : 0,  //高
                z : -z,  //后退距离
                left : 0  //偏移距离
            },
            el : items[0]
        };

        items.shift();
        self._appendItemCatch(items);
    },

    _appendItemCatch : function(items){

        var lastIndex = this.itemCatch.last;
        var n = items.length;

        for(var i = 0 ; i< n; i++){
            var last = this.itemCatch[lastIndex + i].pos;
            this.itemCatch[lastIndex + i + 1]={
                pos : this._getNextPos(last) ,
                el : items[i]
            };
        }

        this.itemCatch.last = lastIndex + n;
    },


    _prependItemCatch :function(items){
        var firstIndex = this.itemCatch.first;
        var n = items.length;

        items.reverse();

        for(var i = 0; i< n; i++){
            var first = this.itemCatch[firstIndex + i].pos;
            this.itemCatch[firstIndex - i - 1]={
                pos : this._getPrePos(first),
                el : items[i]
            };
        }

        this.itemCatch.first = firstIndex - n;
    },


    /**
     * 根据传入的位置，推算出下一个元素的位置信息
     * @param cur 当前元素
     * @returns {{d: *, w: *, h: *, z: *, left: *}}
     * @private
     */
    _getNextPos : function(cur){
        var d = cur.d + this.get('step');

        var w = Util.getAdjacent({
            r : this._itemW,
            d : d
        });

        var h = Util.getOpposite({
            r : this._itemW,
            d : d
        });

        return {
            d : d,
            w : w,
            h : h,
            z : cur.z + cur.h,
            left : cur.left + cur.w
        };
    },

    _getPrePos : function(cur){
        var d = cur.d - this.get('step');

        var w = Util.getAdjacent({
            r : this._itemW,
            d : d
        });

        var h = Util.getOpposite({
            r : this._itemW,
            d : d
        });

        return {
            d : d,
            w : w,
            h : h,
            z : cur.z - h,
            left : cur.left - w
        };
    }
},{
    ATTRS : {
        /**
         * 外层容器
         */
        container : {
            value : '.ks-curve',
            getter: function (v) {
                return $(v);
            }
        },

        /**
         * 舞台
         */
        stage : {
            value : '.ks-curve-stage',
            getter: function (v) {
                return $(v);
            }
        },

        /**
         * 单列
         */
        item : {
            value : '.ks-curve-item'
        },

        /**
         * 透视效果
         */
        perspective : {
            value : 800
        },

        /**
         * 选择角度
         */
        step : {
            value : 5
        },

        /**
         * 是否动态加载
         */
        load : {
            value : false
        },

        /**
         * 弧度范围
         */
        range : {
            value : {},
            setter: function(v) {
                var value = this.get('range');
                S.mix(value, v);
                return value;
            }
        }
    }
});

module.exports = Curve;




});
KISSY.add('kg/curve/1.0.0/lib/util',[],function(S ,require, exports, module) {
/**
 * Created by Shuilan on 14-9-11.
 */


//r : 斜边 Hypotenuse
//a : 临边 Adjacent
//o : 对边 Opposite
//d : 角度

var Util =  {

    /**
     * 对边
     * @param params
     * @returns {number}
     * @private
     */
    getOpposite : function(params){
        if(params.r){
            return Math.round(params.r * Math.sin(params.d / 180 * Math.PI)*100)/100;
        }else if(params.a){
            return Math.round(params.a * Math.tan(params.d / 180 * Math.PI)*100)/100;
        }
        return 0;
    },

    /**
     * 临边
     * @param params
     * @returns {number}
     * @private
     */
    getAdjacent : function(params){
        if(params.r){
            return Math.round(params.r * Math.cos(params.d / 180 * Math.PI)*100)/100;
        }else if(params.o){
            return Math.round(params.o / Math.tan(params.d / 180 * Math.PI)*100)/100;
        }
        return 0;
    },

    /**
     * 斜边
     * @param params
     * @returns {number}
     * @private
     */
    getHypotenuse : function(params){
        if(params.o){
            return Math.round(params.o / Math.sin(params.d / 180 * Math.PI)*100)/100;
        }else if(params.a){
            return Math.round(params.a / Math.cos(params.d / 180 * Math.PI)*100)/100;
        }
        return 0;
    },

    /**
     * 根据边计算角度
     * @param params
     * @returns {number}
     * @private
     */
    getDegree : function(params){
        if(params.o && params.r){
            return Math.round(Math.asin(params.o / params.r) * 180 / Math.PI *100) / 100;
        }
        return 0;
    }
};

module.exports = Util;
});