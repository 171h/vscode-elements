import {expect, fixture, html} from '@open-wc/testing';
import './index.js';
import '../vscode-tabs/index.js';

describe('fieldset theme', () => {
  it('themes native fieldsets and legends without changing native form semantics', async () => {
    const form = await fixture<HTMLFormElement>(
      html` <form
        style="--vscode-sideBar-background: rgb(10, 20, 30); --vscode-sideBar-foreground: rgb(220, 230, 240); --vscode-sideBarSectionHeader-background: rgb(40, 50, 60); --vscode-sideBarSectionHeader-foreground: rgb(200, 210, 220); --vscode-contrastBorder: rgb(255, 255, 0); --vscode-focusBorder: rgb(0, 255, 0)"
      >
        <vscode-fieldset
          ><fieldset>
            <legend>Settings</legend>
            <label>Value <input name="value" value="kept" /></label></fieldset
        ></vscode-fieldset>
      </form>`
    );
    const fieldset = form.querySelector('fieldset')!;
    const legend = fieldset.querySelector('legend')!;
    expect(getComputedStyle(fieldset).backgroundColor).to.equal(
      'rgb(10, 20, 30)'
    );
    expect(getComputedStyle(fieldset).color).to.equal('rgb(220, 230, 240)');
    expect(getComputedStyle(fieldset).borderTopColor).to.equal(
      'rgb(255, 255, 0)'
    );
    expect(getComputedStyle(legend).backgroundColor).to.equal(
      'rgb(10, 20, 30)'
    );
    expect(getComputedStyle(legend).borderTopWidth).to.equal('0px');
    expect(getComputedStyle(legend).color).to.equal('rgb(200, 210, 220)');
    fieldset.querySelector('input')!.focus();
    expect(getComputedStyle(fieldset).outlineColor).to.equal('rgb(0, 255, 0)');
    expect(new FormData(form).get('value')).to.equal('kept');
    fieldset.disabled = true;
    expect(new FormData(form).has('value')).to.equal(false);
  });

  it('responds to live theme changes and preserves caller overrides', async () => {
    const el = await fixture<HTMLElement>(
      html` <vscode-fieldset
        style="--vscode-sideBar-background: white; --vscode-sideBar-foreground: black; --vscode-disabledForeground: gray"
      >
        <fieldset>
          <legend>Title</legend>
          <input />
        </fieldset>
      </vscode-fieldset>`
    );
    const fieldset = el.querySelector('fieldset')!;
    expect(getComputedStyle(fieldset).backgroundColor).to.equal(
      'rgb(255, 255, 255)'
    );
    el.style.setProperty('--vscode-sideBar-background', 'black');
    expect(getComputedStyle(fieldset).backgroundColor).to.equal('rgb(0, 0, 0)');
    fieldset.disabled = true;
    expect(getComputedStyle(el.querySelector('legend')!).color).to.equal(
      'rgb(128, 128, 128)'
    );
    fieldset.style.borderColor = 'red';
    expect(getComputedStyle(fieldset).borderTopColor).to.equal(
      'rgb(255, 0, 0)'
    );
  });

  it('themes direct sidebar fieldsets but leaves nested form groups alone', async () => {
    const tabs = await fixture<HTMLElement>(
      html` <vscode-tabs style="--vscode-sideBar-background: rgb(10, 20, 30)">
        <vscode-tab-header>Native</vscode-tab-header>
        <vscode-tab-panel
          ><fieldset>
            <legend>View</legend>
            <fieldset><legend>Nested form group</legend></fieldset>
          </fieldset></vscode-tab-panel
        >
      </vscode-tabs>`
    );
    const [view, nested] = tabs.querySelectorAll('fieldset');
    expect(getComputedStyle(view).backgroundColor).to.equal('rgb(10, 20, 30)');
    expect(getComputedStyle(nested).backgroundColor).to.equal(
      'rgba(0, 0, 0, 0)'
    );
  });

  it('installs legend styling inside a containing shadow root', async () => {
    const host = await fixture<HTMLDivElement>(
      html`<div style="--vscode-sideBar-background: rgb(20, 30, 40)"></div>`
    );
    const root = host.attachShadow({mode: 'open'});
    root.innerHTML =
      '<vscode-fieldset><fieldset><legend>Shadow view</legend></fieldset></vscode-fieldset>';
    await Promise.resolve();
    expect(
      getComputedStyle(root.querySelector('legend')!).backgroundColor
    ).to.equal('rgb(20, 30, 40)');
    expect(root.querySelectorAll('[data-vsc-fieldset-styles]')).to.have.length(
      1
    );
    root.append(document.createElement('vscode-fieldset'));
    expect(root.querySelectorAll('[data-vsc-fieldset-styles]')).to.have.length(
      1
    );
  });
});
