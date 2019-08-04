import React from 'react'
import './App.scss'
import lodingImg from './loading.svg'

import {
  filter, map, debounceTime, switchMap,
  startWith, retry
} from 'rxjs/operators'
import { combineLatest } from 'rxjs'

import { searchStarWarsPeople } from './star-wars-api'

import {
  useObservable,
  rxInput,
  rxButton,
  createLoaderControl,
} from './rx-hooks'

const [SearchText, textChange$] = rxInput("text")
const [SearchButton, clickSearch$] = rxButton()
const loader = createLoaderControl()

const onButtonOrText$ =
  combineLatest(
    textChange$.pipe(startWith({ target: { value: '' } })),
    clickSearch$.pipe(startWith(undefined)))
    .pipe(
      map(([text, _]) => text),
      map(text => text.target.value),
    )


const typeAheadSearch$ =
  onButtonOrText$.pipe(
    filter(x => x.length >= 2),
    debounceTime(500),
    loader.start(),
    switchMap(searchStarWarsPeople),
    loader.stop(),
    retry(3),
  )

const App: React.FC = () => {

  const starWarsPeople = useObservable(typeAheadSearch$, [])
  const isLoading = useObservable(loader.status$, false)

  return (
    <div className="App">
      <header className="App-header">
        <h2> RxHooks Test </h2>
        <label htmlFor="swname">Star Wars character name</label>
        <SearchText name="swname" />
        <SearchButton>Search</SearchButton>
        {isLoading && <img src={lodingImg} />}
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
