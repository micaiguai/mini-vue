'use strict';

const extend = Object.assign;
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};
function hasOwn(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
}
const toHandlerKey = str => {
    return `on${capitalize(str)}`;
};
const capitalize = (str) => {
    return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c.toUpperCase();
    });
};

const targetMap = new WeakMap();
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    dep.forEach(effect => {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    });
}

const get = createGetter();
const shallowReadonlyGet = createGetter(true, true);
const readonlyGet = createGetter(true);
const set = createSetter();
function createGetter(isReadonly = false, shallow = false) {
    return function (target, key, receiver) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const result = Reflect.get(target, key, receiver);
        if (shallow) {
            return result;
        }
        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
function createSetter() {
    return function (target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
        trigger(target, key);
        return result;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHanlders = {
    get: readonlyGet,
    set(target, key, value, receiver) {
        console.warn(`key: ${key} set false, because target is readonly.`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHanlders, {
    get: shallowReadonlyGet
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHanlders);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}

function emit(instance, event, ...args) {
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        if (hasOwn(instance.setupState, key)) {
            return instance.setupState[key];
        }
        if (hasOwn(instance.props, key)) {
            return instance.props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = props => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        parent,
        provides: parent ? parent.provides : {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (isObject(vnode.children)) {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVnode(text) {
    return createVnode(Text, {}, text);
}
function getShapeFlag(type) {
    let shapeFlag;
    if (typeof type === 'string') {
        shapeFlag = 1 /* ShapeFlags.ELEMENT */;
    }
    else if (isObject(type)) {
        shapeFlag = 2 /* ShapeFlags.STATEFUL_COMPONENT */;
    }
    return shapeFlag;
}

function render(vnode, container) {
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    const { type, shapeFlag } = vnode;
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
}
function processText(vnode, container) {
    const el = vnode.el = document.createTextNode(vnode.children);
    container.append(el);
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent);
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const subTree = instance.render.call(instance.proxy);
    patch(subTree, container, instance);
    initialVnode.el = subTree.el;
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
    const el = vnode.el = document.createElement(vnode.type);
    const { children, props, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(children, el, parentComponent);
    }
    for (const key in props) {
        const isOn = /^on[A-Z]/.test(key);
        const value = props[key];
        if (isOn) {
            const event = key.slice(2, key.length).toLowerCase();
            el.addEventListener(event, value);
        }
        else {
            el.setAttribute(key, value);
        }
    }
    container.append(el);
}
function mountChildren(children, container, parentComponent) {
    children.forEach(child => {
        patch(child, container, parentComponent);
    });
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            rootContainer = document.querySelector(rootContainer);
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVnode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    const instance = getCurrentInstance();
    if (instance) {
        let { provides, parent } = instance;
        if (provides === (parent === null || parent === void 0 ? void 0 : parent.provides)) {
            provides = instance.provides = Object.create(provides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const instance = getCurrentInstance();
    const { provides } = instance.parent;
    if (key in provides) {
        return provides[key];
    }
    else if (defaultValue) {
        if (typeof defaultValue === 'function') {
            return defaultValue();
        }
        return defaultValue;
    }
}

exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
