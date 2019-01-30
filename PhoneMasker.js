// Механизм создания маски взят здесь: https://github.com/vuejs-tips/vue-the-mask

export default class {
  constructor(args = {}) {
    this.className = args.className ? args.className : '.js-phone-mask';
    // Можно передавать другую маску
    this.mask = args.mask ? args.mask : '+7 (###) ###-##-##';
    // Соблюдение правила +79 (кушать восьмёрку)
    this.keepFirst = args.keepFirst;
    // Коллбеки
    this.onIncomplete = args.onIncomplete ? args.onIncomplete : () => {};
    this.onComplete = args.onComplete ? args.onComplete : () => {};

    const inputs = document.querySelectorAll(this.className);

    [...inputs].forEach((input) => {
      input.addEventListener('input', this.handleInput.bind(this));
    });
  }

  handleInput(e) {
    const el = e.target;

    el.value = this.constructor.maskElement(el, this.keepFirst, this.mask);

    if (this.mask.length !== el.value.length) {
      this.onIncomplete();
    } else {
      this.onComplete();
    }
  }

  static get tokens() {
    return {
      '#': {pattern: /\d/},
      'X': {pattern: /[0-9a-zA-Z]/},
      'S': {pattern: /[a-zA-Z]/},
      'A': {pattern: /[a-zA-Z]/, transform: v => v.toLocaleUpperCase()},
      'a': {pattern: /[a-zA-Z]/, transform: v => v.toLocaleLowerCase()},
      '!': {escape: true}
    };
  }

  static maskElement(el, keepFirst, mask = '+7 (###) ###-##-##') {
    let iMask = 0;
    let iValue = 0;
    let output = '';
    let value = el.value;

    if (!keepFirst && value.charAt(0) !== '9' && value.charAt(0) !== mask[0]) {
      return '';
    }

    while (iMask < mask.length && iValue < value.length) {
      let cMask = mask[iMask];
      let masker = this.tokens[cMask];
      let cValue = value[iValue];

      if (masker && !masker.escape) {
        if (masker.pattern.test(cValue)) {
        	output += masker.transform ? masker.transform(cValue) : cValue;
          iMask++;
        }
        iValue++
      } else {
        if (masker && masker.escape) {
          iMask++; // take the next mask char and treat it as char
          cMask = mask[iMask];
        }
        output += cMask;
        if (cValue === cMask) iValue++; // user typed the same char
        iMask++;
      }
    }

    // fix mask that ends with a char: (#)
    let restOutput = ''
    while (iMask < mask.length) {
      let cMask = mask[iMask];
      if (this.tokens[cMask]) {
        restOutput = '';
        break;
      }
      restOutput += cMask;
      iMask++;
    }

    return output + restOutput;
  }
}
