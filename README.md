# Reactive Hooks
[![npm version](https://badge.fury.io/js/reactivehooks.svg)](https://badge.fury.io/js/reactivehooks)
[![Build Status](https://travis-ci.org/lucasteles/reactivehooks.svg?branch=master)](https://travis-ci.org/lucasteles/reactivehooks)
[![Coverage Status](https://img.shields.io/coveralls/github/lucasteles/reactivehooks/master.svg)](https://coveralls.io/github/lucasteles/reactivehooks?branch=master)

Reactive Hooks provides a set of tools for work with Reactive Extensions in React using hooks

** This project is in a very early stage, feel free to contribute 😉

## Installation

Nothing new here, just npm install
```sh
npm i reactivehooks
```

## Get Started

The code below is a sample that shows how to write a type ahead search using Reactive Hooks and [RxJs](https://github.com/ReactiveX/rxjs):

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

# Documentation


## useSubscribe

A hook that provides a way to just subscribe to an observable

Signature:
```ts
 function useSubscribe<T>(
   observable: Observable<T>, 
   next?: ((value: T) => void), 
   error?: ((error: any) => void), 
   complete?: ((done: boolean) => void)
 ): void
```


---
## useObservable

A hook that subscribes to an observable and returns the emited value as a state for your component

Signature:
```ts
function useObservable<T>(
    observable: Observable<T>, 
    initialValue: T
): T
```
---
## useObservableWithError

A hook that subscribes to an observable and returns the emited value, error or complete as a state for your component

Signature:
```ts
function useObservableWithError<T>(
    observable: Observable<T>, 
    initialValue: T
): [T, any, boolean]
```
---
## useRxInputValue

A hook that subscribes to an observable of changes of a `RxInput`, returning the value and a function to change the input value

Signature:
```ts
function useRxInputValue(
  rxInput: RxInput, 
  initialValue: string
) => [string, (value: string) => void]
```
---

## rxInput

Creates a html input of given type, the control have observable properties for control changes

Signature:
```ts
function rxInput(type: string): RxInput
```

### Properties

| Property        | Event    | Notes                                                                |
|-----------------|----------|----------------------------------------------------------------------|
| onChange$       | onChange |                                                                      |
| onFocus$        | onFocus  |                                                                      |
| onBlur$         | onBlur   |                                                                      |
| onValueChanges$ | onChange | Emit just the value of the control without the complete event object |
---

## rxButton

Creates a html button, the control have observable properties for control changes

Signature:
```ts
function rxButton(): RxButton
```

### Properties

| Property        | Event    | Notes                                                                |
|-----------------|----------|----------------------------------------------------------------------|
| onClick$       | onClick |                                                                      |

---
## createLoaderControl

Creates a helper object with RxJs operators for start and stop a loader observable

Signature:
```ts
function createLoaderControl(): {
    start(): function<T>(x: Observable<T>): Observable<T>;
    stop(): function<T>(x: Observable<T>): Observable<T>;
    status$: Observable<boolean>
}
```

---
## fetchJson

Is just the `fromFetch`  from `rxjs/fetch`, but auto map to `json()`

Signature:
```ts
function fetchJson<T>(
  url: string | Request, 
  init?: RequestInit
): Observable<T>
```
---
