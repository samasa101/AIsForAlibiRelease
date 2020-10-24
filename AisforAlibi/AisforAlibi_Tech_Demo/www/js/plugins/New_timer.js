//===============================================================================
 /*:
 * @plugindesc  多组多功能计时器。
 *
 * @author 芯☆淡茹水
 * 
 * @help ____________________________________________________________________
 *插件命令：Timing_now 标题 时间 类型 开关ID
 *
 * 标题：辨别计时器计时的内容，如：副本时间 ， 双倍经验时间.....等。
 * 时间：倒计时时 -> 该时间初始为最大时间递减。 （单位：秒）
 *               正计时时-> 该时间作为正计时的最大时间。（单位：秒）
 * 类型：倒计时/正计时的标志， 0 为倒计时 ； 1 为正计时。
 *开关ID：计时完成后，所改变的开关ID。
 *               改变开关为非当前状态，也就是说，当计时结束时，开关
 *               原本关闭变成打开；开关原本打开变成关闭。
 *
 *举例：倒计时一个60秒的副本时间，计时完成后改变10号开关
 *            Timing_now 副本时间 60 0 10
 *
 *            正计时一个双倍经验时间，最大限制时间2分钟，计时完成后改变12号开关
 *            Timing_now 双倍经验时间 120 1 12
 *
 *插件命令：Timing_puase 开关ID
 *            暂停一个你正在计时的开关ID所对应的计时器。
 *            若没有开关ID所对应的计时器，则不做任何动作。
 *
 *插件命令：Timing_goon 开关ID
 *            将一个暂停的计时器恢复计时。
 *            若开关ID对应的计时器未暂停，则不做任何动作。
 *
 *插件命令：Timing_del 开关ID
 *            将一个已在计时的计时器（包括暂停）删除。
 *            若没有开关ID所对应的计时器，则不做任何动作。
 *____________________________________________________________________
 *注：添加计时无反应的情况：
 *当前所添加的计时开关正在计时中。
 *
 *该计时器只在地图场景计时。
 *____________________________________________________________________
 *---------------------------------------------------------------
 * @param WindowX
 * @desc 计时器组窗口X坐标。
 * @default 0
 *---------------------------------------------------------------
 * @param WindowY
 * @desc 计时器组窗口Y坐标。
 * @default 0
 *---------------------------------------------------------------
 * @param TitColor
 * @desc 计时器标题字体颜色。
 * @default #00ffff
 *---------------------------------------------------------------
 * @param WarnColor
 * @desc 倒计时时，时间少于10秒的时间颜色。
 * @default #ff0000
 *---------------------------------------------------------------
 * @param LowColor
 * @desc 倒计时时，时间少于30秒的时间颜色。
 * @default #ffff00
 *---------------------------------------------------------------
 * @param TimeColor
 * @desc 显示的时间字体颜色。
 * @default #ffffff
 *---------------------------------------------------------------
 */
//============================================================================= 
 (function() {
var XdrsNewTimeDate = XdrsNewTimeDate || {};
var xrtimepepr = PluginManager.parameters('New_timer');
XdrsNewTimeDate.WinX = parseInt(xrtimepepr['WindowX']) || 0;
XdrsNewTimeDate.WinY = parseInt(xrtimepepr['WindowY']) || 0;
XdrsNewTimeDate.TitColr = String(xrtimepepr['TitColor']) || '#00ffff';
XdrsNewTimeDate.WarnColor = String(xrtimepepr['WarnColor']) || '#ff0000';
XdrsNewTimeDate.LowColor = String(xrtimepepr['LowColor']) || '#ffff00';
XdrsNewTimeDate.TimeColor = String(xrtimepepr['TimeColor']) || '#ffffff';
//=============================================================================
var XdrsNewTimerPluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    XdrsNewTimerPluginCommand.call(this, command, args);
    if (command === 'Timing_now') {
        var tit = args[0], time = parseInt(args[1]), type = parseInt(args[2]),
        sw_id = parseInt(args[3]);
        $gameSystem.addTimer([tit,time,type,sw_id]);}
    if (command === 'Timing_puase') {
        $gameSystem.timerPuase(parseInt(args[0]));
    }
    if (command === 'Timing_goon') {
        $gameSystem.timerGoOn(parseInt(args[0]));
    }
    if (command === 'Timing_del') {
        $gameSystem.setDelId(parseInt(args[0]));
    }
};
//=============================================================================  
function Xr_Timer() {
    this.initialize.apply(this, arguments);
}
Xr_Timer.prototype = Object.create(Sprite.prototype);
Xr_Timer.prototype.constructor = Xr_Timer;
Xr_Timer.prototype.initialize = function(switchId, data) {
    Sprite.prototype.initialize.call(this);
    this._count = 0;
    this._setSwitch = false;
    this._switchId = switchId;
    this._tit = data[0];
    this._type = data[2];
    this._time = this._type === 0 ? data[1] : data[3];
    this._maxTime = this._type === 0 ? 0 : data[1];
    this.createBitmap();
    this.showTime();
};
Xr_Timer.prototype.id = function() {
    return this._switchId;
};
Xr_Timer.prototype.setPlace = function(x, y) {
    this.move(x,y);
};
Xr_Timer.prototype.createBitmap = function() {
    this.bitmap = new Bitmap(280,32);
};
Xr_Timer.prototype.update = function() {
    Sprite.prototype.update.call(this);
    if (!this.canGoOn()) return;
    this._count++;
    if (this._count % 60 === 0) this.updateTime();
    if (this._dataTime !== this._time) this.showTime();
};
Xr_Timer.prototype.updateTime = function() {
    if (this.canStop()) {
        if (!this._setSwitch) this.setSwitch();
        return;}
    this._time += this._type === 0 ? -1 : 1;
    this.sysData();
};
Xr_Timer.prototype.sysData = function() {
    $gameSystem.dataNum(this._switchId, this._time);
};
Xr_Timer.prototype.canStop = function() {
    var jud = this._type === 0 ? 0 : this._maxTime;
    return this._time === jud;
};
Xr_Timer.prototype.canGoOn = function() {
    if ($gameSystem.canTiming(this._switchId) &&
        $gameSystem.delId() !== this._switchId)
        return true;
    return false;
};
Xr_Timer.prototype.canDel = function() {
    return this._setSwitch;
};
Xr_Timer.prototype.setSwitch = function() {
    var jud = (!$gameSwitches.value(this._switchId));
    $gameSwitches.setValue(this._switchId, jud);
    this._setSwitch = true;
};
Xr_Timer.prototype.showTime = function() {
    this._dataTime = this._time;
    this.bitmap.clear();
    this.bitmap.fontSize = 22;
    this.bitmap.textColor = XdrsNewTimeDate.TitColr;
    this.bitmap.drawText(this._tit, 4, 10, 140, 20, 'left');
    this.bitmap.textColor = this.timerColor();
    this.bitmap.drawText(this.timetext(), 110, 10, 140, 20, 'right');
};
Xr_Timer.prototype.timerColor = function() {
    if (this._type === 1)  return XdrsNewTimeDate.TimeColor;
    if (this._time <= 10)  return XdrsNewTimeDate.WarnColor;
    if (this._time <= 30)  return XdrsNewTimeDate.LowColor;
    return XdrsNewTimeDate.TimeColor;
};
Xr_Timer.prototype.timetext = function() {
    var hour = Math.floor(this._time / 60 / 60) % 60;
    var min = Math.floor(this._time / 60) % 60;
    var sec = this._time % 60;
    return hour.padZero(2) + ':' + min.padZero(2) + ':' + sec.padZero(2);
};
//========================================================================
var Xdrs_NewTimer_Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    this._timerData = {};
    this._stopsTab = [];
    this.iniDelId();
    this.iniTip();
    Xdrs_NewTimer_Game_System_initialize.call(this); 
};
Game_System.prototype.timerData = function() {
    return this._timerData;
};
Game_System.prototype.canTiming = function(id) {
    if (this._stopsTab.length === 0) return true;
    for (var i=0; i<this._stopsTab.length;i++) {
        if (this._stopsTab[i] == id) return false;
    }
    return true;
};
Game_System.prototype.timerPuase = function(id) {
    if (!this.hasTimer(id)) return;
    for (var i=0; i<this._stopsTab.length;i++) {
        if (this._stopsTab[i] === id) return;
    }
    this._stopsTab.push(id);
};
Game_System.prototype.timerGoOn = function(id) {
    for (var i=0; i<this._stopsTab.length;i++) {
        if (this._stopsTab[i] == id) this._stopsTab.splice(i, 1);
    }
};
Game_System.prototype.iniDelId = function() {
    this._delId = 0;
};
Game_System.prototype.delId = function() {
    return this._delId;
};
Game_System.prototype.setDelId = function(id) {
    this._delId = id;
};
Game_System.prototype.iniTip = function() {
    this._addTip = false;
};
Game_System.prototype.openTip = function() {
    this._addTip = true;
};
Game_System.prototype.addTip = function() {
    return this._addTip;
};
Game_System.prototype.canAdd = function() {
    return this._addTip && this.timeSize() > 0;
};
Game_System.prototype.timeSize = function() {
    var data = [];
    for (var i in this._timerData) data.push(i);
    return data.length;
};
Game_System.prototype.dataNum = function(id, num) {
    var index = this._timerData[id][2] === 0 ? 1 : 3;
    this._timerData[id][index] = num;
};
Game_System.prototype.addTimer = function(data) {
    if (this.hasTimer(data[3])) return;
    this._timerData[data[3]] = [data[0],data[1],data[2], 0];
    this.openTip();
};
Game_System.prototype.deleteTimer = function(id) {
    this.timerGoOn(id);
    delete this._timerData[id];
};
Game_System.prototype.hasTimer = function(id) {
    return id in this._timerData;  
};
//================================================================
var Xdrs_NewTimer_Spriteset_Map_ini = Spriteset_Map.prototype.initialize;
Spriteset_Map.prototype.initialize = function() {
    this._timers = [];
    $gameSystem.openTip();
    Xdrs_NewTimer_Spriteset_Map_ini.call(this);
};
var Xdrs_NewTimer_Spriteset_Map_update = Spriteset_Map.prototype.update;
Spriteset_Map.prototype.update = function() {
    Xdrs_NewTimer_Spriteset_Map_update.call(this);
    this.updateTimer();
};
Spriteset_Map.prototype.addtimer = function() {
    var ay = this._timers.length;
    for (var i in $gameSystem.timerData()) {
        if (this.hasTimer(i)) continue;
        var timer = new Xr_Timer(i, $gameSystem.timerData()[i]);
        timer.setPlace(XdrsNewTimeDate.WinX, XdrsNewTimeDate.WinY + 32 * ay);
        this._timers.push(timer);
        this.addChild(timer);
        ay++;
    }
};
Spriteset_Map.prototype.updateTimer = function() {
    if ($gameSystem.canAdd()){
        this.addtimer();
        $gameSystem.iniTip();
    }
    if (this._timers.length === 0) return;
    for (var i=0;i< this._timers.length; i++){
        if (this._timers[i].canDel() ||
            $gameSystem.delId() == this._timers[i].id()) {
            if ($gameSystem.delId() == this._timers[i].id()){
                $gameSystem.iniDelId();
            }
            this.delTimer(i);
            }
    }
};
Spriteset_Map.prototype.delTimer = function(index) {
    $gameSystem.deleteTimer(this._timers[index].id());
    this.removeChild(this._timers[index]);
    this._timers.splice(index, 1);
    this.setTimerplace();
};
Spriteset_Map.prototype.hasTimer = function(id) {
    if (this._timers.length === 0) return false;
    for (var i=0;i< this._timers.length; i++){
        if (this._timers[i].id() === id) return true;
    }
    return false;
};
Spriteset_Map.prototype.setTimerplace = function() {
    for (var i=0;i< this._timers.length; i++){
       this._timers[i].setPlace(XdrsNewTimeDate.WinX, XdrsNewTimeDate.WinY + 32 * i);
    }
};
})();
//================================================================