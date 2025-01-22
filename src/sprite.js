
class Sprite {
    constructor(img, position, rotation, scale) {
        this.img = img;
        this.img.halfWidth = img.width / 2;
        this.img.halfHeight = img.height / 2;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    Draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(this.img, -this.img.halfWidth, -this.img.halfHeight);
        ctx.restore();
    }

    DrawSection(ctx, sx, sy, sw, sh) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        ctx.strokeStyle = "red";
        ctx.strokeRect(-sw/2, -sh/2, sw, sh);
        ctx.drawImage(this.img, sx, sy, sw, sh, -sw/2, -sh/2, sw, sh);
        ctx.restore();
    }
}