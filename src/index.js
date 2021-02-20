import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import GenDeck from './deckUtils.js'
import {
  DisplayCards,
  FormatImage,
  DynamicScaleDisplay,
} from './displayCards.js'
// import all the sounds that will be used
import cardFlip from './sounds/flip.mp3'
import wrongSound from './sounds/error.mp3'
import winnerSound from './sounds/winner.mp3'
import peaksGoodSound from './sounds/peaksGood.wav'
import loserSound from './sounds/lose.mp3'
import shuffleSound from './sounds/shuffling.mp3'

var cardWidth = 65
var cardHeight = 0
var rowSpacing = 40
var cardSpacing = 0
//var hasRendered = false
var cardsRemaining = 24

// row 6 column 5 is where play card will be
// deck will be right next to that
// row and column are in card width height multiples
var deckRow = process.env.REACT_APP_DECK_ROW
var deckColumn = process.env.REACT_APP_DECK_COLUMN
var deckY = deckRow * rowSpacing
var deckX = deckColumn * cardWidth
const HWRatio = 691 / 1056
const playAgainWidth = process.env.REACT_APP_PLAY_AGAIN_WIDTH
const playAgainHeight = playAgainWidth * HWRatio

var deckStatus = {
  hasRendered: false,
  deckX,
  deckY,
  rowSpacing,
  cardSpacing,
  cardHeight,
  cardWidth,
  playAgainWidth,
  HWRatio,
}
const drawPile = process.env.REACT_APP_DRAW_PILE
const playAgainDiv = process.env.REACT_APP_PLAY_AGAIN_DIV
const deckOverlay = process.env.REACT_APP_DECK_OVERLAY
// for testing
var windowHeight = window.innerHeight
// adjust for the ratio of actual card size

const isNext = (pickedId, deckId) => {
  //determine if clicked on card is next in sequence
  var order = 'KA2345678910JQK'
  var pickedCard = pickedId.substring(0, pickedId.length - 1)
  var deckCard = deckId.substring(0, deckId.length - 1)
  //cat the 2 values together forward and back, and see if we have a match
  var testAbove = pickedCard + deckCard
  if (order.indexOf(testAbove) !== -1) {
    return true
  }
  var testBelow = deckCard + pickedCard
  if (order.indexOf(testBelow) !== -1) {
    return true
  }
  return false
}
const hasOverlap = (card, cards) => {
  // determine if cards overlap
  var hasOverlap = false
  var cardFrom = card.left
  var cardTo = cardFrom + cardWidth
  var cardNextRow = card.row + 1
  var deckCard = 0
  var deckCardFrom = 0
  var deckCardTo = 0
  // only check for rows that can have overlap (<3)
  if (card.row < 3) {
    for (var i = 0; i < cards.length; i++) {
      deckCard = cards[i]
      deckCardFrom = deckCard.left
      deckCardTo = deckCardFrom + cardWidth
      // only check cards in next row
      if (deckCard.row === cardNextRow) {
        if (deckCardFrom > cardFrom && deckCardFrom < cardTo) {
          hasOverlap = true
          break
        }
        if (deckCardTo > cardFrom && deckCardTo < cardTo) {
          hasOverlap = true
          break
        }
      }
    }
  }
  return hasOverlap
}

const findCard = (cardValue, cards) => {
  // locate a card in the deck by value
  // for matching div value to card
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].value === cardValue) {
      return cards[i]
    }
  }
  return null
}

const cardsToPlay = (cards) => {
  // determine if we've got a winner winner!
  // only if there are no cards above the bottom row
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].row < 4 && cards[i].visible) {
      return true
    }
  }
  return false
}

const ShowPlayAgain = () => {
  // show rotating green card
  const reLoad = (e) => {
    window.location.reload()
  }
  var bgImage =
    'url("' + process.env.PUBLIC_URL + '/images/' + drawPile + '.png")'
  return (
    <>
      <div
        id={playAgainDiv}
        onClick={reLoad}
        style={{
          position: 'absolute',
          top: (windowHeight - playAgainHeight) / 2 + 'px',
          left: deckStatus.deckX + 'px',
          lineHeight: playAgainHeight - 40 + 'px',
          //lineHeight: '80px',
          zIndex: '500',
          background: bgImage,
          backgroundSize: playAgainWidth + 'px',
          opacity: 0.85,
          width: playAgainWidth + 'px',
          height: playAgainHeight + 'px',
          margin: 'auto',
          textAlign: 'center',
          display: 'none',
          fontSize: '30px',
          fontWeight: 'bold',
        }}
      >
        Play Again?
      </div>
    </>
  )
}

const showCardsLeft = () => {
  //var cardsLeft = 52 - deckLocation
  var deckOverlayElement = document.getElementById(deckOverlay)
  deckOverlayElement.innerHTML = cardsRemaining
}
const scaleCurrentCards = (cards, currentCard) => {
  // user current cards to scale/ repositin
  if (deckStatus.hasRendered && cards) {
    var left, top
    for (var i = 0; i < cards.length; i++) {
      //var card = cards[i]
      if (cards[i].value === currentCard) {
        left = deckStatus.deckX
        top = deckStatus.deckY
      } else if (i === cards.length - 1) {
        left = deckStatus.deckX - deckStatus.cardWidth
        top = deckStatus.deckY
      } else {
        left = cards[i].spacing * deckStatus.cardWidth
        top = cards[i].row * deckStatus.rowSpacing
      }
      cards[i].top = top
      cards[i].left = left
      // now scale the DIV and set the image scale
      var cardElement = document.getElementById(cards[i].value)
      cardElement.style.left = left + 'px'
      cardElement.style.top = top + 'px'
      cardElement.style.width = deckStatus.cardWidth + 'px'
      cardElement.style.height = deckStatus.cardHeight + 'px'
      var imgHTML =
        '<img src="' +
        FormatImage(cards[i].value) +
        '" alt="' +
        cards[i].value +
        '" width="' +
        deckStatus.cardWidth +
        '" height="' +
        deckStatus.cardHeight +
        '">'
      cardElement.innerHTML = imgHTML
    }
  }
}
const handleResize = (cards, currentCard) => {
  DynamicScaleDisplay(deckStatus)
  if (deckStatus.hasRendered) {
    scaleCurrentCards(cards, currentCard)
  }
}

const TriPeaks = () => {
  const [cards, setCards] = useState()
  const [currentCard, _setCurrentCard] = useState(0)
  const currentCardRef = useRef(currentCard)
  const setCurrentCard = (value) => {
    currentCardRef.current = value
    _setCurrentCard((currentCard) => value)
  }
  const [deckLocation, _setdeckLocation] = useState(28)
  const deckLocationRef = useRef(deckLocation)
  const setdeckLocation = (value) => {
    deckLocationRef.current = value
    _setdeckLocation((deckLocation) => value)
  }
  const [deckZindex, _setDeckZindex] = useState(2)
  const deckZindexRef = useRef(deckZindex)
  const setDeckZindex = (zIndex) => {
    deckZindexRef.current = zIndex
    _setDeckZindex((deckZindex) => zIndex)
  }
  //console.log('TriPeaks()')
  useEffect(() => {
    const shuffle = document.getElementById('shuffle')
    shuffle.play()
    var newCards = GenDeck(shuffle, drawPile)
    setCards(newCards)
    setdeckLocation(27)
  }, [])

  useEffect(() => {
    const resizeListener = () => {
      handleResize(cards, currentCardRef.current)
    }
    //    console.log('adding event listener')
    window.addEventListener('resize', resizeListener)
    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', resizeListener)
    }
  }, [cards])

  const onCardClick = (e) => {
    var myId = e.currentTarget.id
    var deckSize = cards.length
    if (myId === drawPile || myId === deckOverlay) {
      var nextCardIndex = deckLocationRef.current + 1
      if (nextCardIndex >= deckSize - 1) {
        showCardsLeft()
        const lose = document.getElementById('loser')
        lose.play()
        var deckCardElement = document.getElementById(drawPile)
        deckCardElement.style.display = 'none'
        var deckOverlayElemnent = document.getElementById(deckOverlay)
        deckOverlayElemnent.style.display = 'none'
        var playAgainElement = document.getElementById(playAgainDiv)
        playAgainElement.style.display = 'block'
      }
      // card from deck
      if (nextCardIndex <= cards.length - 2) {
        var nextCard = cards[nextCardIndex]
        var nextCardValue = nextCard.value
        var nextCardElement = document.getElementById(nextCardValue)
        nextCard.row = deckRow
        nextCard.spacing = deckColumn
        nextCardElement.style.top = deckStatus.deckY + 'px'
        nextCardElement.style.left = deckStatus.deckX + 'px'
        nextCardElement.style.zIndex = deckZindexRef.current
        nextCardElement.style.display = 'block'
        const cardFlipElement = document.getElementById('card-flip')
        cardFlipElement.play()
        // remove boxShadow, these add up to a really dark shadow
        nextCardElement.style.boxShadow = ''
        setdeckLocation(nextCardIndex)
        setCurrentCard(nextCardValue)
        setDeckZindex(deckZindexRef.current + 1)
        cardsRemaining = cardsRemaining - 1
        showCardsLeft()
      }
    } else if (isNext(myId, currentCardRef.current)) {
      // card from peaks
      var clickedCard = findCard(myId, cards)
      if (!hasOverlap(clickedCard, cards)) {
        const peaks = document.getElementById('peaks')
        peaks.play()
        clickedCard.row = deckRow
        clickedCard.spacing = deckColumn
        var myElement = document.getElementById(myId)
        myElement.style.top = deckStatus.deckY + 'px'
        myElement.style.left = deckStatus.deckX + 'px'
        myElement.style.zIndex = deckZindexRef.current
        // remove boxShadow, these add up to a really dark shadow
        myElement.style.boxShadow = ''

        setDeckZindex(deckZindexRef.current + 1)
        setCurrentCard(myId)
        // if all dealt cards have been played - winner!!
        if (!cardsToPlay(cards)) {
          const winnerSoundElement = document.getElementById('winner')
          winnerSoundElement.play()
          var deckCardElementWin = document.getElementById(playAgainDiv)
          // show the play again
          deckCardElementWin.style.display = 'block'
          //deckCardElementWin.style.lineHeight = '90px'
          deckCardElementWin.innerHTML = 'YOU WIN!<br/> Play Again?'
        }
      } else {
        // card picked is overlapped by another
        const wrong = document.getElementById('wrong')
        wrong.play()
      }
    } else {
      // card picked it not next in sequence
      const wrong = document.getElementById('wrong')
      wrong.play()
    }
  }
  if (cards) {
    return (
      <>
        <div className='carddiv'>
          <DisplayCards
            cards={cards}
            setCurrentCard={setCurrentCard}
            setdeckLocation={setdeckLocation}
            onCardClick={onCardClick}
            deckStatus={deckStatus}
          />
        </div>
      </>
    )
  }
  return (
    <>
      <h1>No Cards</h1>
    </>
  )
}

const Footer = () => {
  var reactLogo = process.env.PUBLIC_URL + '/logo192.png'
  return (
    <>
      <div id='footer'>
        <div id='appTitle'>
          <span className='mytitle'>React - Tripeaks </span>
        </div>
        <div id='byline'>
          <div id='contact' className='sideByside1'>
            by:Travis Kerzic--
            <a href='mailto:travis@kerzic.com'>travis@kerzic.com</a>
          </div>
          <div id='byline' className='sideByside2'>
            <img src={reactLogo} alt='react Logo' width='35' />
            <a href='https://github.com/Travio/React-Tripeaks'>source</a>
          </div>
        </div>
      </div>
    </>
  )
}

const SoundLoad = () => {
  return (
    <div id='sounds'>
      <audio className='card-flip' id='card-flip'>
        <source src={cardFlip} type='audio/mp3'></source>
      </audio>
      <audio className='wrong' id='wrong'>
        <source src={wrongSound} type='audio/mp3'></source>
      </audio>
      <audio className='winner' id='winner'>
        <source src={winnerSound} type='audio/mp3'></source>
      </audio>
      <audio className='peaks' id='peaks'>
        <source src={peaksGoodSound} type='audio/wav'></source>
      </audio>
      <audio className='loser' id='loser'>
        <source src={loserSound} type='audio/mp3'></source>
      </audio>
      <audio className='shuffle' id='shuffle'>
        <source src={shuffleSound} type='audio/mp3'></source>
      </audio>
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <TriPeaks />
    <ShowPlayAgain />
    <Footer />
    <SoundLoad />
  </React.StrictMode>,
  document.getElementById('root')
)
