(function () {
  class Sky{
    // 实例个数
    // static len = 0; chrome 70 没有支持
    constructor (ctx, imgObj, speed = 2) {
      this.ctx = ctx ;
      this.imgObj = imgObj ;
      this.speed = speed
      Sky.len++;
      this.x = (Sky.len-1) * this.imgObj.width;
      this.y = 0;
    }
    draw () {
      this.ctx.drawImage(this.imgObj, this.x, this.y )
    }
    update () {
      // 至少两张图做无限循环
      // 每次向-X画一点
      this.x -= this.speed
      // 这里画图好理解些
      if (this.x <= -this.imgObj.width) {
        this.x  += this.imgObj.width * Sky.len
      }
    }
  }
  Sky.len = 0;
  window.Sky = Sky
}())