(function () {
  class Pipe {
    constructor (ctx, pipeImgUp, pipeImgDown, speed = 2, landHeight, spacing = 50) {
      this.ctx = ctx;
      this.pipeImgUp = pipeImgUp;
      this.pipeImgDown = pipeImgDown;
      this.speed = speed;
      this.landHeight = landHeight;
      this.x = Pipe.len * pipeImgUp.width + Pipe.len * 100 + this.ctx.canvas.width/2
      
      this.maxHeight = 350;
      this.pipeWidth = pipeImgUp.width
      this.downHeigh = 0
      this.upHeigh = 0
      this.landY = this.ctx.canvas.height - this.landHeight
      this._init()
      this.index = Pipe.len++;
    }

    _init() {
      // 中间缝隙 100 - 40 高度
      let middleHeigh = this._getRandom(100, 40)
      // 下管道随机数高度
      this.downHeigh = this._getRandom(250, 100)
      // 上管道高度
      this.upHeigh = this.ctx.canvas.height - this.landHeight - this.downHeigh - middleHeigh;
    }

    draw () {
      // 上管道
      this.ctx.drawImage(this.pipeImgDown, this.x , 0, this.pipeWidth, this.upHeigh)
      // 下管道
      this.ctx.drawImage(this.pipeImgUp, this.x , this.ctx.canvas.height - (this.landHeight + this.downHeigh), this.pipeWidth, this.downHeigh)
      this._drawPath()
    }

    _getRandom(max, min) {
      return parseInt(Math.random()*(max-min+1)+min,10);
    }

    update() {
      this.x -= this.speed
      if (this.x <= -this.pipeWidth) {
        this._init();
        this.x += Pipe.len * this.pipeImgUp.width + Pipe.len * 100
      }
    }

    // 绘制路径

    _drawPath () {
    this.ctx.rect(this.x , 0, this.pipeWidth, this.upHeigh)
    this.ctx.rect(this.x , this.ctx.canvas.height - (this.landHeight + this.downHeigh), this.pipeWidth, this.downHeigh)
    }
  }
  Pipe.len = 0
  window.Pipe = Pipe
}())