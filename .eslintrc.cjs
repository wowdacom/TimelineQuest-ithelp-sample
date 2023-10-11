/* eslint-env node */ // 指定這個設定檔是運行在 Node.js 環境中

module.exports = {
    root: true, // 指定這個檔案為 ESLint 的根設定檔，ESLint 將不會再往上層目錄尋找其他的設定檔
    extends: [
        'plugin:vue/vue3-recommended', // 擴展 Vue.js 3 的推薦設定
        'eslint:recommended', // 擴展 ESLint 的推薦設定
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本進行語法解析
    },
};
