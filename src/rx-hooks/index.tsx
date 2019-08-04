import React, { useState, useEffect, useMemo } from 'react'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { tap, finalize, map } from 'rxjs/operators';

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
type InputChange = React.ChangeEvent<HTMLInputElement>
interface RxInputProperties {
  onChange$: Observable<InputChange>
  onValueChanges$: Observable<string>
}
type RxInput = ((props: InputProps) => JSX.Element) & RxInputProperties


const useObservable = <T extends Object>(observable: Observable<T>, initialValue: T): T => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    const subscription = observable.subscribe({ next: setValue })
    return () => subscription.unsubscribe()
  }, [observable])
  return value
}


const rxInput = (type?: string): RxInput => {

  const changeSubject = new Subject<InputChange>()
  const handleChange = (e: InputChange) => changeSubject.next({ ...e })
 
  const inputFactory = (props: InputProps) =>
    <input
      onChange={handleChange}
      type={type}
      {...props}
    />

  const change$ = changeSubject.asObservable()
  const customProps: RxInputProperties = {
    onChange$: change$,
    onValueChanges$: change$.pipe(map(x => x.target.value)),
  }

  return Object.assign(inputFactory, customProps)
}

const rxButton = (): [(props: ButtonProps) => JSX.Element, Observable<undefined>] => {
  const subject = new Subject<undefined>()
  const handleClick = () => subject.next()
  const buttonfactory = (props: ButtonProps) =>

    <button onClick={handleClick} {...props} >
      {props.children}
    </button>

  return [buttonfactory, subject.asObservable()]
}

const useRxInputValue = (rxInput: RxInput, initialValue: string): [string, (value: string) => void] =>
  {
    const [value, setValue] = useState(initialValue)

    useEffect(() =>{
          const subscription  = rxInput.onValueChanges$.subscribe(x => setValue(x))
          return () => subscription.unsubscribe()
    },[])

    return [value, (newValue: string) => setValue(newValue) ]
  }

const createLoaderControl = () => {
  const subject = new BehaviorSubject(false)
  return {
    start() {
      return <T extends Object>(x: Observable<T>) =>
        x.pipe(
          finalize(() => subject.next(false)),
          tap<T>(() => subject.next(true)),
        )
    },
    stop() {
      return <T extends Object>(x: Observable<T>) =>
        tap<T>(() => subject.next(false))(x)
    },
    status$: subject.asObservable(),
  }
}

export {
  useObservable,
  rxInput,
  rxButton,
  createLoaderControl,
  useRxInputValue,
}