import React, { useState, useEffect } from 'react'
import { Observable, Subject, BehaviorSubject } from 'rxjs'
import { tap, finalize } from 'rxjs/operators';

type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
type InputChange = React.ChangeEvent<HTMLInputElement>

const useObservable = <T extends Object>(observable: Observable<T>, initialValue: T): T => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    const subscription = observable.subscribe({ next: setValue })
    return () => subscription.unsubscribe()
  }, [observable])
  return value
}

const rxInput = (type?: string): [(props: InputProps) => JSX.Element, Observable<InputChange>] => {
  const subject = new Subject<InputChange>()
  const handleChange = (e: InputChange) => {
    subject.next({ ...e })
  }

  const inputFactory = (props: InputProps) =>
    <input
      onChange={handleChange}
      type={type}
      {...props}
    />

  return [inputFactory, subject.asObservable()]
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
}