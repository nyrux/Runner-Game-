window.addEventListener('load', () => {
    const canvas = document.querySelector('.canvas');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const c = canvas.getContext("2d");

    class InputHandler {
        constructor() {
            this.keys = new Set();
            window.addEventListener('keydown', (e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    this.keys.add(e.key);
                }
            });
            window.addEventListener('keyup', (e) => {
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    this.keys.delete(e.key);
                }
            });
        }
    }

    const input = new InputHandler();
    let gameOver = false;
    let score = 0;
    let hearts = 3;
    let enemyTimer = 0;
    let enemyInterval = 800;
    let randEnemtyInterval = Math.random() * 4000 + 800;

    class Player {
        constructor() {
            this.gameWidth = canvas.width;
            this.gameHeight = canvas.height;
            this.spriteWdith = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWdith / 1.4;
            this.height = this.spriteHeight / 1.4;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.querySelector('.playerImg');
            this.frameX = 0;
            this.frameY = 0;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.maxFrame = 8;
            this.fps = 50;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.radius = this.width / 2 - 10;
        }

        draw(context) {
            context.drawImage(
                this.image,
                this.frameX * this.spriteWdith, this.frameY * this.spriteHeight,
                this.spriteWdith, this.spriteHeight,
                this.x, this.y,
                this.width, this.height
            );
        }

        update(input, deltaTime) {
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.radius) - (this.x + this.radius);
                const dy = (enemy.y + enemy.radius) - (this.y + this.radius);
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance < this.radius + enemy.radius) {
                    hearts -= 1;
                    enemy.markedForDeletion = true;
                    if (hearts < 1) {
                        gameOver = true;
                    }
                }
            });

            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) { this.frameX = 0; }
                else { this.frameX += 1; }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            if (input.keys.has('ArrowRight')) {
                this.speed = 5;
            } else if (input.keys.has('ArrowLeft')) {
                this.speed = -5;
            } else {
                this.speed = 0;
            }

            if (input.keys.has('ArrowUp') && this.onGround()) {
                this.vy = -25;
            }

            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            if (this.x + this.width > this.gameWidth) {
                this.x = this.gameWidth - this.width;
            }

            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }

            if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        }

        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    const player = new Player();

    class Background {
        constructor() {
            this.gameWidth = canvas.width;
            this.gameHeight = canvas.height;
            this.image = document.querySelector('.bgImg');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = canvas.height;
            this.speed = 3;
        }
        draw(context) {
            context.drawImage(this.image,
                this.x, this.y,
                this.width, this.height);

            context.drawImage(this.image,
                this.x + this.width - this.speed, this.y,
                this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) { this.x = 0; }
        }
    }

    let background = new Background();

    let enemies = [];

    class Enemy {
        constructor() {
            this.gameWidth = canvas.width;
            this.gameHeight = canvas.height;
            this.spriteWidth = 160;
            this.spriteHeight = 119;
            this.width = this.spriteWidth / 2;
            this.height = this.spriteHeight / 2;
            this.image = document.querySelector('.enemy');
            this.x = this.gameWidth - this.width;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.speed = Math.random() * 3 + 1;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.markedForDeletion = false;
            this.hasPassed = false; 
            this.radius = this.width / 2.5;
        }
        draw(context) {
            context.drawImage(this.image,
                this.spriteWidth * this.frameX, 0,
                this.spriteWidth, this.spriteHeight,
                this.x, this.y,
                this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) { this.frameX = 0; }
                else { this.frameX += 1; }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            if (this.x + this.width < 0) {
                this.markedForDeletion = true;
            }
            this.x -= this.speed;
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randEnemtyInterval) {
            enemies.push(new Enemy());
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }

        enemies.forEach(enemy => {
            enemy.draw(c);
            enemy.update(deltaTime);

            if (!enemy.hasPassed && player.x > enemy.x + enemy.width) {
                score += 1;
                enemy.hasPassed = true;
            }
        });

        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    }

    function displayText(context) {
        context.font = 'bold 2em monospace';
        context.fillStyle = '#000';
        context.fillText(`SCORE : ${score}`, 20, 40);
        context.fillStyle = '#fff';
        context.fillText(`SCORE : ${score}`, 22, 42);

        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = '#000';
            context.font = 'bold 3em monospace';
            context.fillText('Game Over !', canvas.width / 2, canvas.height / 2);
            context.fillStyle = '#f00';
            context.fillText('Game Over !', canvas.width / 2 + 2, canvas.height / 2 + 2);
        }
    }

    let heartImg = new Image();
    heartImg.src = 'heartPng.png';

    function drawHearts() {
        for (let i = 0; i < hearts; i++) {
            c.drawImage(heartImg, (canvas.width - 150) + i * 40, 25, 30, 30);
        }
    }

    let lastTime = 0;
    function animate(timeStamp) {
        c.clearRect(0, 0, canvas.width, canvas.height);

        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;

        background.draw(c);
        background.update();

        player.draw(c);
        player.update(input, deltaTime);

        handleEnemies(deltaTime);

        displayText(c);
        drawHearts();

        if (!gameOver) {
            requestAnimationFrame(animate);
        }
    }

    // Control buttons
    const leftButton = document.getElementById('left');
    const rightButton = document.getElementById('right');
    const jumpButton = document.getElementById('jump');

    leftButton.addEventListener('click', () => {
        input.keys.add('ArrowLeft');
    });
    leftButton.addEventListener('click', () => {
        input.keys.delete('ArrowLeft');
    });

    rightButton.addEventListener('click', () => {
        input.keys.add('ArrowRight');
    });
    rightButton.addEventListener('click', () => {
        input.keys.delete('ArrowRight');
    });

    jumpButton.addEventListener('click', () => {
        if (player.onGround()) {
            input.keys.add('ArrowUp');
        }
    });
    jumpButton.addEventListener('click', () => {
        input.keys.delete('ArrowUp');
    });

    animate(0);
});
