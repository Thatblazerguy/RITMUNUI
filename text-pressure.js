/**
 * TextPressure — Vanilla JS port of the React Bits component.
 * Ported from https://reactbits.dev/text-animations/text-pressure
 *
 * Usage:
 *   new TextPressure('#my-container', { text: 'HELLO', textColor: '#fff', ... });
 */
class TextPressure {
  constructor(selector, options = {}) {
    this.container = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;
    if (!this.container) return;

    // Defaults
    this.opts = Object.assign({
      text: 'Hello!',
      fontFamily: 'Playfair Display',
      fontUrl: null, // injected via Google Fonts link tag, so null = don't inject @font-face
      flex: true,
      scale: false,
      alpha: false,
      stroke: false,
      width: false,        // Playfair VF doesn't have wdth axis
      weight: true,
      italic: true,
      textColor: '#eae1dc',
      strokeColor: '#FF0000',
      minFontSize: 36,
    }, options);

    this.mouse = { x: 0, y: 0 };
    this.cursor = { x: 0, y: 0 };
    this.fontSize = this.opts.minFontSize;
    this.spans = [];
    this.rafId = null;

    this._build();
    this._bindEvents();
    this._setSize();
    this._animate();
  }

  _build() {
    const { text, fontFamily, fontUrl, flex, stroke, textColor, strokeColor } = this.opts;

    // Inject @font-face only if a URL is provided
    if (fontUrl) {
      const styleId = 'text-pressure-font';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `@font-face { font-family: '${fontFamily}'; src: url('${fontUrl}'); font-style: normal; }`;
        document.head.appendChild(style);
      }
    }

    // Inject base styles
    const baseStyleId = 'text-pressure-styles';
    if (!document.getElementById(baseStyleId)) {
      const style = document.createElement('style');
      style.id = baseStyleId;
      style.textContent = `
        .tp-title { margin: 0; user-select: none; white-space: nowrap; font-weight: 100; width: 100%; text-align: center; }
        .tp-flex  { display: flex; justify-content: space-between; }
        .tp-stroke span { position: relative; }
        .tp-stroke span::after {
          content: attr(data-char); position: absolute; left: 0; top: 0;
          color: transparent; z-index: -1;
          -webkit-text-stroke-width: 3px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `;
      document.head.appendChild(style);
    }

    // Container must be positioned
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';

    // Build h1
    this.title = document.createElement('h1');
    this.title.className = [
      'tp-title',
      flex ? 'tp-flex' : '',
      stroke ? 'tp-stroke' : ''
    ].filter(Boolean).join(' ');

    Object.assign(this.title.style, {
      fontFamily: `'${fontFamily}', serif`,
      textTransform: 'uppercase',
      fontSize: this.fontSize + 'px',
      lineHeight: '1',
      margin: '0',
      textAlign: 'center',
      color: textColor,
    });

    // Split text into spans
    this.spans = [];
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.dataset.char = char;
      span.textContent = char;
      span.style.display = 'inline-block';
      if (!stroke) span.style.color = textColor;
      this.title.appendChild(span);
      this.spans.push(span);
    });

    this.container.appendChild(this.title);

    // Centre cursor on init
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = rect.left + rect.width / 2;
    this.mouse.y = rect.top + rect.height / 2;
    this.cursor.x = this.mouse.x;
    this.cursor.y = this.mouse.y;
  }

  _bindEvents() {
    this._onMouseMove = e => { this.cursor.x = e.clientX; this.cursor.y = e.clientY; };
    this._onTouchMove = e => { this.cursor.x = e.touches[0].clientX; this.cursor.y = e.touches[0].clientY; };
    this._onResize = this._debounce(() => this._setSize(), 100);

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    window.addEventListener('resize', this._onResize);
  }

  _setSize() {
    if (!this.container || !this.title) return;
    const { width: cw } = this.container.getBoundingClientRect();
    const chars = this.opts.text.length;
    let fs = cw / (chars / 2);
    fs = Math.max(fs, this.opts.minFontSize);
    this.fontSize = fs;
    this.title.style.fontSize = fs + 'px';
  }

  _dist(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _getAttr(distance, maxDist, minVal, maxVal) {
    const val = maxVal - Math.abs((maxVal * distance) / maxDist);
    return Math.max(minVal, val + minVal);
  }

  _animate() {
    this.mouse.x += (this.cursor.x - this.mouse.x) / 15;
    this.mouse.y += (this.cursor.y - this.mouse.y) / 15;

    if (this.title) {
      const titleRect = this.title.getBoundingClientRect();
      const maxDist = titleRect.width / 2;

      this.spans.forEach(span => {
        if (!span) return;
        const rect = span.getBoundingClientRect();
        const charCenter = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        const d = this._dist(this.mouse, charCenter);

        const wght = this.opts.weight ? Math.floor(this._getAttr(d, maxDist, 300, 900)) : 400;
        const wdth = this.opts.width  ? Math.floor(this._getAttr(d, maxDist, 5, 200))   : 100;
        const italVal = this.opts.italic ? this._getAttr(d, maxDist, 0, 1).toFixed(2) : 0;
        const alphaVal = this.opts.alpha  ? this._getAttr(d, maxDist, 0, 1).toFixed(2) : 1;

        const fvs = `'wght' ${wght}${this.opts.width ? `, 'wdth' ${wdth}` : ''}${this.opts.italic ? `, 'ital' ${italVal}` : ''}`;
        if (span.style.fontVariationSettings !== fvs) span.style.fontVariationSettings = fvs;
        if (this.opts.alpha) span.style.opacity = alphaVal;
      });
    }

    this.rafId = requestAnimationFrame(() => this._animate());
  }

  _debounce(func, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => func.apply(this, args), delay); };
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('touchmove', this._onTouchMove);
    window.removeEventListener('resize', this._onResize);
  }
}
