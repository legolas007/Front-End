let Public={
    addOnloadEvent:function (func) {
        let oldOnload=window.onload;
        if (typeof oldOnload!='function') {
            window.onload=func;
        } else {
            window.onload=function () {
                oldOnload();
                func();
            }
        }
    },
    parseTimeStr:function (time) {
        if (typeof time!='number') return;

        let min=parseInt(time/60);
        let sec=parseInt(time%60);
        min=min<10?'0'+min:min;
        sec=sec<10?'0'+sec:sec;
        return min+':'+sec;
    },
    updateClass:function (oldClass,newClass) {
        let target=document.querySelector('.'+oldClass);
        if (target) {
            let targetClassList=target.classList;
            if (targetClassList.contains(oldClass)) {
                targetClassList.remove(oldClass);
                targetClassList.add(newClass);
            }
        }
    },
    switchClass:function (targetClassList,newClass) {
        if (targetClassList.contains(newClass)) {
            targetClassList.remove(newClass);
        } else {
            targetClassList.add(newClass);
        }
    },
    getSummaryOffsetLeft:function (el) {
        let offsetLeft=el.offsetLeft;
        while (el.offsetParent) {
            el=el.offsetParent;
            offsetLeft+=el.offsetLeft;
        }
        return offsetLeft;
    }
};

let EventUtil={
    addHandler:function (el,type,handler) {
        if (el.addEventListener) {
            el.addEventListener(type,handler,false);
        } else if (el.attachEvent) {
            el.attachEvent('on'+type,handler);
        } else {
            el['on'+type]=handler;
        }
    },
    removeHandler: function(el,type,handler) {
        if (el.removeEventListener) {
            el.removeEventListener(type,handler);
        } else if (el.detachEvent) {
            el.detachEvent(type,handler);
        } else {
            el['on'+type]=null;
        }
    },
    getEvent: function (event) {
        return event?event:window.event;
    },
    getTarget:function (event) {
        return event.target||event.srcElement;
    }
};

/*Onload step:
* 1.Before can play,show the loading animation.
* 2.When can play,initiate the player by initiatePlay().*/

let audioPlayer=document.querySelector('audio');

EventUtil.addHandler(audioPlayer,'canplay',function () {
    /*start album cover animation,
     * change play icon to pause icon*/
    resetCoverAnimation();
    coverAnimationControlFunc('running');
    changeInfoFunc();
});

EventUtil.addHandler(audioPlayer,'play',function () {
    coverAnimationControlFunc('running');
    Public.updateClass('icon-icon-play','icon-icon-pause');
});

EventUtil.addHandler(audioPlayer,'pause',function () {
    coverAnimationControlFunc('paused');
    Public.updateClass('icon-icon-pause','icon-icon-play');
});

EventUtil.addHandler(audioPlayer,'timeupdate',function () {
    updateCurrentTime();
    //let pastProgressPercent=(audioPlayer.currentTime/audioPlayer.duration).toFixed(3);
    changeProgressWidth((audioPlayer.currentTime/audioPlayer.duration).toFixed(4));
});

EventUtil.addHandler(audioPlayer,'ended',function () {
    nextSongFunc();
});

let playListObj={
    currentSongId:0,
    songName:['Only One','让我留在你身边','Fairy Tail Main Theme'],
    singer:['BoA','陈奕迅','高梨康治'],
    /*Take the load speed into consideration,use the following src instead of local src.*/
    songSrc:[
        'audio/BoA - Only One (inst.) - instrumental.mp3',
       'audio/陈奕迅 - 让我留在你身边.mp3',
        'audio/高梨康治 - FAIRY TAIL Main Theme.mp3'
    ],
    albumCoverSrc:[
        'img/album-cover/cover-1.jpg',
        'img/album-cover/cover-2.jpg',
        'img/album-cover/cover-3.jpg'
    ]
};

//初始化播放器
function initiatePlay() {
    audioPlayer.src=playListObj.songSrc[playListObj.currentSongId];

    //Event delegate optimize:
    let controlPanel=document.querySelector('.control-panel');
    EventUtil.addHandler(controlPanel,'click',function (event) {
        let targetId=EventUtil.getTarget(event).id;
        let targetClassList=EventUtil.getTarget(event).classList;

        switch (targetId) {
            case 'icon-play-and-pause' :
                pauseBtnFunc();
                break;
            case 'icon-next':
                nextSongFunc();
                break;
            case 'icon-yinliang':
                volumeBtnFunc();
                break;
            case 'icon-aixin':
                loveBtnFunc(targetClassList);
                break;
            case 'icon-laji2':
                garbageBinBtnFunc();
                break;
            /*progress bar not suitable.*/
        }
    });

    let volumeWrapper=document.querySelector('.volume-btn');
    EventUtil.addHandler(volumeWrapper,'mouseover',
        function () {
            let volumeBar=document.querySelector('.volume-bar-wrapper');
            Public.switchClass(volumeBar.classList,'showed-volume-bar');
        }
    );
    EventUtil.addHandler(volumeWrapper,'mouseout',
        function () {
            let volumeBar=document.querySelector('.volume-bar-wrapper');
            Public.switchClass(volumeBar.classList,'showed-volume-bar');
        }
    );

    let progressBar=document.querySelector('#progress-bar');
    EventUtil.addHandler(progressBar,'click',progressBarControlFunc);

    let volumeBarWrapper=document.querySelector('.volume-bar-wrapper');
    EventUtil.addHandler(volumeBarWrapper,'click',volumeBarControlFunc);
}

// Public.addOnloadEvent(initiatePlay);

initiatePlay();

//暂停/开始按钮功能,pause/play btn func
function pauseBtnFunc() {
    if (audioPlayer.paused===true) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

//下一首按钮功能,next btn func
function nextSongFunc() {
    playListObj.currentSongId++;
    playListObj.currentSongId=playListObj.currentSongId>2?0:playListObj.currentSongId++;
    audioPlayer.src=playListObj.songSrc[playListObj.currentSongId];
}

//音量按钮功能,volume btn func
function volumeBtnFunc() {
    if (audioPlayer.volume!==0) {
        audioPlayer.volume=0;
        changeVolumeBarWidth(0);
    } else {
        audioPlayer.volume=0.5;
        changeVolumeBarWidth(0.5);
    }
}

//音量条控制功能,volume bar control function:
function volumeBarControlFunc(event) {
    let e=window.event||event;
    //console.log(e.pageX+'\n'+this.offsetLeft+'\n'+this.offsetWidth);
    let volumePercent=(e.pageX-Public.getSummaryOffsetLeft(this))/this.offsetWidth;
    audioPlayer.volume=volumePercent;
    //console.log('audioPlayer.volume='+audioPlayer.volume);
    changeVolumeBarWidth(volumePercent);
}
function changeVolumeBarWidth(targetWidthPercent) {
    let volumeBar=document.querySelector('.volume-bar');
    volumeBar.style.width=targetWidthPercent*100+'%';
}

//进度条控制功能,progress bar control func
function progressBarControlFunc(event) {
    let e=window.event||event;
    //console.log(e.pageX+'\n'+this.offsetLeft+'\n'+this.offsetWidth);
    let pastProgressPercent= (e.pageX-this.offsetLeft)/this.offsetWidth;
    changeProgressWidth(pastProgressPercent);
    changSongProgress(pastProgressPercent);
}
function changeProgressWidth(pastProgressPercent) {
    pastProgressPercent=parseFloat(pastProgressPercent);
    let pastProgressBar=document.querySelector('#past-progress-bar');
    pastProgressBar.style.width=pastProgressPercent*100+'%';
    //console.log('pastProgressPercent='+pastProgressPercent);
}
function changSongProgress(songProgress) {
    audioPlayer.currentTime=songProgress*audioPlayer.duration;
    //console.log(songProgress);
}

//喜爱按钮功能,like btn func
function loveBtnFunc(btnClassList) {
    Public.switchClass(btnClassList,'icon-aixin-loved');
    //interact with backend...
}

//垃圾桶按钮功能,garbage bin btn function
function garbageBinBtnFunc () {
    nextSongFunc();
    //interact with backend...
}

//改变歌曲信息功能,change information of song func
function changeInfoFunc() {
    let currentSongId=playListObj.currentSongId;
    let songTitle=document.querySelector('.song-title');
    songTitle.innerHTML=playListObj.songName[currentSongId];
    let singer=document.querySelector('.singer');
    singer.innerHTML=playListObj.singer[currentSongId];
    updateCurrentTime();
    let totalTime=document.querySelector('.total-time');
    totalTime.innerHTML=Public.parseTimeStr(audioPlayer.duration);
    let coverImg=document.querySelector('.album-cover');
    coverImg.style.backgroundImage='url("'+playListObj.albumCoverSrc[currentSongId]+'")';
}
function updateCurrentTime() {
    let currentTime=document.querySelector('.current-time');
    currentTime.innerHTML=Public.parseTimeStr(audioPlayer.currentTime);
}

//封面旋转动画控制功能,album-cover animation control function:
function coverAnimationControlFunc(playState) {
    let coverImg=document.querySelector('.album-cover');
    coverImg.style.animationPlayState=playState;
}
function resetCoverAnimation () {
    let coverImg=document.querySelector('.album-cover img');
    //coverImg.style.transform='rotate(0deg)';
}