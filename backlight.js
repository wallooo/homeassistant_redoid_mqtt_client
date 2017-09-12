#!/usr/bin/env node
const mqtt = require('mqtt')
const client = mqtt.connect('mqqt://192.168.1.22:1883')

 var Redoid = require('redoid');
 var redoid = Redoid({
    color: '#000000',
    colorComponentPins: [4, 17, 18],
    defaultEasing: 'easeInOutQuad',
});

var MQTT_cmd_topic = 'light/kodi'
var MQTT_sta_topic = 'light/kodi/status'

var state = 'OFF'
var color = [0, 0, 0]
var r = color[0]
var g = color[1]
var b = color[2]
var color_saved = [255, 255, 255]

// Connect to MQTT broker, subscribe to instructions and publish status

client.on('connect', function () {
  client.subscribe(MQTT_cmd_topic)
  rgb_cycle()
  console.log('connected')
  send()
})

// when message is received rout to appropriate function

client.on('message', function (topic, message) {

  switch (topic) {
    case 'light/kodi':
      return handlecommand(message)
  }
})

function handlecommand (message) {
  command = JSON.parse(message)
  state = command.state
  redoid.stop()
  if (command.color != undefined) {
  change_color()
  } else if (state == 'OFF') {
  turn_off()
  } else if (redoid.getColorHexValue() == '#000000' && state == 'ON') {
  turn_on()
  }
  send()
}

function change_color() {
  console.log('change color to', command.color)
  r = command.color.r
  g = command.color.g
  b = command.color.b
  redoid.transition([r, g, b])
}

function turn_off() {
  console.log('turn', state)
  color_saved = redoid.getColor()
  redoid.turnOff([2000])
  color = redoid.getColor()
}

function turn_on() {
  console.log('turn', state)
  redoid.transition(color_saved, [2000])
  color = color_saved
}

function send() {
  status = {"color": {"r": r,"g": g,"b": b},"state": state};
  client.publish(MQTT_sta_topic, JSON.stringify(status))
  console.log('return', JSON.stringify(status))
}

function rgb_cycle() {
  redoid.transition([255, 0, 0], 400);
  redoid.transition([0, 255, 0], 400);
  redoid.transition([0, 0, 255], 400);
  redoid.transition([0, 0, 0], 250);
}
