import _ from "lodash"
import observable from "riot-observable"
import { MIDIController } from "./midi-constants"
import { deassembleNoteEvents, eventToBytes } from "./midi-helper"

const INTERVAL = 1 / 15 * 1000  // low fps

// timebase: 1/4拍子ごとのtick数
function secToTick(sec, bpm, timebase) {
  return sec *  bpm / 60 * timebase
}

function tickToMillisec(tick, bpm, timebase) {
  return tick / (timebase / 60) / bpm * 1000
}

const EVENT_CODES = {
  "noteOff": 0x8,
  "noteOn": 0x9,
  "noteAftertouch": 0xa,
  "controller": 0xb,
  "programChange": 0xc,
  "channelAftertouch": 0xd,
  "pitchBend": 0xe
}

function firstByte(eventType, channel) {
  return (EVENT_CODES[eventType] << 4) + channel
}

function getEventsToPlay(song, startTick, endTick) {
  return _.chain(song.getTracks())
    .map(t => t.getEvents())
    .flatten()
    .map(deassembleNoteEvents)
    .flatten()
    .filter(e => e && e.tick >= startTick && e.tick <= endTick)
    .value()
}

export default class Player {
  constructor(timebase) {
    this._timebase = timebase
    this._playing = false
    this._currentTempo = 120
    this._currentTick = 0
    this._channelMutes = {}

    observable(this)

    navigator.requestMIDIAccess().then(midiAccess => {
      this._midiOutput = midiAccess.outputs.values().next().value
    }, null)
  }

  prepare(song) {
    this._song = song
  }

  // you must call prepare() before play(), playAt()
  play(tick) {
    if (tick) {
      this._currentTick = Math.max(0, tick)
      this.emitChangePosition()
    }
    this.resume()
  }

  seek(tick) {
    this._currentTick = Math.max(0, tick)
    this.emitChangePosition()
  }

  set position(tick) {
    this.seek(tick)
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return this._playing
  }

  get timebase() {
    return this._timebase
  }

  get channelMutes() {
    return this._channelMutes
  }

  resume() {
    this._playing = true
    clearInterval(this._intervalID)
    this._intervalID = setInterval(this._onTimer.bind(this), INTERVAL)
  }

  stop() {
    clearInterval(this._intervalID)
    this._playing = false

    // all sound off
    for (const ch of _.range(0, 0xf)) {
      this._sendMessage([0xb0 + ch, MIDIController.ALL_SOUNDS_OFF, 0], window.performance.now())
    }
  }

  reset() {
    const time = window.performance.now()
    for (const ch of _.range(0, 0xf)) {
      // reset controllers
      this._sendMessage([firstByte("controller", ch), MIDIController.RESET_CONTROLLERS, 0x7f], time)
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  muteChannel(channel, mute) {
    this._channelMutes[channel] = mute
    this.trigger("change-mute", channel)
  }

  isChannelMuted(channel) {
    return this._channelMutes[channel]
  }

  _sendMessage(msg, timestamp) {
    if (!this._midiOutput) {
      return
    }
    this._midiOutput.send(msg, timestamp)
  }

  /**
   preview note
   duration in milliseconds
   */
  playNote(n) {
    const timestamp = window.performance.now()
    this._sendMessage([firstByte("noteOn", n.channel), n.noteNumber, n.velocity], timestamp)
    this._sendMessage([firstByte("noteOff", n.channel), n.noteNumber, 0], timestamp + n.duration)
  }

  _onTimer() {
    const deltaTick = Math.ceil(secToTick(INTERVAL / 1000, this._currentTempo, this._timebase))
    const endTick = this._currentTick + deltaTick
    const timestamp = window.performance.now()

    const events = getEventsToPlay(this._song, this._currentTick, endTick)
      

    // channel イベントを MIDI Output に送信
    events
      .filter(e => e.type == "channel" && !this._channelMutes[e.channel])
      .forEach(e => {
        const bytes = eventToBytes(e, false)
        const waitTick = e.tick - this._currentTick
        this._sendMessage(bytes, timestamp + tickToMillisec(waitTick, this._currentTempo, this._timebase))
      })

    // channel イベント以外を実行
    events
      .filter(e => e.type != "channel")
      .forEach(e => {
        switch (e.subtype) {
          case "setTempo":
            this._currentTempo = 60000000 / e.microsecondsPerBeat
            this.trigger("change-tempo", this._currentTempo)
            break
          case "endOfTrack":
            break
        }
      })

    this._currentTick = endTick
    this.emitChangePosition()
  }

  emitChangePosition() {
    this.trigger("change-position", this._currentTick)
  }
}
