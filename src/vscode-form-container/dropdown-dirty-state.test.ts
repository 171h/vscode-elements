/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect, fixture, html} from '@open-wc/testing';
import {literal, unsafeStatic} from 'lit/static-html.js';
import '../vscode-multi-select/index.js';
import '../vscode-option/index.js';
import '../vscode-single-select/index.js';
import '../vscode-form-container/index.js';
import {VscodeFormContainer} from '../vscode-form-container/index.js';

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

/** Waits until the predicate is true, so the tests are not time sensitive. */
const waitFor = async (
  predicate: () => boolean,
  timeout = 3000
): Promise<void> => {
  const deadline = performance.now() + timeout;

  while (!predicate()) {
    if (performance.now() > deadline) {
      throw new Error('Timed out while waiting for the dropdown state');
    }

    await delay(10);
  }
};

interface DropdownElement extends HTMLElement {
  dirty: boolean;
  value: string | string[];
  updateComplete: Promise<unknown>;
}

let formIndex = 0;

const OPTIONS = `
  <vscode-option value="one">One</vscode-option>
  <vscode-option value="two">Two</vscode-option>
  <vscode-option value="three">Three</vscode-option>
`;

/**
 * The markup of a form with one dropdown. The declaration is parsed as a
 * static string, because Lit does not create an attribute part for a binding
 * which is surrounded by whitespace.
 */
const formMarkup = (
  duration: string,
  dropdownMarkup: string,
  id: string
): string => `
  <vscode-form-container id="${id}" mark-duration="${duration}">
    <vscode-form-group variant="vertical">
      ${dropdownMarkup}
    </vscode-form-group>
  </vscode-form-container>
`;

const createForm = async (markup: string) => {
  const form = await fixture<VscodeFormContainer>(html`
    ${literal`${unsafeStatic(markup)}`}
  `);

  await form.updateComplete;

  return form;
};

const getControl = (root: Element, selector: string) =>
  root.querySelector(selector) as DropdownElement | null;

/**
 * Selects an option the way a user does: the face of the dropdown is clicked
 * to open the options, then the option of the opened list is clicked.
 */
const selectOption = async (dropdown: DropdownElement, index: number) => {
  const face = dropdown.shadowRoot!.querySelector(
    '.select-face, .combobox-face'
  ) as HTMLElement;

  face.click();
  await dropdown.updateComplete;
  await delay(10);

  const options =
    dropdown.shadowRoot!.querySelectorAll<HTMLElement>('li[role="option"]');

  options[index].click();
  await dropdown.updateComplete;
  await delay(10);
};

const backgroundOf = (dropdown: DropdownElement) => {
  const face = dropdown.shadowRoot!.querySelector(
    '.select-face, .combobox-face'
  )!;
  const rgb = getComputedStyle(face)
    .backgroundColor.match(/[\d.]+/g)!
    .map(Number);

  return {
    background: getComputedStyle(face).backgroundColor,
    // the wash of the state is blue, the background of the theme is not
    isBlue: rgb[2] > rgb[0] && rgb[2] > rgb[1],
  };
};

describe('modified state of a dropdown', () => {
  it('marks the form when the user selects an option', async () => {
    const id = `dropdown-select-${formIndex++}`;
    const form = await createForm(
      formMarkup(
        '1000',
        `<vscode-single-select>${OPTIONS}</vscode-single-select>`,
        id
      )
    );
    const dropdown = getControl(form, 'vscode-single-select')!;

    expect(form.dirty).to.be.false;

    await selectOption(dropdown, 1);

    expect(dropdown.value).to.eq('two');
    expect(form.dirty, 'the form is marked').to.be.true;
    expect(dropdown.dirty, 'the dropdown is marked').to.be.true;
    expect(dropdown.hasAttribute('dirty')).to.be.true;
    expect(backgroundOf(dropdown).isBlue, 'the face is blue').to.be.true;
  });

  it('restores the dropdown when the duration has passed', async () => {
    const id = `dropdown-expire-${formIndex++}`;
    const form = await createForm(
      formMarkup(
        '1000',
        `<vscode-single-select>${OPTIONS}</vscode-single-select>`,
        id
      )
    );
    const dropdown = getControl(form, 'vscode-single-select')!;
    const background = backgroundOf(dropdown).background;

    await selectOption(dropdown, 1);
    expect(form.dirty).to.be.true;

    // The state is still there after half of the duration.
    await delay(500);
    expect(form.dirty, 'the state is still there').to.be.true;

    await waitFor(() => !form.dirty);

    expect(form.dirty, 'the form is restored').to.be.false;
    expect(dropdown.dirty, 'the dropdown is restored').to.be.false;
    expect(dropdown.hasAttribute('dirty')).to.be.false;

    const restored = backgroundOf(dropdown);

    expect(restored.background).to.eq(background);
    expect(restored.isBlue).to.be.false;
  });

  it('keeps the state of a multiple select until the duration has passed', async () => {
    const id = `dropdown-multi-${formIndex++}`;
    const form = await createForm(
      formMarkup(
        '1000',
        `<vscode-multi-select open>${OPTIONS}</vscode-multi-select>`,
        id
      )
    );
    const dropdown = getControl(form, 'vscode-multi-select')!;
    const background = backgroundOf(dropdown).background;

    await selectOption(dropdown, 2);

    expect(JSON.stringify(dropdown.value)).to.eq('["three"]');
    expect(form.dirty).to.be.true;

    await waitFor(() => !form.dirty);

    expect(form.dirty).to.be.false;
    expect(dropdown.dirty).to.be.false;
    expect(backgroundOf(dropdown).background).to.eq(background);
  });

  it('keeps the state of the perpetual duration', async () => {
    const id = `dropdown-forever-${formIndex++}`;
    const form = await createForm(
      formMarkup(
        'forever',
        `<vscode-single-select>${OPTIONS}</vscode-single-select>`,
        id
      )
    );
    const dropdown = getControl(form, 'vscode-single-select')!;

    await selectOption(dropdown, 0);

    // Longer than the duration of the other cases of the suite.
    await delay(1500);

    expect(form.dirty, 'the form is still marked').to.be.true;
    expect(dropdown.dirty, 'the dropdown is still marked').to.be.true;
    expect(backgroundOf(dropdown).isBlue).to.be.true;

    form.reset();
    await form.updateComplete;

    expect(form.dirty).to.be.false;
    expect(dropdown.dirty).to.be.false;
    expect(backgroundOf(dropdown).isBlue).to.be.false;
  });

  it('restores the other dropdowns when a dropdown is selected', async () => {
    const firstId = `dropdown-first-${formIndex++}`;
    const secondId = `dropdown-second-${formIndex++}`;

    const first = await createForm(
      formMarkup(
        'forever',
        `<vscode-single-select>${OPTIONS}</vscode-single-select>`,
        firstId
      )
    );
    const second = await createForm(
      formMarkup(
        '1000',
        `<vscode-multi-select open>${OPTIONS}</vscode-multi-select>`,
        secondId
      )
    );

    const firstDropdown = getControl(first, 'vscode-single-select')!;
    const secondDropdown = getControl(second, 'vscode-multi-select')!;

    await selectOption(firstDropdown, 1);

    expect(first.dirty, 'the first form is marked').to.be.true;
    expect(backgroundOf(firstDropdown).isBlue).to.be.true;

    await selectOption(secondDropdown, 0);

    expect(second.dirty, 'the second form is marked').to.be.true;
    expect(backgroundOf(secondDropdown).isBlue).to.be.true;

    expect(first.dirty, 'the first form is restored immediately').to.be.false;
    expect(firstDropdown.dirty).to.be.false;
    expect(firstDropdown.hasAttribute('dirty')).to.be.false;
    expect(backgroundOf(firstDropdown).isBlue, 'the first face is normal').to.be
      .false;
  });

  it('restores the state of a dropdown as well', async () => {
    const id = `dropdown-reset-${formIndex++}`;
    const form = await createForm(
      formMarkup(
        'forever',
        `<vscode-single-select>${OPTIONS}</vscode-single-select>`,
        id
      )
    );
    const dropdown = getControl(form, 'vscode-single-select')!;

    form.mark();
    await form.updateComplete;
    expect(dropdown.dirty).to.be.true;

    form.reset();
    await form.updateComplete;

    expect(dropdown.dirty, 'reset() restores the dropdown').to.be.false;
    expect(backgroundOf(dropdown).isBlue).to.be.false;
  });
});
