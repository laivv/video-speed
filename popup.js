
var playbackRate = chrome.extension.getBackgroundPage().playbackRate;
var statusCode = 'NOTFIND';
var maxPlaybackRate = 50;
var infoCfg = {
	FIND:{
		message:"检测到HTML5视频",
		color:"#00AA11",
		showExplain:false,
		showForce:false
	},
	NOTFIND:{
		message:"未检测到HTML5视频",
		color:"#ccc",
		showExplain:true,
		showForce:false
	},
	ERROR:{
		message:"变速可能未生效",
		color:"#ee0000",
		showExplain:true,
		showForce:true
	},
	FOECEFIND:{
		message:"检测到HTML5视频",
		color:"#00AA11",
		showExplain:false,
		showForce:true
	}
}

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
       if(request.cmd === "FIND" ||request.cmd === 'NOTFIND' || request.cmd=== 'ERROR' || request.cmd === 'FOECEFIND')
       {
       		statusCode = request.cmd;
       		refreshView();
	   }
    }
);

 var $$ = function(id){
 	return document.getElementById(id);
 }

var val = $$("val"),
	info = $$('info'),
	progress = $$("progress"),
	spinner = $$("spinner"),
	isforce = $$("isforce"),
	forceText = $$('force-text'),
	forceWrap = $$("force-wrap"),
	btnExplain = $$("btn-explain");

function refreshView(){
	info.innerText = infoCfg[statusCode].message;
	info.style.color = infoCfg[statusCode].color;
	btnExplain.style.display = infoCfg[statusCode].showExplain ? 'inline-block':'none';
	val.innerHTML = playbackRate.toFixed(1) + 'x';
	setProgress(playbackRate / maxPlaybackRate * 170);
	forceWrap.style.display = infoCfg[statusCode].showForce ? 'block':'none';
	
}

function init(){
	refreshView();
	setPlaybackRate();
	
}

function messageSender(cmd){
	chrome.tabs.query({active: true},function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, {cmd:cmd});
   });
}

function setPlaybackRate(){
	chrome.extension.getBackgroundPage().playbackRate = playbackRate;
	messageSender('setPlaybackRate');
}

function setProgress(n){
	var maxRange = 170 - 10;
	n  = n >= maxRange ? maxRange : n;
	spinner.style.left = n  + 'px';
}
isforce.addEventListener("change",function(e){
	if(this.checked)
	{
		forceText.style.color = 'red';
		messageSender("forceSetPlaybackRate");
	}
	else
	{
		forceText.style.color = "#ccc";
		messageSender("forceStopPlaybackRate");
	}
})

document.addEventListener("click",function(e){
	var n = 0.1;
	switch(e.target.id)
	{
		case 'btn-u':
			n = 0.1;
			break;
		case 'btn-d':
			n = -0.1;
			break;
		case 'btn-reset':
			break;
		case 'btn-force':
			isforce.checked = !isforce.checked;
			isforce.dispatchEvent(new Event("change"));
			return;
		default:
			return;
	}
	if(e.target.id !== 'btn-reset')
	{
		playbackRate += n;
	}
	else
	{
		playbackRate = 1;
	}
	
	playbackRate = playbackRate <= 0? 0.1 : playbackRate;
	playbackRate = playbackRate >= maxPlaybackRate ? maxPlaybackRate : playbackRate;
	
	
	refreshView();
	setPlaybackRate();
});





progress.addEventListener('click',function(ev){
	if(isFromDrag)
	{
		isFromDrag = false;
		return;
	}
	var percent =  ev.offsetX / 170;
	playbackRate = maxPlaybackRate * percent;

	playbackRate <= 0.1 ? 0.1 : playbackRate;

	refreshView();
	setPlaybackRate();
});


var isPress = false;
var isFromDrag = false;
var X = 0;
var mX = 0;

spinner.addEventListener('mousedown',function(e){
	isPress = true;
	X = parseFloat(spinner.style.left);
	mX = e.pageX;
});

document.addEventListener('mousemove',(function(){
	var timer = null;
	return function(e){
		if(isPress){
			var nX = e.pageX - mX ;
			var left = X + nX ;
			left = left < 0 ? 0 : left;
			left = left > 170 ? 170 : left;
			playbackRate = (left / 170) * maxPlaybackRate;
			playbackRate = playbackRate <= 0.1 ? 0.1 : playbackRate;
			refreshView();
			if(timer){
				clearTimeout(timer);
				timer = null;
			}
			timer = setTimeout(function(){
				setPlaybackRate();
			},100); 
		}
	}
})());

document.addEventListener('mouseup',function(e){
	isFromDrag = isPress;
	isPress = false;
});

init();