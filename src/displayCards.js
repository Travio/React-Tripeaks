import React, { useState } from 'react'

var deckRow = process.env.REACT_APP_DECK_ROW
var deckColumn = process.env.REACT_APP_DECK_COLUMN
var playAgainDiv = process.env.REACT_APP_PLAY_AGAIN_DIV
var playAgainMultiplier = process.env.REACT_APP_PLAY_AGAIN_MULTIPLIER
var deckOverlay = process.env.REACT_APP_DECK_OVERLAY
//var playAgainWidth = process.env.REACT_APP_PLAY_AGAIN_WIDTH
//var playAgainHeight = (1056 * playAgainWidth) / 691

const DisplayCards = (props) => {
  // number of cards per row
  ScaleDisplay(props)
  const cardcount = [2, 5, 8, 9, 28]
  const [displayCards, setDisplayCards] = useState()
  const [isRendered, setIsRendered] = useState(false)
  if (!isRendered) {
    var row = 0
    var cardsTemp = []
    var columnCount = 0
    var left = 0
    var i
    var isVisible = false
    var top = 0
    for (i = 0; i < props.cards.length; i++) {
      //var cardSpacing = 0
      var zIndex = row
      // show the back of deck (last card)
      if (i === props.cards.length - 1) {
        left = props.deckStatus.deckX - props.deckStatus.cardWidth
        top = props.deckStatus.deckY
        row = deckRow
        props.deckStatus.cardSpacing = deckColumn - 1
        zIndex = 0
        isVisible = true
      } else if (i < 28) {
        props.deckStatus.cardSpacing = getCardSpacing(i)
        left = props.deckStatus.cardSpacing * props.deckStatus.cardWidth
        top = row * props.deckStatus.rowSpacing
        isVisible = true
      } else if (i === 28) {
        // current card on deck
        left = props.deckStatus.deckX
        top = props.deckStatus.deckY
        isVisible = true
        row = deckRow
        props.deckStatus.cardSpacing = deckColumn
        zIndex = 1
      } else {
        isVisible = false
      }
      var card = props.cards[i]
      cardsTemp.push(
        ShowCard(card, left, top, props.onCardClick, zIndex, isVisible, props)
      )
      // update deck with card row and visibility
      card.visible = isVisible
      card.row = row
      card.spacing = props.deckStatus.cardSpacing
      card.left = left

      if (columnCount >= cardcount[row]) {
        row++
        columnCount = 0
        left = 0
      } else {
        columnCount++
      }
    } // end for
    // show current deck card
    var nextCardOnDeck = 28
    //cardsRemaining = 24
    cardsTemp.push(DrawDeckOverlay(props.onCardClick, 24, props))
    props.setdeckLocation(nextCardOnDeck)
    props.setCurrentCard(props.cards[nextCardOnDeck].value)
    setIsRendered(true)
    setDisplayCards(cardsTemp)
  } else {
    props.deckStatus.hasRendered = true
  }
  return <>{displayCards}</>
}
const ShowCard = (card, left, top, onCardClick, zIndex, isVisible, props) => {
  //console.log('left:' + left)
  var visible = 'block'
  if (!isVisible) {
    visible = 'none'
  }
  return (
    <>
      <div
        id={card.value}
        onClick={onCardClick}
        style={{
          position: 'absolute',
          left: left,
          top: top,
          zIndex: zIndex,
          display: visible,
          // drop shadwo below cards
          boxShadow: '5px 5px 5px',
          // border: 'solid',
        }}
      >
        <img
          src={FormatImage(card.value)}
          alt={card.value}
          width={props.deckStatus.cardWidth}
          style={{ display: 'block' }}
        />
      </div>
    </>
  )
}
const FormatImage = (imageName) => {
  // all the card images are stored here
  return process.env.PUBLIC_URL + '/images/' + imageName + '.png'
}
const getCardSpacing = (index) => {
  var cardSpacing = [
    1.5,
    4.5,
    7.5,
    1,
    2,
    4,
    5,
    7,
    8,
    0.5,
    1.5,
    2.5,
    3.5,
    4.5,
    5.5,
    6.5,
    7.5,
    8.5,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
  ]
  return cardSpacing[index]
}
const DrawDeckOverlay = (onCardClick, cardsRemaining, props) => {
  // get draw deck for overlay of cards remaining
  //var drawElement = document.getElementById(drawPile)
  var left = props.deckStatus.deckX - props.deckStatus.cardWidth
  var top = props.deckStatus.deckY
  var width = props.deckStatus.cardWidth
  var height = props.deckStatus.cardHeight * props.deckStatus.HWRatio
  return (
    <>
      <div
        id={process.env.REACT_APP_DECK_OVERLAY}
        onClick={onCardClick}
        style={{
          position: 'absolute',
          margin: 'auto',
          textAlign: 'center',
          left: left + 'px',
          top: top + 'px',
          zIndex: 8,
          height: height + 'px',
          lineHeight: height + 'px',
          width: width + 'px',
          opacity: 0.5,
          fontSize: '30px',
          fontWeight: 'bold',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        {cardsRemaining}
      </div>
    </>
  )
}
const ScaleDisplay = (props) => {
  var windowWidth = window.innerWidth
  props.deckStatus.cardWidth = windowWidth / 10
  var windowHeight = window.innerHeight
  props.deckStatus.cardHeight = Math.round(
    (props.deckStatus.cardWidth / 691) * 1056
  )
  if (props.deckStatus.cardHeight * 4 > windowHeight * 0.8) {
    props.deckStatus.cardHeight = Math.round((windowHeight * 0.8) / 4)
    props.deckStatus.cardWidth = Math.round(
      (props.deckStatus.cardHeight / 1056) * 691
    )
  }
  props.deckStatus.rowSpacing = 0.75 * props.deckStatus.cardWidth
  props.deckStatus.deckY = Math.round(deckRow * props.deckStatus.rowSpacing)
  props.deckStatus.deckX = deckColumn * props.deckStatus.cardWidth
  ResizePlayAgain(
    props.deckStatus.deckX,
    props.deckStatus.cardHeight,
    props.deckStatus.HWRatio
  )
  ResizeDeckOverlay(
    props.deckStatus.cardWidth,
    props.deckStatus.cardHeight,
    props.deckStatus.deckX,
    props.deckStatus.deckY
  )
}
const DynamicScaleDisplay = (deckStatus) => {
  // scale diplay params while game is in session
  var windowWidth = window.innerWidth
  deckStatus.cardWidth = windowWidth / 10
  var windowHeight = window.innerHeight
  deckStatus.cardHeight = Math.round((deckStatus.cardWidth / 691) * 1056)
  if (deckStatus.cardHeight * 4 > windowHeight * 0.8) {
    deckStatus.cardHeight = Math.round((windowHeight * 0.8) / 4)
    deckStatus.cardWidth = Math.round((deckStatus.cardHeight / 1056) * 691)
  }
  deckStatus.rowSpacing = 0.75 * deckStatus.cardWidth
  deckStatus.deckY = Math.round(deckRow * deckStatus.rowSpacing)
  deckStatus.deckX = deckColumn * deckStatus.cardWidth
  ResizePlayAgain(deckStatus.deckX, deckStatus.cardHeight, deckStatus.HWRatio)
  ResizeDeckOverlay(
    deckStatus.cardWidth,
    deckStatus.cardHeight,
    deckStatus.deckX,
    deckStatus.deckY
  )
}
const ResizePlayAgain = (deckX, cardHeight, ratio) => {
  // scale the play again div
  var playAgainElement = document.getElementById(playAgainDiv)
  var playAgainHeight = Math.round(playAgainMultiplier * cardHeight)
  var playAgainWidth = Math.round(playAgainHeight * ratio)
  playAgainElement.style.width = playAgainWidth + 'px'
  playAgainElement.style.height = playAgainHeight + 'px'
  playAgainElement.style.top = (window.innerHeight - playAgainHeight) / 3 + 'px'
  playAgainElement.style.left = deckX - playAgainWidth / 2 + 'px'
  playAgainElement.style.backgroundSize = playAgainWidth + 'px'
  //lineHeight: playAgainHeight - 40 + 'px'
  playAgainElement.style.lineHeight = Math.round(playAgainHeight * 0.5) + 'px'
  var newFontSize = Math.round(0.1 * playAgainHeight)
  playAgainElement.style.fontSize = newFontSize + 'px'
}
const ResizeDeckOverlay = (cardWidth, cardHeight, deckX, deckY) => {
  var top = deckY
  var left = deckX - cardWidth
  var deckOverlayElement = document.getElementById(deckOverlay)
  if (deckOverlayElement) {
    deckOverlayElement.style.width = cardWidth + 'px'
    deckOverlayElement.style.height = cardHeight + 'px'
    deckOverlayElement.style.top = top + 'px'
    deckOverlayElement.style.left = left + 'px'
    deckOverlayElement.style.lineHeight = Math.round(cardHeight * 1) + 'px'
    deckOverlayElement.style.fontSize = Math.round(0.3 * cardWidth) + 'px'
  }
}
export { DisplayCards, FormatImage, DynamicScaleDisplay }
