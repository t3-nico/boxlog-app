import { addons } from '@storybook/manager-api';

addons.setConfig({
  // position: fixed要素がtransform: scaleで壊れる問題を回避するため
  // zoomツールバーを非表示にする
  // https://github.com/storybookjs/storybook/issues/23586
  toolbar: {
    zoom: { hidden: true },
  },
});
