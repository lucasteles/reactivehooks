import React, { useState, useEffect } from 'react'
import { Observable, Subject, BehaviorSubject, defer } from 'rxjs'
import { tap, finalize, map, switchMap } from 'rxjs/operators'
import { fromFetch } from 'rxjs/fetch'

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>
type FocusEvent = React.FocusEvent<HTMLInputElement>
type MouseButtonEvent = React.MouseEvent<HTMLButtonElement>
export type HtmlInputTypes = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"

interface RxInputProperties {
  onChange$: Observable<InputChangeEvent>
  onValueChanges$: Observable<string>
  onFocus$: Observable<FocusEvent>
  onBlur$: Observable<FocusEvent>
}

interface RxButtonProperties {
  onClick$: Observable<MouseButtonEvent>
}

type RxInput = React.FC<InputProps> & RxInputProperties
type RxButton = React.FC<ButtonProps> & RxButtonProperties

function useSubscribe<T, TError>(
  observable: Observable<T>,
  next?: ((value: T) => void) | undefined,
  error?: ((error: TError) => void) | undefined,
  complete?: ((done: boolean) => void) | undefined): void {

  useEffect(() => {
    const subscription = observable.subscribe(next, error, complete && (() => complete(true)))

    return () => subscription.unsubscribe()
  }, [observable])
}

function useObservable<T>(observable: Observable<T>, initialValue: T): T {
  const [value, setValue] = useState(initialValue)
  useSubscribe(observable, setValue)
  return value
}


function useObservableWithError<T, TError>(observable: Observable<T>, initialValue: T): [T, TError | undefined, boolean] {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(undefined)
  const [completed, setComplete] = useState(false)
  useSubscribe(observable, setValue, setError, setComplete)

  return [value, error, completed]
}

const rxInput = (type?: HtmlInputTypes): RxInput => {

  const changeSubject = new Subject<InputChangeEvent>()
  const handleChange = (e: InputChangeEvent) => changeSubject.next({ ...e })

  const focusSubject = new Subject<FocusEvent>()
  const handleFocus = (e: FocusEvent) => focusSubject.next({ ...e })

  const blurSubject = new Subject<FocusEvent>()
  const handleBlur = (e: FocusEvent) => blurSubject.next({ ...e })

  const inputFactory = (props: InputProps) =>
    <input
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      type={type}
      {...props}
    />

  const change$ = changeSubject.asObservable()
  const customProps: RxInputProperties = {
    onChange$: change$,
    onValueChanges$: change$.pipe(map(x => x.target.value)),
    onFocus$: focusSubject.asObservable(),
    onBlur$: blurSubject.asObservable(),
  }

  return Object.assign(inputFactory, customProps)
}

const rxButton = (): RxButton => {
  const subject = new Subject<MouseButtonEvent>()
  const handleClick = (e: MouseButtonEvent) => subject.next(e)
  const buttonfactory = (props: ButtonProps) =>

    <button onClick={handleClick} {...props} >
      {props.children}
    </button>

  const buttonProps: RxButtonProperties = {
    onClick$: subject.asObservable()
  }

  return Object.assign(buttonfactory, buttonProps)
}

const useRxInputValue = (rxInput: RxInput, initialValue: string): [string, (value: string) => void] => {
  const [value, setValue] = useState(initialValue)
  useSubscribe(rxInput.onValueChanges$, x => setValue(x))
  return [value, (newValue: string) => setValue(newValue)]
}

const createLoaderControl = () => {
  const subject = new BehaviorSubject(false)
  return {
    start() {
      return function <T>(x: Observable<T>) {
        return x.pipe(
          finalize(() => subject.next(false)),
          tap<T>(() => subject.next(true)),
        )
      }
    },
    stop() {
      return function <T>(x: Observable<T>) { return tap<T>(() => subject.next(false))(x) }
    },
    status$: subject.asObservable(),
  }
}

function fetchJson<T>(url: string | Request, init?: RequestInit) {
  return fromFetch(url, init)
    .pipe(
      switchMap(x => x.json().then((x: T) => x)),
    )
}

const waitElementPromise = (id: string, timeout = 1000) =>
  new Promise<HTMLElement>((resolve, reject) => {
    let time = 0
    const interval = 100
    const inteval = setInterval(() => {
      const domElement = document.getElementById(id)
      if (domElement != null) {
        clearInterval(inteval)
        resolve(domElement)
      }
      else {
        time += interval
        if (time >= timeout)
          reject(new Error('waitElement timeout'))
      }
    }, interval)
  })

const waitElement = (id: string, timeout = 1000) => defer(() => waitElementPromise(id, timeout))


export {
  useObservable,
  useObservableWithError,
  useSubscribe,
  useRxInputValue,
  rxInput,
  rxButton,
  createLoaderControl,
  fetchJson,
  waitElement,
}