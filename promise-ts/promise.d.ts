declare type resolve<T> = (data: T) => void;
declare type reject<T> = (data: T) => void;
declare type fn<T, P = any> = (resolve: resolve<T>, reject: reject<P>) => void;
export declare class myP<T> {
    id: number;
    private status;
    private _value;
    private _errValue;
    private _fnArr;
    private _catchFnArr;
    constructor(fn: fn<T>);
    then<Y>(fn: (data: T) => Y | T, errFn?: (e: any) => any): myP<Y>;
    catch(fn: (data: any) => void): myP<unknown>;
    private resolve;
    private reject;
    static resolve(): myP<unknown>;
    static resolve<T>(data: T): myP<T>;
    static reject(data: any): myP<unknown>;
}
export {};
