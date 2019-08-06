import React from 'react'
import './setupTests'
import { act } from 'react-dom/test-utils'
import { of, throwError, Observable, EMPTY, Subject } from 'rxjs'
import { useSubscribe, useObservable, useObservableWithError, rxInput, rxButton, useRxInputValue } from './'
import { mount } from 'enzyme'

describe('when subcribe to an observable', () => {

  beforeEach(() => jest.resetAllMocks())

  function HookWrapper(props) {
    const HookHelper = (props) => null
    const hook = props.hook()
    return <HookHelper hook={hook} />
  }

  function getHookValue<T>(hookInvoke: () => T): T {
    const wrapper = mount(<HookWrapper hook={hookInvoke} />)
    const x = wrapper.find('HookHelper').props()
    return x['hook']
  }
  describe('using useSubscribe', () => {

    it('should call next callback when observable emits a value ', () => {
      const nextFn = jest.fn()
      const observable = of(1)
      const TestComponent: React.FC = () => {
        useSubscribe(observable, nextFn)
        return null
      }

      mount(<TestComponent />)

      expect(nextFn).toHaveBeenCalledWith(1)
    })

    it('should call error callback when observable emits an error', () => {
      const errorFn = jest.fn()
      const observable = throwError('error')
      const TestComponent: React.FC = () => {
        useSubscribe(observable, undefined, errorFn)
        return null
      }


      mount(<TestComponent />)

      expect(errorFn).toHaveBeenCalledWith('error')
    })

    it('should call complete callback when observable completes with true', () => {
      const completesFn = jest.fn()
      const observable = of(undefined)
      const TestComponent: React.FC = () => {
        useSubscribe(observable, undefined, undefined, completesFn)
        return null
      }

      mount(<TestComponent />)

      expect(completesFn).toHaveBeenCalledWith(true)
    })

    it('should call unsubscribe when component unmount', () => {
      const unsubscribeMock = jest.fn()
      const observable = EMPTY
      const subscribeMock = jest.spyOn(observable, 'subscribe')
      subscribeMock.mockImplementation(() => ({ unsubscribe: unsubscribeMock } as any))

      const TestComponent: React.FC = () => {
        useSubscribe(observable)
        return null
      }
      const mounted = mount(<TestComponent />)
      mounted.unmount()

      expect(unsubscribeMock).toHaveBeenCalled()

    })

    it('should subscribe and unsubscribe once', () => {
      const unsubscribeMock = jest.fn()
      const observable = EMPTY
      const subscribeMock = jest.spyOn(observable, 'subscribe')
      subscribeMock.mockImplementation(() => ({ unsubscribe: unsubscribeMock } as any))

      const TestComponent: React.FC = () => {
        useSubscribe(observable)
        return null
      }
      const mounted = mount(<TestComponent />)
      mounted.unmount()

      expect(subscribeMock).toHaveBeenCalledTimes(1)
      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    })

  })


  describe('using useObservable', () => {


    it('should create a state with start value', () => {
      const observable: Observable<Number> = Observable.create()
      const value = getHookValue(() => useObservable(observable, 0))

      expect(value).toBe(0)
    })

    it('should update state when observable emit value', () => {
      const observable: Observable<Number> = of(1)
      const value = getHookValue(() => useObservable(observable, 0))

      expect(value).toBe(1)
    })

    it('should update state when observable emit more values', () => {
      const subject = new Subject<number>()

      const wrapper = mount(<HookWrapper hook={() => useObservable(subject.asObservable(), 0)} />)
      const getValue = () => wrapper.find('HookHelper').props()['hook']

      expect(getValue()).toBe(0)

      const expectUpdateTo = (value: number) => {
        act(() => { subject.next(value) })
        wrapper.update()
        expect(getValue()).toBe(value)
      }

      expectUpdateTo(1)
      expectUpdateTo(2)
      expectUpdateTo(3)
    })

  })

  describe('using useObservableWithError', () => {

    it('should create a state with start value', () => {
      const observable: Observable<Number> = Observable.create()
      const [value] = getHookValue(() => useObservableWithError(observable, 0))

      expect(value).toBe(0)
    })

    it('should update state when observable emit value', () => {
      const observable: Observable<Number> = of(1)
      const [value] = getHookValue(() => useObservableWithError(observable, 0))

      expect(value).toBe(1)
    })

    it('should update state when observable emit more values', () => {
      const subject = new Subject<number>()

      const wrapper = mount(<HookWrapper hook={() => useObservableWithError(subject.asObservable(), 0)} />)

      const getValue = () => wrapper.find('HookHelper').props()['hook'][0]

      expect(getValue()).toBe(0)

      const expectUpdateTo = (value: number) => {
        act(() => { subject.next(value) })
        wrapper.update()
        expect(getValue()).toBe(value)
      }

      expectUpdateTo(1)
      expectUpdateTo(2)
      expectUpdateTo(3)
    })

    it('error should be undefined if there is no error', () => {
      const observable: Observable<Number> = of(1)
      const [, error] = getHookValue(() => useObservableWithError(observable, 0))

      expect(error).toBeUndefined()
    })

    it('complete should be false if it not completed', () => {
      const observable: Observable<Number> = Observable.create()
      const [, , completed] = getHookValue(() => useObservableWithError(observable, 0))

      expect(completed).toBe(false)
    })

    it('complete should be true if it is completed', () => {
      const observable: Observable<Number> = of(1)
      const [, , completed] = getHookValue(() => useObservableWithError(observable, 0))

      expect(completed).toBe(true)
    })

    it('error should exist if there is an error', () => {
      const observable: Observable<Number> = throwError('error')
      const [, error] = getHookValue(() => useObservableWithError(observable, 0))

      expect(error).toBe('error')
    })

  })

  describe('with a rxInput', () => {

    it('when textbox change should trigger change observable', (done) => {
      const Input = rxInput('text')
      const typedText = 'hello'

      Input.onChange$.subscribe((e) => {
        expect(e.target.value).toBe(typedText)
        done()
      })

      const wraper = mount(<Input />)
      wraper.simulate('change', { target: { value: typedText } })
    })

    it('when textbox change should trigger changevalue observable', (done) => {
      const Input = rxInput('text')
      const typedText = 'hello'

      Input.onValueChanges$.subscribe((value) => {
        expect(value).toBe(typedText)
        done()
      })

      const wraper = mount(<Input />)
      wraper.simulate('change', { target: { value: typedText } })
    })

    it('when textbox get focus should trigger focus observable', (done) => {
      const Input = rxInput('text')

      Input.onFocus$.subscribe(() => done())

      const wraper = mount(<Input />)
      wraper.simulate('focus')
    })

    it('when textbox get blur should trigger blur observable', (done) => {
      const Input = rxInput('text')

      Input.onBlur$.subscribe(() => done())

      const wraper = mount(<Input />)
      wraper.simulate('blur')
    })


    it('when click button should trigger click observable', (done) => {
      const Button = rxButton()

      Button.onClick$.subscribe(() => done())

      const wraper = mount(<Button />)
      wraper.simulate('click')
    })

  })

  describe('with a useRxInputValue', () => {

    it('when textbox change should render new state', () => {
      const Input = rxInput('text')
      const typedText = 'hello'

      const HookTest = (props) => {
        const [value] = useRxInputValue(Input, 'initial')
        const Helper = (props) => null
        return <>
          <Input />
          <Helper value={value} />
        </>
      }

      const wraper = mount(<HookTest />)
      const getState = () => wraper.find('Helper').props()['value']

      expect(getState()).toBe('initial')

      wraper.find('input').simulate('change', { target: { value: typedText } })
      wraper.update()

      expect(getState()).toBe('hello')

    })

  })

})