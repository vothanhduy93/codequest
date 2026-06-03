import beautify from 'js-beautify';

/**
 * Robust, client-safe HTML, CSS and JS code formatter using js-beautify
 */

export function formatHTML(html: string): string {
  if (!html || !html.trim()) return html;
  try {
    return beautify.html(html, {
      indent_size: 2,
      preserve_newlines: true,
      max_preserve_newlines: 1,
      wrap_line_length: 0,
      wrap_attributes: 'auto',
      unformatted: ['b', 'em', 'i', 'strong', 'u', 'span'],
      content_unformatted: ['pre', 'code', 'textarea']
    });
  } catch (e) {
    console.error('js-beautify HTML error:', e);
    return html;
  }
}

export function formatCSS(css: string): string {
  if (!css || !css.trim()) return css;
  try {
    return beautify.css(css, {
      indent_size: 2
    });
  } catch (e) {
    console.error('js-beautify CSS error:', e);
    return css;
  }
}

export function formatJS(js: string): string {
  if (!js || !js.trim()) return js;
  try {
    return beautify.js(js, {
      indent_size: 2,
      space_in_empty_paren: true
    });
  } catch (e) {
    console.error('js-beautify JS error:', e);
    return js;
  }
}

export function customFormat(code: string, type: 'html' | 'css' | 'js'): string {
  if (type === 'html') {
    return formatHTML(code);
  } else if (type === 'css') {
    return formatCSS(code);
  } else if (type === 'js') {
    return formatJS(code);
  }
  return code;
}

