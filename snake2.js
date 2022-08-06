const board = document.querySelector("#snakeBoard")

// game constants
let GAME_LOST = false
let GAME_PAUSED = true

const SPEED = 150
const BOARD_STYLES = window.getComputedStyle(board)
const NUM_ROWS = BOARD_STYLES.gridTemplateRows.split(" ").length
const NUM_COLS = BOARD_STYLES.gridTemplateColumns.split(" ").length

// global events
window.addEventListener("keyup", e => {
    if (e.key === " ") {
        GAME_PAUSED = !GAME_PAUSED
    }
})

// snake constructor

class Snake {
    constructor(board) {
        this.board = board
        this.positions = [{ x: 15, y: 15 }, { x: 15, y: 14 }]
        this.direction = { x: 0, y: 1 }
        this.directionChangeApplied = false
        this.keyMap = {
            "Up": { x: 0, y: -1 },
            "Left": { x: -1, y: 0 },
            "Right": { x: 1, y: 0 },
            "Down": { x: 0, y: 1 }
        }

        this.init()
    }

    init() {
        this.draw()
        this.listenMoves()
    }

    listenMoves() {
        this.board.focus()
        window.addEventListener("keyup", e => {
            const keyDir = e.key.slice(5)
            if (keyDir in this.keyMap) {
                GAME_PAUSED = false
                const { x, y } = this.keyMap[keyDir]
                if (x !== this.direction.x && y !== this.direction.y && this.directionChangeApplied) {
                    this.direction = { x, y }
                    this.directionChangeApplied = false
                }
            }
        })
    }

    update() {
        // move other segments

        for (let i = this.positions.length - 1; i > 0; i--) {
            this.positions[i] = { ...this.positions[i - 1] }
        }

        // move the head
        this.headPosition(this.direction)
        this.checkFailed()
        // this.draw()
        this.directionChangeApplied = true
    }

    onSnake = (coord, isHead = false) => this.positions.some(
        ({ x: snakeX, y: snakeY }, i) => (
            (snakeX === coord.x && snakeY === coord.y) ? (i === 0 && isHead ? false : true) : false
        )
    )

    headPosition({ x, y }) {
        this.positions[0].y += y
        this.positions[0].x += x
        this.lastHeadPosition = this.positions[0]
    }

    checkFailed() {
        const { x, y } = this.positions[0]
        const lostVertical = y >= NUM_ROWS || y < 0
        const lostHorizontal = x >= NUM_COLS || x < 0
        const eatingSegments = this.onSnake(this.positions[0], true)
        const lost = lostVertical || lostHorizontal || eatingSegments
        GAME_LOST = lost

        if (GAME_LOST) {
            if (confirm("You have lost ):")) {
                return window.location.reload()
            }
        } else {
            this.draw()
        }

    }

    grow() {
        this.positions.push({ x: -1, y: -1 })
    }

    draw() {
        this.board.innerHTML = null
        this.positions.forEach(({ x, y }, i) => {
            const segment = document.createElement("div")
            segment.style.gridArea = `${y >= 0 ? y + 1 : 1}/${x >= 0 ? x + 1 : 1}`
            if (i === 0) {
                segment.classList.add("head")
            }
            this.board.appendChild(segment)
        })
    }
}

// Food Constructor

class Food {
    constructor(board, snake) {
        this.board = board
        this.snake = snake
        this.position = { x: 23, y: 12 }

        this.init()
    }

    init() {
        this.draw()
    }

    getNewPosition = () => (
        {
            x: Math.round(Math.random() * (NUM_COLS - 1)),
            y: Math.round(Math.random() * (NUM_ROWS - 1))
        }
    )

    checkSnakeDidEat() {
        const { x: snakeX, y: snakeY } = this.snake.positions[0]
        const snakeDidEat = snakeX === this.position.x && snakeY === this.position.y
        if (snakeDidEat) {
            this.snake.grow()
        }
    }

    updatePosition() {
        while (this.snake.onSnake(this.position)) {
            // console.log("on snake")
            this.checkSnakeDidEat()
            this.position = this.getNewPosition()
        }
    }

    update() {
        this.updatePosition()
        this.draw()
    }

    draw() {
        this.board.querySelectorAll(".food").forEach(food => food.remove())
        const foodElement = document.createElement("div")
        foodElement.style.gridArea = `${this.position.y + 1}/${this.position.x + 1}`
        foodElement.classList.add("food")
        this.board.appendChild(foodElement)
    }
}


// game loop

const cobra = new Snake(board)
const egg = new Food(board, cobra)

let lastUpdateTime = 0
window.requestAnimationFrame(runGame)

function runGame(currentTime) {
    let timeDiff = currentTime - lastUpdateTime
    if (!GAME_LOST) {
        // update condition - slower update rate
        if (timeDiff >= (230 - SPEED) && !GAME_PAUSED) {
            cobra.update()
            egg.update()
            lastUpdateTime = currentTime
        }
        window.requestAnimationFrame(runGame)
    }
}


