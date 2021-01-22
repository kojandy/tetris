const view = {
    create() {
        this.width = Options.view.width;
        this.height = this.width * 2;
        this.cellWidth = this.width / 10;
        this.cellHeight = this.height / 20;

        this.layer = [];
        this.layer[0] = document.createElement("canvas");
        this.layer[1] = document.createElement("canvas");
        for (let layer of this.layer) {
            layer.width = this.width;
            layer.height = this.height;
        }

        if (this.ctx) delete this.ctx;
        this.ctx = [];
        for (let i in this.layer) {
            this.ctx[i] = this.layer[i].getContext("2d");
        }

        this.ctx[1].strokeRect(0, 0, this.width, this.height);
        // this.drawLattice();
        this.clear();

        const matrixView = document.createElement("div");
        matrixView.classList.add("matrixview");
        matrixView.appendChild(this.layer[0]);
        matrixView.appendChild(this.layer[1]);

        const holdView = document.createElement("div");
        holdView.classList.add("holdview");
        this.holdView = new MinoView();
        holdView.appendChild(this.holdView.create());

        const nextView = document.createElement("div");
        nextView.classList.add("nextview");
        this.nextView = [];
        for (let i = 0; i < Options.game.nextSize; ++i) {
            this.nextView[i] = new MinoView();
            nextView.appendChild(this.nextView[i].create());
        }

        const game = document.createElement("div");
        game.classList.add("app");
        game.appendChild(holdView);
        game.appendChild(matrixView);
        game.appendChild(nextView);

        return game;
    },
    clear() {
        this.layer[0].width = this.layer[0].width;
    },
    drawLattice() {
        const c = this.ctx[1];
        for (let i = 0; i <= 10; ++i) {
            c.beginPath();
            c.moveTo(i * this.cellWidth, 0);
            c.lineTo(i * this.cellWidth, 20 * this.cellHeight);
            c.stroke();
        }
        for (let i = 0; i <= 20; ++i) {
            c.beginPath();
            c.moveTo(0, i * this.cellHeight);
            c.lineTo(10 * this.cellWidth, i * this.cellHeight);
            c.stroke();
        }
    },
    drawCell(color, ix, iy) {
        const c = this.ctx[0];
        const x = this.cellWidth * (ix - 1);
        const y = this.cellHeight * (20 - iy);
        c.fillStyle = color;
        c.fillRect(x, y, this.cellWidth, this.cellHeight);
    },
};
