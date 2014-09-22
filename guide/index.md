## 综述

Curve。

## 初始化组件

	<div class="ks-curve">
	    <div class="ks-curve-stage">
	        <div class="ks-curve-item">...</div>
	        <div class="ks-curve-item">...</div>
	        <div class="ks-curve-item">...</div>
	        <div class="ks-curve-item">...</div>
	    </div>
	</div>

初始化

    S.use('kg/curve/1.0.0/index', function (S, Curve) {
        var curve = new Curve();
    })

## API说明

可选参数：

	container : 外层容器，默认值 '.ks-curve'
	stage: item外层，默认值  '.ks-curve-stage'
	item : 列，默认值 '.ks-curve-item'
	perspective: 设置容器透视效果，默认值  800
	step : 每个面的递增旋转角度，即单边所对圆心角，默认值 5
	load: 曲面旋转到边界时，是否需要异步加载数据，默认值  false

注意：

容器宽高和单列的宽高需要自行在样式中设定

组件按固定曲度，将已有节点调整为曲面展示，因此可能有部分节点会展示到容器外部，可结合rotate方法，旋转曲面

对于需要在容器内恰好展示指定元素个数的需求，可自行调整宽高，组件暂无封装方法

### 旋转曲面
[demo](../demo/normal)

curve.rotate(旋转角度)

实例化组件后，通过`curve.get('range')` 方法可获得曲面的可选择范围

	{
		min : 最小可选择角度 即第一个元素贴紧容器左边界的情况
		max: 最大可选择角度 即最后一个元素贴紧容器右边界的情况
		cur : 当前旋转角度
	}



### 动态加载

[demo](../demo/load)

初始化配置load为true

当曲面旋转到左右边界时，会触发load事件

参数：

* num：当前旋转角度需加载的元素个数

* type：prepend || append  往前/后追加

* callback： 回传需新渲染元素的html

### 缩放

设置container的scale值