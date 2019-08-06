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
  useRxInputValue,
  useSubscribe,
} from './rx-hooks'

const SearchText = rxInput("text")
const SearchButton = rxButton()
const loader = createLoaderControl()

const onButtonOrText$ =
  combineLatest(
    SearchText.onValueChanges$.pipe(startWith('')),
    SearchButton.onClick$.pipe(startWith(undefined)))
    .pipe(
      map(([text, _]) => text),
    )

const typeAheadSearch$ =
  onButtonOrText$.pipe(
    filter(x => x.length >= 2),
    debounceTime(300),
    loader.start(),
    switchMap(searchStarWarsPeople),
    retry(3),
    loader.stop(),
  )

const textValidate$ = SearchText
      .onBlur$.pipe(
        map(x => x.target.value),
        map(value => !!value && value.length >= 2)
      )

const App: React.FC = () => {

  const starWarsPeople = useObservable(typeAheadSearch$, [])
  const isLoading = useObservable(loader.status$, false)
  const isValid = useObservable(textValidate$, true)

  const [textValue, setTextValue] = useRxInputValue(SearchText, '')
  useSubscribe(SearchText.onFocus$, () => setTextValue(''))
  
  return (
    <div className="App">
      <header className="App-header">
        <h2> RxHooks Test </h2>
        <label htmlFor="swname">Star Wars character name</label>
        <SearchText
          name="swname"
          value={textValue}
          className={isValid ? '' : 'error'}
        />
        <SearchButton>Search</SearchButton>
        {isLoading && <img src={lodingImg} alt='' />}
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
