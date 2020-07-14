(function () {
  class Game {
    constructor(ctx, imgObj) {
      this.listener = [];
      // 所有角色
      this.actor = [];
      this.ctx = ctx;
      this.imgObj = imgObj;
      this.init();
    }
    addListener(fn) {
      this.listener.push(fn)
    }
    notif() {
      this.listener.forEach((fn) => {
        fn()
      })
    }
    action() {
      const bird = getBird()
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.beginPath();
      this.actor.forEach(fn => {
        fn.draw && fn.draw();
        fn.update && fn.update()
      })
      if (this.ctx.isPointInPath( bird.x + bird.oneBirdWith/2, bird.y + bird.oneBirdHeight/2 )) {
        this.notif()
      }else {
        window.requestAnimationFrame(this.action.bind(this))
      }
    }
    init() {
      for (let i = 0; i < 2; i++) {
        this.actor.push(new Sky(this.ctx, this.imgObj.sky, 2))
        
      }
      this.actor.push(new Land(this.ctx, this.imgObj.land, 2))
      for (let i = 0; i < 7; i++) {
        this.actor.push(new Pipe(this.ctx, this.imgObj.pipeUp, this.imgObj.pipeDown, 2, 112, 2))
      }
      this.actor.push(getBird(this.ctx, this.imgObj.bird, 3, 1, 10, 10))
    }
  }
  window.Game = Game
}())