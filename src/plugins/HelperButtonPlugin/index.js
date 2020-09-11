import grapesjs from 'grapesjs';
import loadComponents from './components';

export default grapesjs.plugins.add(
  'helper-button-plugin',
  (editor, options) => {
    loadComponents(editor, options);
  }
);
