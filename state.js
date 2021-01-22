const state = {
    gameOver: false,
    autoRepeat: false,
    timer: {
        fall: 0,
        move: 0,
        lock: 0,
    },
    key: {
        softDrop: false,
        hardDrop: false,
        move: false,
        rotate: false,
        hold: false,
    },
    hold: false,
    phase: 'generation',
    init() {
        this.matrix = [];
        for (let i = 1; i <= 10; ++i) {
            this.matrix[i] = [];
        }

        this.nextQueue = [];
        this.nextQueue.bag = (function*() {
            let bag = [];
            while (true) {
                if (bag.length == 0) {
                    bag = [... "OITLJSZ"][Symbol.for("shuffle")]();
                }
                yield bag.shift();
            }
        })();
        this.nextQueue.feed = () => {
            this.nextQueue.push(this.nextQueue.bag.next().value);
        };
        for (let i = 0; i < Options.game.nextSize; ++i) {
            this.nextQueue.feed();
        }
        this.nextQueue.pop = () => {
            const ret = this.nextQueue.shift();
            this.nextQueue.feed();
            return ret;
        }
    },
    next() {
        const now = Date.now();
        switch(this.phase) {
            case 'generation':
                let type;
                if (this.key.hold) {
                    type = this.nextQueue.shift();
                    this.key.hold = false;
                } else {
                    type = this.nextQueue.pop();
                }
                this.fallingMino = {
                    type,
                    center: {x: 5, y: 21},
                    facing: 'n',
                };
                this.onqueueChangeListener(this.nextQueue);
                this.phase = 'falling';
                return;
            case 'falling':
                let fallSpeed = Options.game.speed.fall;
                if (this.key.softDrop) fallSpeed /= Options.game.speed.softDrop;
                if (now - this.timer.fall >= fallSpeed) {
                    this.fallingMino.center.y -= 1;
                    if (this.collide()) {
                        this.fallingMino.center.y += 1;
                        this.phase = 'lock';
                        this.timer.lock = now;
                        return;
                    }
                    this.timer.fall = now;
                }
                this.applyMovements();
                break;
            case 'lock':
                this.fallingMino.center.y -= 1;
                if (!this.collide()) {
                    this.fallingMino.center.y += 1;
                    this.phase = 'falling';
                    return;
                }
                this.fallingMino.center.y += 1;
                if (now - this.timer.lock >= 500) {
                    this.phase = 'pattern';
                    return;
                }
                this.applyMovements();
                break;
            case 'pattern':
                const mino = this.fallingMino;
                for (const [x, y] of Mino.cell[mino.type][mino.facing]) {
                    this.matrix[mino.center.x + x][mino.center.y + y] = Mino.color[mino.type];
                }
                const hitList = [];
                for (let j = 40; j > 0; --j) {
                    let lineFull = true;
                    for (let i = 1; i <= 10; ++i) {
                        if (this.matrix[i][j] == undefined) {
                            lineFull = false;
                            break;
                        }
                    }
                    if (lineFull) hitList.push(j);
                }
            case 'iterate':
            case 'animate':
            case 'eliminate':
                for (const j of hitList) {
                    for (let i = 1; i <= 10; ++i) {
                        this.matrix[i].splice(j, 1);
                    }
                }
            case 'completion':
                this.phase = 'generation';
                break;
        }
    },
    applyMovements() {
        const now = Date.now();
        if (this.key.hardDrop) {
            while (!this.collide()) {
                this.fallingMino.center.y -= 1;
            }
            this.fallingMino.center.y += 1;
            this.key.hardDrop = false;
            this.phase = 'pattern';
            return;
        }
        if (this.key.hold) {
            if (this.hold) this.nextQueue.unshift(this.hold);
            else this.nextQueue.feed();
            this.hold = this.fallingMino.type;
            this.onholdChangeListener(this.hold);
            this.phase = 'generation';
            return;
        }
        if (this.key.move) {
            if (this.autoRepeat) {
                if (now - this.timer.move >= Options.game.speed.autoRepeat) {
                    this.fallingMino.center.x += this.autoRepeat;
                    if (this.collide()) {
                        this.fallingMino.center.x -= this.autoRepeat;
                        this.autoRepeat = false;
                    }
                }
            } else {
                this.fallingMino.center.x += this.key.move;
                if (this.collide()) {
                    this.fallingMino.center.x -= this.key.move;
                    this.key.move = false;
                }
                else this.autoRepeat = this.key.move;
                this.timer.move = now;
            }
        }
        if (this.key.rotate) {
            const from = this.fallingMino.facing;
            const to = Mino.rotate[this.key.rotate][from];
            const center = {x: this.fallingMino.center.x, y: this.fallingMino.center.y};
            const offsets = Mino.SRS(this.fallingMino.type, from, to);
            this.fallingMino.facing = to;
            for (const offset of offsets) {
                this.fallingMino.center = {
                    x: center.x + offset[0],
                    y: center.y + offset[1],
                };
                if (!this.collide()) {
                    this.key.rotate = false;
                    return;
                }
            }
            this.fallingMino.facing = from;
            this.fallingMino.center = center;
            this.key.rotate = false;
        }
    },
    collide() {
        const mino = this.fallingMino;
        const cells = Mino.cell[mino.type][mino.facing].map(cell => [mino.center.x + cell[0], mino.center.y + cell[1]]);
        const collideWall = cells.some(e => (e[0] < 1 || e[0] > 10 || e[1] < 1));
        const collideMatrix = cells.some(e => (!collideWall && this.matrix[e[0]][e[1]] != undefined));
        return collideWall || collideMatrix;
    }
};
