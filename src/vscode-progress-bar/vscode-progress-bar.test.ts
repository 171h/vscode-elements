/* eslint-disable @typescript-eslint/no-unused-expressions */
import {VscodeProgressBar} from './index.js';
import {expect, fixture, html} from '../includes/testing.js';
import sinon from 'sinon';

describe('vscode-progress-bar', () => {
  it('is defined', () => {
    const el = document.createElement('vscode-progress-bar');
    expect(el).to.instanceOf(VscodeProgressBar);
  });

  it('does not enter long-running before threshold in indeterminate mode', async () => {
    const clock = sinon.useFakeTimers();
    try {
      const el = (await fixture(html`
        <vscode-progress-bar longRunningThreshold="1000"></vscode-progress-bar>
      `)) as VscodeProgressBar;

      await el.updateComplete;
      // 达到阈值之前
      await clock.tickAsync(999);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('infinite-long-running')).to.be
        .false;
    } finally {
      clock.restore();
    }
  });

  it('enters long-running after threshold in indeterminate mode', async () => {
    const clock = sinon.useFakeTimers();
    try {
      const el = (await fixture(html`
        <vscode-progress-bar
          long-running-threshold="1000"
        ></vscode-progress-bar>
      `)) as VscodeProgressBar;

      await el.updateComplete;
      // 达到阈值
      await clock.tickAsync(1000);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('infinite-long-running')).to.be.true;
    } finally {
      clock.restore();
    }
  });

  it('does not schedule long-running when determinate', async () => {
    const clock = sinon.useFakeTimers();
    try {
      const el = (await fixture(html`
        <vscode-progress-bar
          value="10"
          max="100"
          longRunningThreshold="10"
        ></vscode-progress-bar>
      `)) as VscodeProgressBar;

      await el.updateComplete;
      await clock.tickAsync(100);
      await el.updateComplete;

      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('infinite-long-running')).to.be
        .false;
    } finally {
      clock.restore();
    }
  });

  it('clears timer on disconnect and does not enter long-running after removal', async () => {
    const clock = sinon.useFakeTimers();
    try {
      const el = (await fixture(html`
        <vscode-progress-bar longRunningThreshold="50"></vscode-progress-bar>
      `)) as VscodeProgressBar;

      await el.updateComplete;

      // 达到阈值之前移除
      el.remove();
      await clock.tickAsync(100);

      // 重新挂载检查：已移除后不应切换类名
      const container = el.shadowRoot?.querySelector('.container');
      expect(container?.classList.contains('infinite-long-running')).to.be
        .false;
    } finally {
      clock.restore();
    }
  });
});
