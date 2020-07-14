(function () {
  class Bird {
    constructor (ctx, birdImg, widthFrameNum, heightFrameNum, x, y) {
      this.ctx = ctx
      this.x = x
      this.y = y
      this.birdImg = birdImg
      this.widthFrameNum = widthFrameNum
      this.heightFrameNum = heightFrameNum
      this.oneBirdWith = birdImg.width / widthFrameNum
      this.oneBirdHeight = birdImg.height / heightFrameNum
      this.nowWidthFrameNum = 0
      this.nowHeightFrameNum = 0
      // 下落速度
      this.speed = 2
      // 加速度
      this.speedPlus = 0.05;

      // 当下落速度为1的时候，旋转10度
      this.baseRadian = Math.PI / 180 * 10;
      this.maxRadian = Math.PI / 180 * 45;

      // 第一次渲染
      this.firstRender = true
      this._bindClick()
    }
    draw () {
      // 根据速度计算旋转的弧度
      let rotateRadian = this.baseRadian * this.speed;
      if (this.firstRender){
        rotateRadian = 0;
        this.firstRender = false
      }
      // 限制最大旋转角度为70度
      rotateRadian = rotateRadian >= this.maxRadian ? this.maxRadian : rotateRadian
      this.ctx.save()
      this.ctx.translate( this.x+this.oneBirdWith / 2, this.y+this.oneBirdHeight / 2)
      this.ctx.rotate(rotateRadian)
      this.ctx.drawImage(
        this.birdImg, 
        this.nowWidthFrameNum * this.oneBirdWith, this.nowHeightFrameNum * this.oneBirdHeight, 
        this.oneBirdWith, this.oneBirdHeight, 
        -this.oneBirdWith/ 2, -this.oneBirdHeight / 2, 
        this.oneBirdWith, this.oneBirdHeight)
        this.ctx.restore()
      
      
    }

    update () {
      this.nowWidthFrameNum = ++this.nowWidthFrameNum >= this.widthFrameNum ? 0 : this.nowWidthFrameNum
      this.nowHeightFrameNum = ++this.nowHeightFrameNum >= this.heightFrameNum ? 0 : this.nowHeightFrameNum
      this.y += this.speed
      this.speed += this.speedPlus
      if (this.y > 600) {
        this.y = 11
      }
    }

    _bindClick () {
      this.ctx.canvas.addEventListener("click", ()=>{
        this.speed = -1.5
      })
    }
  }
  window.getBird = (function () {
    let bird = null ;
    return function (ctx, birdImg, widthFrameNum, heightFrameNum, x, y) {
      if (bird) {
        return bird;
      }
      bird = new Bird(ctx, birdImg, widthFrameNum, heightFrameNum, x, y)
      return bird;
    }
    
  })()
  window.Bird = Bird
})()