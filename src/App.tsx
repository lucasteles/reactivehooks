import React from 'react'
import './App.scss'

import { filter, map, debounceTime, switchMap, startWith, retry, distinctUntilChanged } from 'rxjs/operators'
import { combineLatest } from 'rxjs'

import { searchStarWarsPeople } from './star-wars-api'
import { rxInput, useObservable, rxButton } from './rx-hooks'

const [SearchText, textChange$] = rxInput("text")
const [SearchButton, clickSearch$] = rxButton()

const defaultEventData = { target: { value: '' } }

const onButtonOrText$ =
  combineLatest(
    textChange$.pipe(startWith(defaultEventData)),
    clickSearch$.pipe(startWith(undefined)))
    .pipe(
      map(([text, _]) => text),
      map(text => text.target.value),
    )

const typeAheadSearch$ =
  onButtonOrText$.pipe(
    filter(x => x.length >= 2),
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(searchStarWarsPeople),
    retry(3),
  )

const App: React.FC = () => {

  const starWarsPeople = useObservable(typeAheadSearch$, [])
  const text = useObservable(onButtonOrText$, '')

  return (
    <div className="App">
      <header className="App-header">
        <h2> RxHooks Test </h2>
        <label htmlFor="swname">Star Wars character name</label>
        <SearchText name="swname" />
        <SearchButton >Search</SearchButton>
        <p> {text} </p>
        <ul>
          {starWarsPeople.map((x, i) =>
            <li key={i}>
              <div className="list-label">Name: {x.name}</div>
              <div className="list-label">Mass: {x.mass}</div>
            </li>
          )}
        </ul>
      </header>
    </div>
  )
}

export default App
