# CSP 检查模板

保留原开发目录中的严格 CSP 资源加载思路，并改为站点静态资源路径。

<script setup>
import {withBase} from 'vitepress';
</script>

<a :href="withBase('/examples/csp-check.html')" target="_blank" rel="noopener">在独立页面打开 CSP 检查示例</a>

页面限制脚本和样式来源，验证本地 bundle、Codicon 字体、文本域和表单辅助说明。演示 nonce 是固定占位值；生产 Webview 必须生成随机 nonce。浏览器的检查不能代替真实 VS Code Webview 验证。
