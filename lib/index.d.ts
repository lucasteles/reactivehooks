import React from 'react';
import { Observable } from 'rxjs';
declare type InputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
declare type ButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
declare type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
declare type FocusEvent = React.FocusEvent<HTMLInputElement>;
declare type MouseButtonEvent = React.MouseEvent<HTMLButtonElement>;
interface RxInputProperties {
    onChange$: Observable<InputChangeEvent>;
    onValueChanges$: Observable<string>;
    onFocus$: Observable<FocusEvent>;
    onBlur$: Observable<FocusEvent>;
}
interface RxButtonProperties {
    onClick$: Observable<MouseButtonEvent>;
}
declare type RxInput = React.FC<InputProps> & RxInputProperties;
declare type RxButton = React.FC<ButtonProps> & RxButtonProperties;
declare function useSubscribe<T>(observable: Observable<T>, next?: ((value: T) => void) | undefined, error?: ((error: any) => void) | undefined, complete?: ((done: boolean) => void) | undefined): void;
declare function useObservable<T>(observable: Observable<T>, initialValue: T): T;
declare function useObservableWithError<T>(observable: Observable<T>, initialValue: T): [T, any, boolean];
declare const rxInput: (type?: string | undefined) => RxInput;
declare const rxButton: () => RxButton;
declare const useRxInputValue: (rxInput: RxInput, initialValue: string) => [string, (value: string) => void];
declare const createLoaderControl: () => {
    start(): <T extends Object>(x: Observable<T>) => Observable<T>;
    stop(): <T extends Object>(x: Observable<T>) => Observable<T>;
    status$: Observable<boolean>;
};
declare const fetchJson: <T extends Object>(url: RequestInfo, init?: RequestInit | undefined) => Observable<T>;
export { useObservable, useObservableWithError, useSubscribe, rxInput, rxButton, createLoaderControl, useRxInputValue, fetchJson, };
