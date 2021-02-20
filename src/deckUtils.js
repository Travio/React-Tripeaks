const GenDeck = (shuffle) => {
  // iterate a full deck. value will be same as card image
  var newCards = []
  var suites = ['H', 'D', 'C', 'S']
  var values = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ]
  // add dummy vals set these is deck display
  var placeholder = 0
  var visible = true
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 13; j++) {
      newCards.push({
        value: values[j] + suites[i],
        row: placeholder,
        top: placeholder,
        visible: visible,
      })
    }
  }
  if (shuffle) {
    var shuffledDeck = shuffleArray(newCards)
    newCards = shuffledDeck
  }
  // final card will be the back of the deck
  newCards.push({ value: process.env.REACT_APP_DRAW_PILE })
  return newCards
}
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i].value, array[j].value] = [array[j].value, array[i].value]
  }
  return array
}

export default GenDeck
