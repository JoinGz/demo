import {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} from "tapable"
 
const hook = new SyncHook(["arg1", "arg2", "arg3"]);

// 注册
hook.tap("WarningLampPlugin", (arg1) => console.log(`yes, back~, ${arg1}`));
hook.tap("注册的名字", (arg1) => console.log(`yes, back~2, ${arg1}`));

hook.call("触发所有注册的事件")

console.log(1)