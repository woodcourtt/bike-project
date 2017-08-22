const exec = require('child_process').exec
const express = require('express')
const Raspi = require('raspi-io')
const five = require('johnny-five')

const app = express()
const board = new five.Board({
  io: new Raspi()
})

app.use(express.static('public'))

app.post('/shutdown', function (req, res) {
  exec('poweroff')
  res.end()
})

app.listen(80, function () {
  console.log('Example app listening on port 80!')
})

board.on('ready', function () {
  // Create a new `button` hardware instance.
  const button = new five.Button('P1-7')

  let counter = 0
  let speed = 0
  let lastDownTime = new Date().getTime()

  app.get('/data', function (req, res) {
    let currentTime = new Date().getTime()
    res.json({ distance: counter + ' turns', speed: speed })
    if (currentTime - lastDownTime > 3000) {
      speed = 0
    }
    res.end()
  })

  app.post('/reset', function (req, res) {
    counter = 0
    res.end()
  })

  button.on('down', function () {
    let currentDownTime = new Date().getTime()
    counter++
    currentDownTime = new Date().getTime()
    speed = 1000 / (currentDownTime - lastDownTime)
    lastDownTime = currentDownTime
  })
})
