class MinoView {
    create() {
        this.cellSize = 20;
        this.width = this.cellSize * 3;
        this.height = this.width;

        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.ctx = this.canvas.getContext("2d");

        this.clear();

        return this.canvas;
    }

    clear() {
        this.canvas.width = this.canvas.width;
        this.ctx.strokeRect(0, 0, this.width, this.height);
    }

    drawMino(type) {
        this.clear();
        for (const cell of Mino.cell[type].n) {
            this.drawCell(Mino.color[type], cell[0], cell[1]);
        }
        this.mino = type;
    }

    drawCell(color, ix, iy) {
        const c = this.ctx;
        const x = this.cellSize * (ix + 1);
        const y = this.cellSize * (1 - iy);
        c.fillStyle = color;
        c.fillRect(x, y, this.cellSize, this.cellSize);
    }
}
