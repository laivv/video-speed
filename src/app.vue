<template>
  <div class="playbackRate-extension">
    <fieldset class="opt-group">
      <legend class="title">调节播放速率</legend>
      <div class="clearfix">
        <button class="btn btn-d fl" @click="minus">-</button>
        <span class="val fl">{{speed}}x</span>
        <button class="btn btn-u fl" @click="plus">+</button>
        <button class="btn btn-reset fr" @click="reset">1x</button>
      </div>
      <div>
        <div class="progress" @click="progressClick($event)">
          <div
            class="spinner"
            :style="{left:`${speed / maxSpeed}%`}"
            @mousedown="spinnerDown($event)"
          ></div>
        </div>
      </div>
    </fieldset>
    <div class="clearfix footer">
      <div class="clearfix footer-top">
        <span class="fl info-wrap">
          <span class="info" :class="statusColor">{{statusText}}</span>
          <a class="explain" target="_blank" :href="url">?</a>
        </span>
        <a class="fr suggest" :href="url" target="_blank">反馈</a>
      </div>
    </div>
  </div>
</template>
<script>
const REQUEST = {
  SET: 0
};

export default {
  data() {
    return {
      url: "http://www.ilaiv.com/crx-suggest",
      status: 0,
      X: 0,
      mX: 0,
      isDrag: false,
      isPress: false,
      maxSpeed: 50.0,
      speed: chrome.extension.getBackgroundPage().speed || 1.0
    };
  },
  mounted() {
    this.init();
  },
  filters:{
    fixed(n){
      return n.toFixed(1)
    }
  },
  computed: {
    statusText() {
      return { 0: "未检测到视频", 1: "检测到视频", 2: "调节失效" }[this.status];
    },
    statusColor() {
      return { 0: "status-no", 1: "status-yes", 2: "status-error" }[
        this.status
      ];
    }
  },
  methods: {
    minus() {
      this.speed -= 0.1;
      this.speed = this.speed < 0.1 ? 0.1 : this.speed;
    },
    plus() {
      this.speed += 0.1;
      this.speed =
        this.speed > this.maxSpeed ? this.maxSpeed : this.speed;
    },
    reset() {
      this.speed = 1.0;
    },
    progressClick(e) {
      if (this.isDrag) {
        this.isDrag = false;
        return;
      }
      this.speed = this.maxSpeed * (e.offsetX / 170);
      this.speed <= 0.1 ? 0.1 : this.speed;
      this.setSpeed();
    },
    runCommand(cmd) {
      chrome.tabs.query({ active: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { cmd });
      });
    },
    setSpeed() {
      chrome.extension.getBackgroundPage().speed = this.speed;
      this.runCommand(REQUEST.SET);
    },
    spinnerDown(e) {
      this.isPress = true;
      this.X = parseFloat(e.target.style.left);
      this.mX = e.pageX;
    },
    init() {
      let timer = null;
      document.addEventListener("mousemove", e => {
        if (this.isPress) {
          let left = this.X + e.pageX - this.mX;
          left = left < 0 ? 0 : left;
          left = left > 170 ? 170 : left;
          this.speed = (left / 170) * this.maxSpeed;
          this.speed = this.speed < 0.1 ? 0.1 : this.speed;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          timer = setTimeout(() => {
            this.setSpeed();
          }, 100);
        }
      });
      document.addEventListener("mouseup", e => {
        this.isDrag = this.isPress;
        this.isPress = false;
      });
      chrome.extension.onMessage.addListener(
        ({ cmd }, sender, sendResponse) => {
          if (cmd <= 2) {
            this.status = cmd;
          }
        }
      );
    }
  }
};
</script>
<style lang="css">
  @import './app.css';
</style>

