﻿import types = require("utils/types");
import definition = require("data/observable");
import merge = require("utils/module-merge");

interface ListenerEntry {
    callback: (data: definition.EventData) => void;
    thisArg: any;
}

export module knownEvents {
    export var propertyChange = "propertyChange";
}

export class Observable implements definition.Observable {
    private _observers = {};

    get typeName(): string {
        return types.getClass(this);
    }

    public init() {
        Observable.apply(this, arguments);
    }

    public on(eventNames: string, callback: (data: definition.EventData) => void, thisArg?: any) {
        this.addEventListener(eventNames, callback, thisArg);
    }

    public off(eventNames: string, callback?: any) {
        this.removeEventListener(eventNames, callback);
    }

    public addEventListener(eventNames: string, callback: (data: definition.EventData) => void, thisArg?: any) {
        types.verifyCallback(callback);
        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            var list = this._getEventList(event, true);
            // TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)
            list.push({
                callback: callback,
                thisArg: thisArg
            });
        }
    }

    public removeEventListener(eventNames: string, callback?: any, thisArg?: any) {
        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            if (callback) {
                var list = this._getEventList(event, false);
                if (list) {
                    var index = this._indexOfListener(list, callback, thisArg);
                    if (index >= 0) {
                        list.splice(index, 1);
                    }
                    if (list.length === 0) {
                        delete this._observers[event];
                    }
                }
            }
            else {
                this._observers[event] = undefined;
                delete this._observers[event];
            }
        }
    }

    public set(name: string, value: any) {
        // TODO: Parameter validation
        if (this[name] === value) {
            return;
        }

        // create data for the change
        var data = this._createPropertyChangeData(name, value);

        this._setCore(data);
        this.notify(data);

        // TODO: Maybe we need to update source object used in the constructor as well?
    }

    public get(name: string): any {
        return this[name];
    }

    public _setCore(data: definition.PropertyChangeData) {
        this[data.propertyName] = data.value;
    }

    public notify(data: definition.EventData) {
        var observers = this._getEventList(data.eventName);
        if (!observers) {
            return;
        }

        var i;
        var entry: ListenerEntry;

        for (i = 0; i < observers.length; i++) {
            entry = observers[i];
            if (entry.thisArg) {
                entry.callback.apply(entry.thisArg, [data]);
            } else {
                entry.callback(data);
            }
        }
    }

    public hasListeners(eventName: string) {
        return eventName in this._observers;
    }

    public _createPropertyChangeData(name: string, value: any): definition.PropertyChangeData {
        return {
            eventName: knownEvents.propertyChange,
            propertyName: name,
            object: this,
            value: value
        };
    }

    public _emit(eventNames: string) {
        var events: Array<string> = eventNames.split(",");

        for (var i = 0, l = events.length; i < l; i++) {
            var event = events[i].trim();
            this.notify({ eventName: event, object: this });
        }
    }

    private _getEventList(eventName: string, createIfNeeded?: boolean): Array<ListenerEntry> {
        if (!eventName) {
            throw new TypeError("EventName must be valid string.");
        }

        var list = <Array<ListenerEntry>>this._observers[eventName];
        if (!list && createIfNeeded) {
            list = [];
            this._observers[eventName] = list;
        }

        return list;
    }

    private _indexOfListener(list: Array<ListenerEntry>, callback: (data: definition.EventData) => void, thisArg?: any): number {
        var i;
        var entry: ListenerEntry;

        for (i = 0; i < list.length; i++) {
            entry = list[i];
            if (thisArg) {
                if (entry.callback === callback && entry.thisArg === thisArg) {
                    return i;
                }
            }
            else {
                if (entry.callback === callback) {
                    return i;
                }
            }
        }

        return -1;
    }

    public toString(): string {
        return this.typeName;
    }

    public static extends(proto: Object): Observable {
        var fn,
            member,
            that = this,
            Base = function () {},
            subclass = proto && proto.init ? proto.init : function () {
                that.apply(this, arguments);
            };

        Base.prototype = that.prototype;
        fn = subclass.fn = subclass.prototype = new Base();

        for (member in proto) {
            if (proto[member] !== null && proto[member].constructor === Object) {
                fn[member] = {};
                fn[member] = merge(Base.prototype[member], fn[member], true);
                fn[member] = merge(proto[member], fn[member], true);
            } else {
                fn[member] = proto[member];
            }
        }

        fn.constructor = subclass;
        subclass.extend = that.extend;

        return subclass;
    }

    public static fn = Observable.prototype;
}
