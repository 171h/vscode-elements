import {noChange, PropertyPart} from 'lit';
import {Directive, directive, PartInfo, PartType} from 'lit/directive.js';

class StylePropertyMap extends Directive {
  private _prevProperties: {[key: string]: string} = {};

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.PROPERTY || partInfo.name !== 'style') {
      throw new Error(
        'The `stylePropertyMap` directive must be used in the `style` property'
      );
    }
  }

  override update(
    part: PropertyPart,
    [styleProps]: [{[key: string]: string}]
  ): unknown {
    Object.entries(styleProps).forEach(([key, val]) => {
      if (this._prevProperties[key] !== val) {
        if (key.startsWith('--')) {
          part.element.style.setProperty(key, val);
        } else {
          // @ts-expect-error 此处类型错误无法由当前类型定义解决。
          part.element.style[key] = val;
        }

        this._prevProperties[key as string] = val;
      }
    });

    return noChange;
  }

  render(_styleProps: Partial<CSSStyleDeclaration | {[key: string]: string}>) {
    return noChange;
  }
}

/**
 * 实现类似 styleMap 的 Lit 指令，使用 style 属性对象设置样式，
 * 避免通过 style HTML 特性设置样式而违反 CSP。
 *
 * [MDN 参考](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy#unsafe-inline)
 */
export const stylePropertyMap = directive(StylePropertyMap);
