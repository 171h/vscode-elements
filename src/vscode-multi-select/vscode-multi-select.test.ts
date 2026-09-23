/* eslint-disable @typescript-eslint/no-unused-expressions */
import {expect, fixture, html} from '@open-wc/testing';
import {sendKeys} from '@web/test-runner-commands';
import sinon from 'sinon';
import '../vscode-option/index.js';
import {clickOnElement, moveMouseOnElement} from '../includes/test-helpers.js';
import {VscodeOption} from '../vscode-option/index.js';
import {VscodeMultiSelect} from './index.js';

const LONG_LABEL = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

async function waitForSelectFace(el: VscodeMultiSelect) {
  // the labels are fitted into the face after the update, the fitting can
  // trigger another update
  for (let i = 0; i < 5; i++) {
    await el.updateComplete;
  }
}

function getVisibleLabels(el: VscodeMultiSelect) {
  return Array.from(
    el.shadowRoot!.querySelectorAll<HTMLElement>(
      '.option-tag:not(.collapsed):not(.more-tag)'
    )
  ).map((tag) => tag.textContent);
}

function getCollapsedLabels(el: VscodeMultiSelect) {
  return Array.from(
    el.shadowRoot!.querySelectorAll<HTMLElement>('.option-tag.collapsed')
  ).map((tag) => tag.textContent);
}

function getMoreTag(el: VscodeMultiSelect) {
  return el.shadowRoot!.querySelector<HTMLElement>('.more-tag:not(.measuring)');
}

describe('vscode-multi-select', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-multi-select');
    expect(el).to.instanceOf(VscodeMultiSelect);
  });

  it('uses medium size by default', async () => {
    const el = (await fixture(html`
      <vscode-multi-select></vscode-multi-select>
    `)) as VscodeMultiSelect;

    expect(el.size).to.eq('medium');
    expect(el.getAttribute('size')).to.eq('medium');
  });

  it('reflects the size property', async () => {
    const el = (await fixture(html`
      <vscode-multi-select></vscode-multi-select>
    `)) as VscodeMultiSelect;
    el.size = 'large';
    await el.updateComplete;

    expect(el.getAttribute('size')).to.eq('large');
  });

  it('uses a 16px height at the small size', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select size="small">
        <vscode-option selected>Option</vscode-option>
      </vscode-multi-select>
    `);

    expect(el.getBoundingClientRect().height).to.eq(16);
  });

  it('resizes dropdown options and the scroll pane with the component', async () => {
    for (const [size, expectedHeight, expectedFontSize] of [
      ['small', 16, '11px'],
      ['medium', 22, '13px'],
      ['large', 28, '15px'],
    ] as const) {
      const el = await fixture<VscodeMultiSelect>(html`
        <vscode-multi-select .size=${size} open>
          <vscode-option>First</vscode-option>
          <vscode-option>Second</vscode-option>
        </vscode-multi-select>
      `);
      const option = el.shadowRoot!.querySelector<HTMLLIElement>('.option')!;
      const scrollable =
        el.shadowRoot!.querySelector<HTMLElement>('.scrollable')!;

      expect(option.getBoundingClientRect().height).to.eq(expectedHeight);
      expect(getComputedStyle(option).fontSize).to.eq(expectedFontSize);
      expect(scrollable.getBoundingClientRect().height).to.eq(
        expectedHeight * 2
      );
    }
  });

  it('should display selected value', async () => {
    const el = (await fixture(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>
    `)) as VscodeMultiSelect;
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Ipsum']);
    expect(el.selectedIndexes).to.eql([1]);
    expect(el.value).to.eql(['Ipsum']);
  });

  it('should display the label of every selected option', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
        <vscode-option selected>Dolor</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Ipsum', 'Dolor']);
    expect(getCollapsedLabels(el)).to.eql([]);
    expect(getMoreTag(el)).to.be.null;
  });

  it('should display the labels in the order of the selection', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Alpha</vscode-option>
        <vscode-option>Bravo</vscode-option>
        <vscode-option>Charlie</vscode-option>
      </vscode-multi-select>
    `);
    const optionIndexes = [2, 0, 1];

    await clickOnElement(el);
    await el.updateComplete;

    for (const index of optionIndexes) {
      const option =
        el.shadowRoot!.querySelectorAll<HTMLLIElement>('.option')[index];
      option.click();
      await el.updateComplete;
    }

    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Charlie', 'Alpha', 'Bravo']);
  });

  it('should not display anything when nothing is selected', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql([]);
    expect(el.shadowRoot?.querySelector('.face-values')?.textContent?.trim()).to
      .be.empty;
  });

  it('should display the label of every selected option in combobox mode', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select combobox>
        <vscode-option selected>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Lorem', 'Ipsum']);
  });

  it('should not collapse the labels when they fit into the face', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option selected>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    const faceValues = el.shadowRoot!.querySelector('.face-values');

    expect(faceValues?.hasAttribute('title')).to.be.false;
  });

  it('should collapse the labels which do not fit into the face', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select style="width: 140px">
        <vscode-option selected>Alpha</vscode-option>
        <vscode-option selected>Bravo</vscode-option>
        <vscode-option selected>Charlie</vscode-option>
        <vscode-option selected>Delta</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    const visibleLabels = getVisibleLabels(el);
    const collapsedLabels = getCollapsedLabels(el);
    const moreTag = getMoreTag(el);
    const faceValues = el.shadowRoot!.querySelector('.face-values');

    expect(visibleLabels.length).to.be.greaterThan(0);
    expect(collapsedLabels.length).to.be.greaterThan(0);
    expect(visibleLabels.length + collapsedLabels.length).to.eq(4);
    expect(moreTag?.textContent).to.eq(`+${collapsedLabels.length}`);
    expect(faceValues?.getAttribute('title')).to.eq(
      'Alpha\nBravo\nCharlie\nDelta'
    );
  });

  it('should show a truncated label when the face is too narrow', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select style="width: 160px">
        <vscode-option selected>Lorem ipsum dolor sit amet</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Lorem ipsum dolor sit amet']);
    expect(getCollapsedLabels(el)).to.eql(['Ipsum']);
    expect(getMoreTag(el)?.textContent).to.eq('+1');
    expect(el.shadowRoot!.querySelector('.face-values')?.getAttribute('title'))
      .to.eq(`Lorem ipsum dolor sit amet
Ipsum`);
  });

  it('should show the full label in the tooltip when it is truncated', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select style="width: 240px">
        <vscode-option selected>${LONG_LABEL}</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getCollapsedLabels(el)).to.eql([]);
    expect(getMoreTag(el)).to.be.null;
    expect(
      el.shadowRoot!.querySelector('.face-values')?.getAttribute('title')
    ).to.eq(LONG_LABEL);
  });

  it('should show the collapsed labels when the face grows', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select style="width: 140px">
        <vscode-option selected>Alpha</vscode-option>
        <vscode-option selected>Bravo</vscode-option>
        <vscode-option selected>Charlie</vscode-option>
        <vscode-option selected>Delta</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(el);

    expect(getCollapsedLabels(el).length).to.be.greaterThan(0);

    el.style.width = '320px';

    for (let i = 0; i < 2; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['Alpha', 'Bravo', 'Charlie', 'Delta']);
  });

  it('should keep the height of the face when the labels are displayed', async () => {
    const empty = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    const selected = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option selected>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
      </vscode-multi-select>
    `);
    await waitForSelectFace(selected);

    expect(selected.getBoundingClientRect().height).to.eq(
      empty.getBoundingClientRect().height
    );
  });

  it('selectedIndexes should be set', async () => {
    const el = (await fixture(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>
    `)) as VscodeMultiSelect;

    el.selectedIndexes = [0, 1];

    expect(el.selectedIndexes).to.eql([0, 1]);
  });

  it('values should be set', async () => {
    const el = (await fixture(html`
      <vscode-multi-select>
        <vscode-option value="1">One</vscode-option>
        <vscode-option value="2">Two</vscode-option>
        <vscode-option value="3">Three</vscode-option>
      </vscode-multi-select>
    `)) as VscodeMultiSelect;

    el.value = ['2', '3'];

    const selectFace =
      el.shadowRoot?.querySelector<HTMLDivElement>('.select-face');
    selectFace!.click();

    await el.updateComplete;

    const checkboxes = el.shadowRoot?.querySelectorAll('li .checkbox-icon');

    expect(el.value).to.eql(['2', '3']);
    expect(el.selectedIndexes).to.eql([1, 2]);
    expect(checkboxes?.item(0).classList.contains('checked')).to.eq(false);
    expect(checkboxes?.item(1).classList.contains('checked')).to.eq(true);
    expect(checkboxes?.item(2).classList.contains('checked')).to.eq(true);
  });

  it('when an option is clicked the selectedIndex and the value should be set', async () => {
    const el = (await fixture(html`
      <vscode-multi-select>
        <vscode-option value="1">One</vscode-option>
        <vscode-option value="2">Two</vscode-option>
        <vscode-option value="3">Three</vscode-option>
      </vscode-multi-select>
    `)) as VscodeMultiSelect;

    const selectFace =
      el.shadowRoot?.querySelector<HTMLDivElement>('.select-face');
    selectFace!.click();
    await el.updateComplete;

    const firstOption =
      el.shadowRoot?.querySelectorAll<HTMLLIElement>('.option')[0];
    firstOption!.click();
    await el.updateComplete;

    expect(el.value).to.deep.equal(['1']);
    expect(el.selectedIndexes).to.deep.equal([0]);
  });

  it('should apply combobox mode', async () => {
    const el = await fixture(
      html`<vscode-multi-select combobox>
        <vscode-option value="1">One</vscode-option>
        <vscode-option value="2">Two</vscode-option>
        <vscode-option value="3">Three</vscode-option>
      </vscode-multi-select>`
    );

    const comboboxFace = el.shadowRoot?.querySelector('.combobox-face');

    expect(comboboxFace).to.be.ok;
  });

  it('selects all options', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select>
        <vscode-option value="1">One</vscode-option>
        <vscode-option value="2">Two</vscode-option>
        <vscode-option value="3">Three</vscode-option>
      </vscode-multi-select>`
    );

    el.selectAll();
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['One', 'Two', 'Three']);
  });

  it('de-selects all options', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select>
        <vscode-option value="1" selected>One</vscode-option>
        <vscode-option value="2" selected>Two</vscode-option>
        <vscode-option value="3" selected>Three</vscode-option>
      </vscode-multi-select>`
    );
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql(['One', 'Two', 'Three']);

    el.selectNone();
    await waitForSelectFace(el);

    expect(getVisibleLabels(el)).to.eql([]);
    expect(el.shadowRoot?.querySelector('.face-values')?.textContent?.trim()).to
      .be.empty;
  });

  it('should be unfocusable when it is disabled', () => {
    const el = document.createElement('vscode-multi-select');
    el.tabIndex = 2;
    el.disabled = true;

    expect(el.tabIndex).to.eq(-1);
  });

  it('should aria-disabled attribute applied when it is disabled', () => {
    const el = document.createElement('vscode-multi-select');
    el.disabled = true;

    expect(el.getAttribute('aria-disabled')).to.eq('true');
  });

  it('should original tabindex restored when enabled again', () => {
    const el = document.createElement('vscode-multi-select');
    el.tabIndex = 2;
    el.disabled = true;

    expect(el.tabIndex).to.eq(-1);

    el.disabled = false;

    expect(el.tabIndex).to.eq(2);
  });

  it('should selectedIndexes reflect the selected options when value set through property', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select>
        <vscode-option value="A">A</vscode-option>
        <vscode-option value="B">B</vscode-option>
        <vscode-option value="C">C</vscode-option>
      </vscode-multi-select>`
    );

    el.value = ['A', 'B', 'C'];

    expect(el.selectedIndexes).to.eql([0, 1, 2]);
  });

  it('Set the "value" property before adding selectable options', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select></vscode-multi-select>`
    );
    el.value = ['dolor'];
    const op1 = document.createElement('vscode-option');
    const op2 = document.createElement('vscode-option');
    const op3 = document.createElement('vscode-option');
    op1.innerHTML = 'lorem';
    op2.innerHTML = 'ipsum';
    op3.innerHTML = 'dolor';

    el.appendChild(op1);
    el.appendChild(op2);
    el.appendChild(op3);

    await el.updateComplete;

    expect(el.value).to.eql(['dolor']);
  });

  it('open by default', async () => {
    const sl = await fixture(
      html`<vscode-multi-select open>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>`
    );

    expect(sl.shadowRoot?.querySelector('ul.options')).to.be.ok;
  });

  it('shows selected option when opened by default', async () => {
    const sl = await fixture(
      html`<vscode-multi-select open>
        <vscode-option>Lorem</vscode-option>
        <vscode-option selected>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>`
    );

    const op = sl.shadowRoot?.querySelector<HTMLLIElement>(
      'ul.options li:nth-child(2)'
    );

    expect(op).lightDom.to.eq(`
      <span class="checkbox-icon checked"></span>
      <span class="option-label">Ipsum</span>
    `);
    expect(op?.classList.contains('selected')).to.be.true;
  });

  it('changes the description of an option in an existing select', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>
    `);
    const secondOption = el.querySelectorAll<VscodeOption>('vscode-option')[1];

    secondOption.description = 'Test description';
    await el.updateComplete;

    await clickOnElement(el);
    await el.updateComplete;

    await moveMouseOnElement(el.shadowRoot!.querySelectorAll('li')[1]);
    await el.updateComplete;

    const desc = el.shadowRoot!.querySelector<HTMLDivElement>('.description');

    expect(desc).lightDom.to.eq('Test description');
  });

  it('changes the label of an option in an existing select', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>
    `);
    const secondOption = el.querySelectorAll<VscodeOption>('vscode-option')[1];

    secondOption.innerHTML = 'Test label';
    await el.updateComplete;

    await clickOnElement(el);
    await el.updateComplete;

    const li = el.shadowRoot!.querySelectorAll<HTMLLIElement>('li')[1];
    const label = li.querySelector('.option-label');

    expect(label).lightDom.to.eq('Test label');
  });

  it('changes the disabled state of an option in an existing select', async () => {
    const el = await fixture<VscodeMultiSelect>(html`
      <vscode-multi-select>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
        <vscode-option>Dolor</vscode-option>
      </vscode-multi-select>
    `);
    const secondOption = el.querySelectorAll<VscodeOption>('vscode-option')[1];

    secondOption.disabled = true;
    await el.updateComplete;

    await clickOnElement(el);
    await el.updateComplete;

    const li = el.shadowRoot!.querySelectorAll<HTMLLIElement>('li')[1];

    expect(li.classList.contains('disabled')).to.be.true;
  });

  it('checks validity when required property is changed', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select combobox>
        <vscode-option>Lorem</vscode-option>
        <vscode-option>Ipsum</vscode-option>
      </vscode-multi-select>`
    );
    const isValidBefore = el.checkValidity();

    el.setAttribute('required', '');
    await el.updateComplete;

    const isValidAfter = el.checkValidity();

    expect(isValidBefore).to.be.true;
    expect(isValidAfter).to.be.false;
  });

  it('creates and select suggested option', async () => {
    const el = await fixture<VscodeMultiSelect>(
      html`<vscode-multi-select combobox creatable
        ><vscode-option>Lorem</vscode-option></vscode-multi-select
      >`
    );
    const createOptionHandlerSpy = sinon.spy();
    el.addEventListener(
      'vsc-multi-select-create-option',
      createOptionHandlerSpy
    );
    const changeHandlerSpy = sinon.spy();
    el.addEventListener('change', changeHandlerSpy);

    el.focus();
    await el.updateComplete;
    await sendKeys({type: 'asdf'});
    await sendKeys({down: 'ArrowDown'});
    await sendKeys({down: 'Enter'});

    expect(createOptionHandlerSpy.getCalls()[0].args[0].detail.value).to.eq(
      'asdf'
    );
    expect(changeHandlerSpy.called).to.be.true;
    expect(el.value).to.eql(['asdf']);
  });

  it('selects multiple options with keyboard');
  it('selectedIndexes sync with values');
  it(
    'dispatch change event, set form value, manage required state (enter key press)'
  );
});
