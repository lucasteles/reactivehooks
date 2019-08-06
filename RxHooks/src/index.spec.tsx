import React from 'react'
import './setupTests'
// import { useStateSpy } from './setupTests'

import { of, throwError, Observable, EMPTY } from 'rxjs'
import { useSubscribe, useObservable } from './'
import { mount, shallow } from 'enzyme';

describe('when subcribe to an observable', () => {
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
  })


  describe('using useObservable', () => {

    function HookWrapper(props) {
      const HookHelper = (props) => null
      const hook = props.hook ? props.hook() : undefined
      return <HookHelper hook={hook} />
    }

    function getHookValue<T>(hookInvoke: () => T): T {
      const wrapper = mount(<HookWrapper hook={hookInvoke} />)
      const x = wrapper.find('HookHelper').props();
      return x['hook'] 
    }

    it('should create a state with start value', () => {
      const observable: Observable<Number> = Observable.create()
      const value = getHookValue(() => useObservable(observable, 0))

      expect(value).toBe(0)
    })

    it('should create a state with observable emmited value', () => {
      const observable: Observable<Number> = of(1)
      const value = getHookValue(() => useObservable(observable, 0))

      expect(value).toBe(1)
    })

  })

})