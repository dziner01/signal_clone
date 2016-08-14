const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
]
function noteNameWithOctString(noteNumber) {
  const oct = Math.floor(noteNumber / 12) - 1
  const key = noteNumber % 12
  return `${NOTE_NAMES[key]}${oct}`
}

function noteNumberString(noteNumber) {
  return `${noteNameWithOctString(noteNumber)} (${noteNumber})`
}

const CTRL_EVENT_NAMES = {
  "0": "Bank Select",
  "1": "Modulation",
  "2": "Breath Controller",
  "4": "Foot Pedal",
  "5": "Portamento Time",
  "6": "Data Entry",
  "7": "Volume",
  "8": "Balance",
  "10": "Pan",
  "11": "Expression",
  "12": "Effect Control 1",
  "13": "Effect Control 2",
  "14": "Undefined",
  "15": "Undefined",
  "16": "General Purpose Slider 1",
  "17": "General Purpose Slider 2",
  "18": "General Purpose Slider 3",
  "19": "Knob 2 General Purpose Slider 4",
  "20": "Knob 3",
  "21": "Knob 4",
  "32": "Bank Select",
  "33": "Modulation Wheel",
  "34": "Breath controller",
  "36": "Foot Pedal",
  "37": "Portamento Time",
  "38": "Data Entry",
  "39": "Volume",
  "40": "Balance",
  "42": "Pan position",
  "43": "Expression",
  "44": "Effect Control 1",
  "45": "Effect Control 2",
  "64": "Hold Pedal",
  "65": "Portamento",
  "66": "Sustenuto Pedal",
  "67": "Soft Pedal",
  "68": "Legato Pedal",
  "69": "Hold 2 Pedal",
  "70": "Sound Variation",
  "71": "Resonance",
  "72": "Sound Release Time",
  "73": "Sound Attack Time",
  "74": "Frequency Cutoff",
  "75": "Sound Control 6",
  "76": "Sound Control 7",
  "77": "Sound Control 8",
  "78": "Sound Control 9",
  "79": "Sound Control 10",
  "80": "Decay",
  "81": "High Pass Filter Frequency",
  "82": "General Purpose Button 3",
  "83": "General Purpose Button 4",
  "91": "Reverb Level",
  "92": "Tremolo Level",
  "93": "Chorus Level",
  "94": "Detune",
  "95": "Phaser Level",
  "96": "Data Button Increment",
  "97": "Data Button Decrement",
  "98": "NRPN (LSB)",
  "99": "NRPN (MSB)",
  "100": "RPN (LSB)",
  "101": "RPN (MSB)",
  "120": "All Sound Off",
  "121": "All Controllers Off",
  "122": "Local Keyboard",
  "123": "All Notes Off",
  "124": "Omni Mode Off",
  "125": "Omni Mode On",
  "126": "Mono Operation",
  "127": "Poly Operation"
}

function controllerTypeString(controllerType) {
  return CTRL_EVENT_NAMES[controllerType]
}

export {
  noteNameWithOctString,
  noteNumberString,
  controllerTypeString
}
