import React, { useState, useEffect, useCallback, useReducer } from 'react'
import HideExtensionModal from './components/HideExtensionModal/HideExtensionModal'
import BingoGame from './components/BingoGame/BingoGame'
import BlurBox from './components/BlurBox/BlurBox'

import useChatCommand from './chatCommand'
import { commands } from './commands'

import styles from './app.module.css'
import { actions, initialState, reducer } from './app.reducer'

export default function App(){
  const [state, dispatch] = useReducer(reducer, initialState)

  // Handle commmands
  useEffect(() => {
    if (command === commands.showBingoGame) {//show the bingo game for 2 seconds
      showBingoGame(2)
    }
    nullifyCommand()
  }, [command])

  //get isExtensionHidden from local storage
  useEffect(() => {
    const isExtensionHidden = localStorage.getItem('isExtensionHidden')
    if(isExtensionHidden === null || JSON.parse(isExtensionHidden) === false) return
    dispatch({type: actions.HIDE_EXTENSION})
  }, [])
  //save isExtensionHidden to local storage
  useEffect(() => {
    localStorage.setItem('isExtensionHidden', JSON.stringify(state.isExtensionHidden))
  }, [state.isExtensionHidden])

  const handleClick = useCallback((event: any) => {
    // if user does alt + shift + left-click on screen, show the hide extension modal
    if(event.altKey && event.shiftKey && event.button === 0)
      dispatch({type: actions.HANDLE_ALT_SHIFT_LEFT_CLICK})
    else if(state.isBingoGameOpen && event.currentTarget === event.target.closest(`.${styles.bingoGame}`))
      dispatch({type: actions.CLOSE_BINGO_GAME})
  }, [state.isBingoGameOpen, state.isExtensionHidden])

  const showBingoGame = useCallback((seconds: number) => {
    dispatch({type: actions.SHOW_CURSOR})
    if(state.isExtensionHidden == true) return

    dispatch({type: actions.WAKE})
    if(sleepTimer.current) clearTimeout(sleepTimer.current)

    sleepTimer.current = setTimeout(() => {
      dispatch({type: actions.SLEEP})
      dispatch({type: actions.HIDE_CURSOR})
    }, seconds*1000)
  }, [state.isExtensionHidden])

  return (
    <div
      className={`${styles.app} ${state.isCursorVisible? undefined : styles.cursorHidden}`}
      onMouseMove={()=>showBingoGame(5)}
      onMouseLeave={()=>dispatch({type: actions.SLEEP})}
      onClick={(event)=>handleClick(event)}
    >
      <BlurBox/>
      <HideExtensionModal
        showHideExtensionModal={state.showHideExtensionModal}
        hideExtension={()=>dispatch({type: actions.HIDE_EXTENSION})}
        cancel={() => dispatch({type: actions.CANCEL_HIDE_EXTENSION})}
      />
      <BingoGame
        isBingoTabVisible={state.isBingoTabVisible}
        isBingoGameOpen={state.isBingoGameOpen}
        openBingoGame={() => dispatch({type: actions.OPEN_BINGO_GAME})}
        closeBingoGame={() => dispatch({type: actions.CLOSE_BINGO_GAME})}
      />
      
      </div>
  )
}
