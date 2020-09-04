/* eslint-disable require-jsdoc */

function curry(fx){
  const arity = fx.length;
  return function f1(...args){
    if (args.length >= arity) {
      return fx(...args);
    }
    return function f2(...args2){
      return f1(...args, ...args2);
    };
  };
}

function compose(fn, ...rest){
  return rest.length === 0 ? fn : (...args) => fn(compose(...rest)(...args));
}

function head(collection){
  return collection[0];
}

function length(collection){
  return collection.length;
}

const split = curry((splitter, str) => str.split(splitter));
const eq = curry((x, y) => y === x);
const gt = curry((x, y) => x < y);
const isAria = compose(eq('aria'), head, split('-'));
const prepend = curry((x, y) => x + y);
const prefix = prepend('aria-');
const isId = compose(eq('#'), head);
const isClass = compose(eq('.'), head);
const isComplexSelector = compose(gt(1), length, split(' '));

function isIdSelector(selector){
  return isId(selector) && !isComplexSelector(selector);
}

function isClassSelector(selector){
  return isClass(selector) && !isComplexSelector(selector);
}

function isUndefined(thing){
  return typeof thing === 'undefined';
}

function isObject(thing){
  return thing != null && typeof thing === 'object' && !Array.isArray(thing);
}

class Ally {
  constructor(el){
    this.el = el;
  }

  ally(obj){
    if ( isUndefined(obj) ) {
      return {
        role: this.role(),
        aria: this.aria()
      };
    }
    if ( obj.role ) {
      this.role(obj.role);
    }
    if ( obj.aria ) {
      this.aria(obj.aria);
    }
    return this;
  }
  role(role){
    if ( isUndefined(role) ) {
      return this.el.getAttribute('role');
    }
    this.el.setAttribute('role', role);
    return this;
  }
  aria(prop, val){
    if ( isUndefined(prop) ) {
      return ariaFilter();
    }
    if ( isObject(prop) ) {
      forOwn((value, key) => {
        this.el.setAttribute(prefix(key), value);
      }, prop);
    } else {
      this.el.setAttribute(prefix(prop), val);
    }
    return this;
  }
  show(){
    this.aria('hidden', false);
    this.el.display = '';
  }
  hide(){
    this.aria('hidden', true);
    this.el.display = 'none';
  }
  allyShow(){
    this.el.classList.add('ally-sr-only');
  }
}

function ariaFilter(obj){
  const newObj = {};
  Object.keys(obj)
    .filter(key => isAria(obj[key].name))
    .forEach((key) => {
      newObj[obj[key].name] = obj[key].value;
    });
  return newObj;
}

function forOwn(func, obj){
  Object.keys(obj).forEach((key) => {
    func(obj[key], key, obj);
  });
}

function getDOMElement(selector){
  if ( isIdSelector(selector) ) {
    return document.getElementById(selector);
  }
  if ( isClassSelector(selector) ) {
    return document.getElementsByClassName(selector);
  }
  return document.querySelectorAll(selector);
}

function addStyleTag(){
  const styleTag = document.createElement('style');
  styleTag.id = 'ally-style-tag';
  styleTag.textContent = '.ally-sr-only{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}';
  document.head.appendChild(styleTag);
}

function ally(selector){
  if ( !document.getElementById('ally-style-tag') ) {
    addStyleTag();
  }
  return new Ally(getDOMElement(selector));
}

export default ally;
