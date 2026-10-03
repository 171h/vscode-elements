import {expect, fixture, html} from '../includes/testing.js';
import './index.js';
import '../vscode-tabs/index.js';

describe('fieldset 主题', () => {
  it('为原生 fieldset 和标题应用主题并保留表单语义', async () => {
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
      'rgba(0, 0, 0, 0)'
    );
    expect(getComputedStyle(legend).borderTopWidth).to.equal('0px');
    expect(getComputedStyle(legend).color).to.equal('rgb(200, 210, 220)');
    fieldset.querySelector('input')!.focus();
    expect(getComputedStyle(fieldset).outlineStyle).to.equal('none');
    expect(getComputedStyle(fieldset).borderTopColor).to.equal(
      'rgb(255, 255, 0)'
    );
    expect(new FormData(form).get('value')).to.equal('kept');
    fieldset.disabled = true;
    expect(new FormData(form).has('value')).to.equal(false);
  });

  it('暗色主题下标题背景透明且保持可读', async () => {
    const el = await fixture<HTMLElement>(
      html` <vscode-fieldset
        style="--vscode-sideBar-background: #181818; --vscode-sideBarSectionHeader-foreground: #cccccc"
      >
        <fieldset>
          <legend>Dark view</legend>
          <input />
        </fieldset>
      </vscode-fieldset>`
    );
    const legend = el.querySelector('legend')!;
    expect(getComputedStyle(legend).backgroundColor).to.equal(
      'rgba(0, 0, 0, 0)'
    );
    expect(getComputedStyle(legend).color).to.equal('rgb(204, 204, 204)');
  });

  it('响应实时主题变化并保留调用方的覆盖样式', async () => {
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

  it('仅为直属侧栏 fieldset 应用主题，不影响嵌套表单组', async () => {
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

  it('在所属 shadow root 中安装标题样式', async () => {
    const host = await fixture<HTMLDivElement>(
      html`<div style="--vscode-sideBar-background: rgb(20, 30, 40)"></div>`
    );
    const root = host.attachShadow({mode: 'open'});
    root.innerHTML =
      '<vscode-fieldset><fieldset><legend>Shadow view</legend></fieldset></vscode-fieldset>';
    await Promise.resolve();
    const fieldset = root.querySelector('fieldset')!;
    const legend = root.querySelector('legend')!;
    expect(getComputedStyle(fieldset).backgroundColor).to.equal(
      'rgb(20, 30, 40)'
    );
    expect(getComputedStyle(legend).backgroundColor).to.equal(
      'rgba(0, 0, 0, 0)'
    );
    expect(getComputedStyle(legend).fontWeight).to.equal('700');
    expect(root.querySelectorAll('[data-vsc-fieldset-styles]')).to.have.length(
      1
    );
    root.append(document.createElement('vscode-fieldset'));
    expect(root.querySelectorAll('[data-vsc-fieldset-styles]')).to.have.length(
      1
    );
  });
});
