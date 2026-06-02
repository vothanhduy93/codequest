/**
 * Robust, client-safe HTML, CSS and JS code formatter
 * Executed synchronously without depending on external worker threads.
 */

export function formatHTML(html: string): string {
  if (!html || !html.trim()) return html;
  
  // Basic normalization
  let formatted = html.replace(/\r\n/g, '\n').trim();
  // Collapse whitespace between tags
  formatted = formatted.replace(/>\s*</g, '><');
  
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', '!doctype']);
  const inlineTags = new Set(['a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd', 'label', 'map', 'object', 'output', 'q', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'var']);

  // split into an array of <tag> and text elements
  const tokens = formatted.split(/(<[^>]+>)/g).filter(t => t.trim() !== '');
  
  let result = '';
  let indent = 0;
  const tab = '  ';
  let inLine = false;

  for (let i = 0; i < tokens.length; i++) {
    let rawToken = tokens[i];
    let token = rawToken.trim();
    if (!token) {
      if (inLine && rawToken.length > 0 && !result.endsWith(' ')) result += ' ';
      continue;
    }

    const hasLeadingSpace = /^\s/.test(rawToken);
    const hasTrailingSpace = /\s$/.test(rawToken);

    const isClosingTag = token.startsWith('</');
    const isSpecialTag = token.startsWith('<!') || token.startsWith('<?');
    const isOpeningTag = token.startsWith('<') && !isClosingTag && !isSpecialTag;
    
    let tagName = '';
    if (isOpeningTag || isClosingTag) {
      const match = token.match(/^<\/?([a-zA-Z0-9:-]+)/);
      if (match) tagName = match[1].toLowerCase();
    }
    
    const isVoid = isSpecialTag || voidTags.has(tagName) || token.endsWith('/>');
    const isInline = inlineTags.has(tagName);
    
    if (isClosingTag) {
      indent = Math.max(0, indent - 1);
      if (!isInline) {
        if (inLine) { result += '\n'; inLine = false; }
        result += tab.repeat(indent) + token + '\n';
      } else {
        if (!inLine) {
          result += tab.repeat(indent) + token + '\n';
        } else {
          result += token;
        }
      }
    } else if (isOpeningTag) {
      if (!isInline && !isVoid) {
        // Check for short blocks like <p>text</p>
        let isShortBlock = false;
        if (i + 2 < tokens.length) {
           const nextToken = tokens[i+1].trim();
           const nextNextToken = tokens[i+2].trim();
           if (!nextToken.startsWith('<') && nextNextToken === `</${tagName}>`) {
              isShortBlock = true;
           } else if (nextToken === `</${tagName}>`) {
              isShortBlock = true;
           }
        }
        
        if (isShortBlock) {
           if (inLine) { result += '\n'; inLine = false; }
           result += tab.repeat(indent) + token;
           if (tokens[i+1].trim() !== `</${tagName}>`) {
             result += tokens[i+1].trim();
             i++;
           }
           result += `</${tagName}>\n`;
           i++; // skip the closing tag
        } else {
           if (inLine) { result += '\n'; inLine = false; }
           result += tab.repeat(indent) + token + '\n';
           indent++;
        }
      } else if (isVoid) {
        if (!isInline && inLine) { result += '\n'; inLine = false; }
        if (!inLine && !isInline) {
           result += tab.repeat(indent) + token + '\n';
        } else {
           if (hasLeadingSpace && inLine && !result.endsWith(' ')) result += ' ';
           result += token;
           if (hasTrailingSpace && !result.endsWith(' ')) result += ' ';
        }
      } else {
        // isInline and not void
        if (!inLine) {
           result += tab.repeat(indent) + token;
           inLine = true;
        } else {
           if (hasLeadingSpace && !result.endsWith(' ')) result += ' ';
           result += token;
        }
        indent++;
      }
    } else {
      // Text node
      if (!inLine) {
        result += tab.repeat(indent) + token;
        inLine = true;
      } else {
        if (hasLeadingSpace && !result.endsWith(' ')) result += ' ';
        result += token;
      }
      if (hasTrailingSpace && !result.endsWith(' ')) {
        result += ' ';
      }
    }
  }
  
  return result.trim().replace(/\n[ \t]*\n/g, '\n'); // remove any empty lines created
}

export function formatCSS(css: string): string {
  if (!css || !css.trim()) return css;
  
  let formatted = css.replace(/\r\n/g, '\n').trim();
  formatted = formatted
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*\}\s*/g, '\n}\n');
    
  const lines = formatted.split('\n');
  let result = '';
  let indent = 0;
  const tab = '  ';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }
    
    result += tab.repeat(indent) + line + '\n';
    
    if (line.endsWith('{')) {
      indent++;
    }
  }
  return result.trim();
}

export function formatJS(js: string): string {
  if (!js || !js.trim()) return js;
  
  let formatted = js.replace(/\r\n/g, '\n').trim();
  formatted = formatted
    .replace(/\s*\{\s*/g, ' {\n')
    .replace(/\s*;\s*/g, ';\n')
    .replace(/\s*\}\s*/g, '\n}\n');
    
  const lines = formatted.split('\n');
  let result = '';
  let indent = 0;
  const tab = '  ';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }
    
    result += tab.repeat(indent) + line + '\n';
    
    if (line.endsWith('{') || line.endsWith('(')) {
      indent++;
    }
  }
  return result.trim();
}

export function customFormat(code: string, type: 'html' | 'css' | 'js'): string {
  try {
    if (type === 'html') {
      return formatHTML(code);
    } else if (type === 'css') {
      return formatCSS(code);
    } else if (type === 'js') {
      return formatJS(code);
    }
  } catch (e) {
    console.error('Custom formatting failed, fallback to original', e);
  }
  return code;
}
