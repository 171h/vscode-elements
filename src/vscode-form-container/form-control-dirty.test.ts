/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect, fixture, html} from '@open-wc/testing';
import {emulateMedia} from '@web/test-runner-commands';
import {literal, unsafeStatic} from 'lit/static-html.js';
import '../vscode-checkbox/index.js';
import '../vscode-multi-select/index.js';
import '../vscode-option/index.js';
import '../vscode-radio/index.js';
import '../vscode-single-select/index.js';
import '../vscode-textarea/index.js';
import '../vscode-textfield/index.js';
import '../vscode-form-container/index.js';
import {VscodeFormContainer} from '../vscode-form-container/index.js';

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * 表面淡出动画。浏览器解析自定义属性，
 * 因此关键帧颜色反映控件实际
 * 绘制的颜色。
 */
const getFadeAnimation = (surface: Element) =>
  (
    surface.getAnimations() as unknown as Array<{
      animationName?: string;
      effect?: {getKeyframes: () => Keyframe[]};
    }>
  ).find((item) =>
    (item.animationName ?? '').includes('vsc-form-control-dirty-fade')
  );

/**
 * 表面淡出动画的关键帧。
 */
const getFadeKeyframes = (surface: Element): Keyframe[] => {
  const animation = getFadeAnimation(surface);

  if (!animation?.effect) {
    throw new Error('the fading animation of the surface is not running');
  }

  return animation.effect.getKeyframes();
};

interface ControlCase {
  tagName: string;
  markup: string;
  /** Shadow Root 中绘制背景的元素。 */
  surface: string;
  /** 测试运行器主题的表面背景。 */
  background: string;
  /** 控件是否在小方框中绘制背景。 */
  box?: boolean;
}

const CASES: ControlCase[] = [
  {
    tagName: 'vscode-textfield',
    markup: `<vscode-textfield></vscode-textfield>`,
    surface: '.root',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-textarea',
    markup: `<vscode-textarea></vscode-textarea>`,
    surface: 'textarea',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-single-select',
    markup: `<vscode-single-select></vscode-single-select>`,
    surface: '.select-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-single-select',
    markup: `<vscode-single-select combobox></vscode-single-select>`,
    surface: '.combobox-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-multi-select',
    markup: `<vscode-multi-select>
        <vscode-option value="one" selected>One</vscode-option>
      </vscode-multi-select>`,
    surface: '.select-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-multi-select',
    markup: `<vscode-multi-select combobox>
        <vscode-option value="one" selected>One</vscode-option>
      </vscode-multi-select>`,
    surface: '.combobox-face',
    background: 'rgb(49, 49, 49)',
  },
  {
    tagName: 'vscode-checkbox',
    markup: `<vscode-checkbox>Checkbox</vscode-checkbox>`,
    surface: '.icon',
    background: 'rgb(49, 49, 49)',
    box: true,
  },
  {
    tagName: 'vscode-radio',
    markup: `<vscode-radio>Radio</vscode-radio>`,
    surface: '.icon',
    background: 'rgb(49, 49, 49)',
    box: true,
  },
];

let formIndex = 0;

/**
 * 创建包含单个控件的表单。声明以静态字符串解析，
 * 因为 Lit 不会为被空白包围的绑定
 * 创建特性绑定部分。
 */
const createForm = async (controlMarkup: string, duration = '10000') => {
  const id = `control-case-${formIndex++}`;
  const declaration = `<vscode-form-container id="${id}" mark-duration="${duration}">`;

  const form = await fixture<VscodeFormContainer>(html`
    ${literal`${unsafeStatic(declaration)}`}
    <vscode-form-group variant="vertical">
      ${literal`${unsafeStatic(controlMarkup)}`}
    </vscode-form-group>
    </vscode-form-container>
  `);

  await form.updateComplete;

  return form;
};

type TestControl = HTMLElement & {
  dirty: boolean;
  updateComplete: Promise<unknown>;
};

describe('modified state of the form controls', () => {
  for (const testCase of CASES) {
    it(`shows the state on ${testCase.tagName}`, async () => {
      const form = await createForm(testCase.markup);
      const control = form.querySelector(testCase.tagName) as TestControl;
      const surface = () =>
        control.shadowRoot!.querySelector(testCase.surface)!;

      await control.updateComplete;

      expect(control.dirty, 'the control is not modified initially').to.be
        .false;
      expect(getComputedStyle(surface()).backgroundColor).to.eq(
        testCase.background
      );

      form.mark();
      await form.updateComplete;
      await control.updateComplete;
      await nextFrame();

      expect(control.dirty, 'the control is marked').to.be.true;
      expect(control.hasAttribute('dirty'), 'the attribute is reflected').to.be
        .true;

      const style = getComputedStyle(surface());
      const keyframes = getFadeKeyframes(surface());

      expect(style.animationName).to.contain('vsc-form-control-dirty-fade');
      expect(
        style.animationDuration.split(',').map((part) => part.trim())
      ).to.deep.eq(testCase.box ? ['10s', '10s'] : ['10s']);
      // 动画绘制状态颜色，因此解析后的
      // 关键帧反映主题颜色。
      expect(keyframes[0].backgroundColor, 'the peak color').to.eq(
        'rgb(219, 228, 255)'
      );
      expect(keyframes[1].backgroundColor, 'the resting color').to.eq(
        'rgb(239, 243, 255)'
      );

      if (testCase.box) {
        expect(style.boxShadow, 'the box has a ring').to.not.eq('none');
        expect(style.animationName).to.contain('vsc-form-control-dirty-ring');
        expect(style.borderTopColor, 'the border before the transition').to.eq(
          'rgb(60, 60, 60)'
        );

        // 边框渐变为状态颜色，因此在过渡结束后
        // 读取其值。
        await delay(400);

        expect(
          getComputedStyle(surface()).borderTopColor,
          'the border of the box'
        ).to.eq('rgb(147, 169, 240)');
      }

      form.reset();
      await form.updateComplete;
      await control.updateComplete;
      await nextFrame();

      expect(control.dirty, 'the state is removed').to.be.false;
      expect(getComputedStyle(surface()).backgroundColor).to.eq(
        testCase.background
      );
    });
  }

  it('fades from the peak color to the resting color of the light theme', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    form.mark();
    await form.updateComplete;
    await nextFrame();

    const keyframes = getFadeKeyframes(surface);

    expect(keyframes).to.have.lengthOf(2);
    expect(keyframes[0].backgroundColor, 'the peak color').to.eq(
      'rgb(219, 228, 255)'
    );
    expect(keyframes[1].backgroundColor, 'the resting color').to.eq(
      'rgb(239, 243, 255)'
    );
  });

  it('takes the colors from the custom properties of the control', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    control.style.setProperty(
      '--vsc-form-control-dirty-background',
      'rgb(1, 2, 3)'
    );
    control.style.setProperty(
      '--vsc-form-control-dirty-background-peak',
      'rgb(9, 9, 9)'
    );

    form.mark();
    await form.updateComplete;
    await nextFrame();

    const keyframes = getFadeKeyframes(surface);

    expect(keyframes[0].backgroundColor, 'the peak color is replaced').to.eq(
      'rgb(9, 9, 9)'
    );
    expect(keyframes[1].backgroundColor, 'the resting color is replaced').to.eq(
      'rgb(1, 2, 3)'
    );
  });

  it('takes the colors from the custom properties of the container', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    form.style.setProperty(
      '--vsc-form-control-dirty-background',
      'rgb(1, 2, 3)'
    );
    form.style.setProperty(
      '--vsc-form-control-dirty-background-peak',
      'rgb(9, 9, 9)'
    );

    form.mark();
    await form.updateComplete;
    await nextFrame();

    const keyframes = getFadeKeyframes(surface);

    expect(
      keyframes[0].backgroundColor,
      'the peak color of the theme is replaced'
    ).to.eq('rgb(9, 9, 9)');
    expect(
      keyframes[1].backgroundColor,
      'the resting color of the theme is replaced'
    ).to.eq('rgb(1, 2, 3)');
  });

  it('takes the border and the ring color from the container', async () => {
    const form = await createForm(
      `<vscode-checkbox>Checkbox</vscode-checkbox>`
    );
    const control = form.querySelector('vscode-checkbox') as TestControl;
    const box = control.shadowRoot!.querySelector('.icon')!;

    form.style.setProperty(
      '--vsc-form-control-dirty-border-color',
      'rgb(4, 5, 6)'
    );
    form.style.setProperty(
      '--vsc-form-control-dirty-ring-color',
      'rgb(7, 8, 9)'
    );

    form.mark();
    await form.updateComplete;
    await nextFrame();

    expect(
      getComputedStyle(box).boxShadow,
      'the ring color of the container'
    ).to.contain('rgb(7, 8, 9)');

    // 边框渐变为状态颜色。
    await delay(400);

    expect(
      getComputedStyle(box).borderTopColor,
      'the border color of the container'
    ).to.eq('rgb(4, 5, 6)');
  });

  it('takes the colors from the custom properties of the body', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    document.body.style.setProperty(
      '--vsc-form-control-dirty-background',
      'rgb(1, 2, 3)'
    );

    try {
      form.mark();
      await form.updateComplete;
      await nextFrame();

      expect(
        getFadeKeyframes(surface)[1].backgroundColor,
        'the color of the page is used'
      ).to.eq('rgb(1, 2, 3)');
    } finally {
      document.body.style.removeProperty('--vsc-form-control-dirty-background');
    }
  });

  it('keeps the error colors of an invalid control', async () => {
    const form = await createForm(
      `<vscode-textfield invalid></vscode-textfield>`
    );
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;
    const errorColor = 'rgb(90, 29, 29)';

    expect(getComputedStyle(surface).backgroundColor, 'the error color').to.eq(
      errorColor
    );

    form.mark();
    await form.updateComplete;
    await nextFrame();
    await delay(400);

    expect(
      getFadeAnimation(surface),
      'the state is not animated on the control'
    ).to.be.undefined;
    expect(
      getComputedStyle(surface).backgroundColor,
      'the error color is not covered by the state'
    ).to.eq(errorColor);
  });

  it('shows the state without an animation when the motion is reduced', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const control = form.querySelector('vscode-textfield') as TestControl;
    const surface = control.shadowRoot!.querySelector('.root')!;

    await emulateMedia({reducedMotion: 'reduce'});

    try {
      form.mark();
      await form.updateComplete;
      await nextFrame();

      const style = getComputedStyle(surface);

      expect(control.dirty).to.be.true;
      expect(style.animationName, 'the animation is turned off').to.eq('none');
      expect(style.transitionDuration, 'the transition is turned off').to.eq(
        '0s'
      );
      expect(
        style.backgroundColor,
        'the color of the state is still shown'
      ).to.eq('rgb(239, 243, 255)');
    } finally {
      await emulateMedia({reducedMotion: 'no-preference'});
      form.reset();
      await form.updateComplete;
    }
  });

  describe('theme of the page', () => {
    const setThemeKind = (kind: string) => {
      document.body.dataset.vscodeThemeKind = kind;
    };

    const clearThemeKind = () => {
      delete document.body.dataset.vscodeThemeKind;
    };

    const restingColor = async (form: VscodeFormContainer) => {
      const control = form.querySelector('vscode-textfield') as TestControl;
      const surface = control.shadowRoot!.querySelector('.root')!;

      form.mark();
      await form.updateComplete;
      await nextFrame();

      return getFadeKeyframes(surface)[1].backgroundColor;
    };

    afterEach(() => {
      clearThemeKind();
    });

    it('uses the light color in the light theme', async () => {
      setThemeKind('vscode-light');
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form)).to.eq('rgb(239, 243, 255)');
    });

    it('uses the dark color in the dark theme', async () => {
      setThemeKind('vscode-dark');
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form)).to.eq('rgb(36, 58, 94)');
    });

    it('uses the high contrast color in the high contrast theme', async () => {
      setThemeKind('vscode-high-contrast');
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form)).to.eq('rgb(36, 58, 94)');
    });

    it('uses the light high contrast color in the light high contrast theme', async () => {
      setThemeKind('vscode-high-contrast-light');
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form)).to.eq('rgb(219, 228, 255)');
    });

    it('uses the light color when the theme is not published', async () => {
      clearThemeKind();
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form)).to.eq('rgb(239, 243, 255)');
    });

    it('follows the theme of the page when it changes', async () => {
      const form = await createForm(`<vscode-textfield></vscode-textfield>`);

      expect(await restingColor(form), 'the light theme by default').to.eq(
        'rgb(239, 243, 255)'
      );

      setThemeKind('vscode-dark');
      form.reset();
      await form.updateComplete;

      expect(await restingColor(form), 'the dark theme after the change').to.eq(
        'rgb(36, 58, 94)'
      );
    });

    it('keeps the box of the checkbox visible in the dark theme', async () => {
      setThemeKind('vscode-dark');
      const form = await createForm(
        `<vscode-checkbox>Checkbox</vscode-checkbox>`
      );
      const checkbox = form.querySelector('vscode-checkbox') as TestControl;
      const box = checkbox.shadowRoot!.querySelector('.icon')!;

      form.mark();
      await form.updateComplete;
      await nextFrame();

      const style = getComputedStyle(box);
      const keyframes = getFadeKeyframes(box);

      expect(keyframes[1].backgroundColor, 'the dark resting color').to.eq(
        'rgb(36, 58, 94)'
      );
      expect(style.borderTopColor, 'the dark border color').to.eq(
        'rgb(74, 110, 168)'
      );
      expect(style.boxShadow, 'the ring of the dark theme').to.not.eq('none');
    });
  });

  it('marks every control of the form', async () => {
    const form = await createForm(`
      <vscode-textfield></vscode-textfield>
      <vscode-textarea></vscode-textarea>
      <vscode-single-select></vscode-single-select>
      <vscode-checkbox>Checkbox</vscode-checkbox>
      <vscode-radio>Radio</vscode-radio>
    `);

    form.mark();
    await form.updateComplete;

    for (const {tagName} of CASES) {
      const control = form.querySelector(tagName) as TestControl | null;

      if (control) {
        expect(control.dirty, `${tagName} is marked`).to.be.true;
      }
    }
  });

  it('does not mark a control which is not part of the form', async () => {
    const form = await createForm(`<vscode-textfield></vscode-textfield>`);
    const host = document.createElement('div');

    host.innerHTML = `<vscode-textfield id="loose-field"></vscode-textfield>`;
    document.body.appendChild(host);

    const loose = host.querySelector('#loose-field') as TestControl;

    try {
      form.mark();
      await form.updateComplete;
      await delay(20);

      expect(form.querySelector('vscode-textfield')!.dirty).to.be.true;
      expect(loose.dirty, 'the loose control is untouched').to.be.false;
      expect(loose.hasAttribute('dirty')).to.be.false;
    } finally {
      host.remove();
    }
  });
});
