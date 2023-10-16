//-----------------------------------------------------------------------IMPORTS
import { ErrorDumper } from './error-dumper.js'
import './style.css'
import { MineField } from './minesweeper.js'
import { Draw } from './draw.js'

let mineField = null

const errorDumper = new ErrorDumper()
errorDumper.onError = dumpGame
errorDumper.init()

const GRID_DIMS = { x: 10, y: 10 }
const NUM_MINES = ((GRID_DIMS.x * GRID_DIMS.y) / 5) - 1
let DEBUG = false

const canvas = document.createElement('canvas')
canvas.height = innerHeight
canvas.width = innerHeight

const ctx = canvas.getContext('2d')
document.body.append(canvas)

const draw = new Draw(ctx, GRID_DIMS, { width: canvas.width, height: canvas.height })

//-------------------------------------------------------------------------INPUT

document.body.addEventListener("keydown", (x) => {

  if (x.shiftKey) {
    if (x.key === 'R') {
      console.log('resetGame')
    }
    if (x.key === 'D') {
      DEBUG = !DEBUG
      console.log(`DEBUG: ${DEBUG}`)
    }
  }
})

canvas.addEventListener('contextmenu', (userEvent) => {
  userEvent.preventDefault()

  let rect = canvas.getBoundingClientRect()
  let x = userEvent.clientX - rect.left
  let y = userEvent.clientY - rect.top

  mineField.eventQueue.push({ name: "flag-tile", type: "user", timeStamp: userEvent.timeStamp, x: x, y: y })
})

canvas.addEventListener('click', (userEvent) => {

  if (mineField.isGameOver)
    return

  let rect = canvas.getBoundingClientRect()
  let x = userEvent.clientX - rect.left
  let y = userEvent.clientY - rect.top
  if (userEvent.shiftKey == true) {
    mineField.eventQueue.push({ name: "flag-tile", type: "user", timeStamp: userEvent.timeStamp, x: x, y: y })
  } else {
    mineField.eventQueue.push({ name: "click-tile", type: "user", timeStamp: userEvent.timeStamp, x: x, y: y })
  }

})

//-----------------------------------------------------------------------SYSTEMS

function userEventSystem(event) {
  let [x, y] = mineField.getTileCoords(event.x, event.y)
  if (event.name === "click-tile" && !mineField.isFlag(x, y)) {

    mineField.revealTile(x, y)
  } else if (event.name === "flag-tile" && mineField.isGameOver === true) {
    newGame()
  } else if (event.name === "flag-tile" && !mineField.isRevealed(x, y)) {
    mineField.toggleFlag(x, y)
  }
}

//--------------------------------------------------------------------------DRAW

// COLORS
const grassColor = "#A1D4A1"
const revealedColor = "#EECFD4"
const mineColor = "#E58BA9"
const flagColor = "#C287E8"
const flagMineColor = "#C287E8"
const mineEmoji = "💣"
const flagEmofi = "🏳️‍⚧️"
const litterEmoji = "🚯"
const winMineEmoji = "🌈"
// https://coolors.co/9fa88a-eecfd4-e58ba9-e6adec-c287e8
// https://coolors.co/a1d4a1-eecfd4-e58ba9-e6adec-c287e8
function drawSystem() {

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let tileEmoji = null
  // Minsweeper Game Logic
  for (let x = 0; x < GRID_DIMS.x; x++) {
    for (let y = 0; y < GRID_DIMS.y; y++) {

      if (mineField.isRevealed(x, y) || mineField.isFlag(x, y) || mineField.isGameOver) {

        if (mineField.isMine(x, y) && !mineField.isFlag(x, y)) {
          ctx.fillStyle = mineColor
          tileEmoji = mineEmoji
        }

        if (mineField.isRevealed(x, y) && !mineField.isMine(x, y)) {
          ctx.fillStyle = revealedColor
        }

        if (!mineField.isRevealed(x, y) && !mineField.isMine(x, y)) {
          ctx.fillStyle = grassColor
        }

        if (mineField.isFlag(x, y)) {
          ctx.fillStyle = flagColor
          tileEmoji = flagEmofi
        }

        if (mineField.isFlag(x, y) && mineField.isMine(x, y) && mineField.isGameOver) {
          tileEmoji = mineEmoji
        }

        draw.tile(x, y)

        if (tileEmoji) {
          draw.emoji(tileEmoji, x, y)
          tileEmoji = null
        }

        if (mineField.hasCount(x, y) && mineField.getCount(x, y) > 0 && !mineField.isFlag(x, y)) {
          draw.count(x, y, mineField.getCount(x, y))
        }
      } else {
        ctx.fillStyle = grassColor
        draw.tile(x, y)
      }
    }
  }

  // Draw animals: TODO
  
      mineField.componentFactory.lists.drawable.forEach((x) => {
        if (x.parent.placeable) {
          draw.emoji(x.emoji, x.parent.placeable.x, x.parent.placeable.y)
        }
      })
}



//----------------------------------------------------------------------GAMELOOP

function update() {

  if (mineField.eventQueue.length > 1) {
    mineField.eventQueue.reverse()
  }
  while (mineField.eventQueue.length > 0) {
    let tempCurrentEvent = mineField.eventQueue.pop()
    tempCurrentEvent.tick = mineField.tick

    if (tempCurrentEvent.type == "user") {
      userEventSystem(tempCurrentEvent)
    }

    mineField.eventLog.push(tempCurrentEvent) // log event
  }

  drawSystem()
}

function loop() {
  mineField.tick++
  // DEBUG ? console.log(tick) : null;
  update() // processing of mineField.eventQueue array / home of all logic systems
  requestAnimationFrame(loop)
}

function newGame() {
  mineField = new MineField(GRID_DIMS, NUM_MINES, null, canvas, performance.now())
}

newGame()
loop()

//---------------------------------------------------------------------------DEV

function dumpGame() {
  console.log(mineField)

  errorDumper.saveState({
    gameState: mineField,
    device: navigator.userAgent
  })

}