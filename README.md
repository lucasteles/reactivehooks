# Reactive Hooks
[![npm version](https://badge.fury.io/js/reactivehooks.svg)](https://badge.fury.io/js/reactivehooks)
[![Build Status](https://travis-ci.org/lucasteles/reactivehooks.svg?branch=master)](https://travis-ci.org/lucasteles/reactivehooks)
[![Coverage Status](https://img.shields.io/coveralls/github/lucasteles/reactivehooks/master.svg)](https://coveralls.io/github/lucasteles/reactivehooks?branch=master)

Reactive Hooks provides a set of tools for work with Reactive Extensions in React using hooks

## Installation

Nothing new here, just npm install
```sh
npm i reactivehooks
```

## Get Started

This code sample shows how to write a type ahead search using Reactive Hooks and [RxJs](https://github.com/ReactiveX/rxjs):

* for a more complete example check the [**sample folder**](https://github.com/lucasteles/reactivehooks/tree/master/Sample) in this repository

```tsx
// api fetch that returns an observable
const searchStarWarsPeople = (name: string) =>
      fetchJson<StarWarApiPeopleResult>(`https://swapi.co/api/people/?format=json&search=${name}`)

// create an input text that has obsevable properties
const SearchText = rxInput("text")
const loader = createLoaderControl() // loader control

// Rx operator pipeline for type ahead search
const typeAheadSearch$ =
  SearchText.onValueChanges$.pipe(
    filter(x => x.length >= 2),
    debounceTime(300),
    distinctUntilChanged(),
    loader.start(),
    switchMap(searchStarWarsPeople),
    retry(3),
    map(x => x.results),
    loader.stop(),
  )

const App = () => {
  // use observables
  const starWarsPeople = useObservable(typeAheadSearch$, [])
  const isLoading = useObservable(loader.status$, false)
  
  return (
    <div>
      <header>
        <SearchText  />
        {isLoading && <span>loading...</span>}
        <ul>
          {starWarsPeople.map((x, i) =>
            <li key={i}>
              <div>{x.name}</div>
            </li>
          )}
        </ul>
      </header>
    </div>
  )
}
```

## Documentation