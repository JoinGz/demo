(function () {
  class Land {
    constructor (ctx, imgObj, speed) {
      this.ctx = ctx ;
      this.imgObj = imgObj ;
      this.speed = speed
      this.x = 0;
      this.y = this.ctx.canvas.height - this.imgObj.height;
      this.width = this.imgObj.width
    }
    draw () {
      this.x -= this.speed
      this.ctx.save()
      this.ctx.translate(this.x, 0)
      this.ctx.drawImage(this.imgObj, 0, this.y)
      this.ctx.drawImage(this.imgObj, this.width, this.y)
      this.ctx.drawImage(this.imgObj, this.width * 2, this.y)
      this.ctx.restore()
      if (this.x <= this.width * 2) {
        this.x = 0
      }
    }
  }
  window.Land = Land
}())