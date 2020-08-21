import $ from 'cash-dom';
import Editor from './editor';
import { isElement, isFunction } from 'underscore';
import polyfills from 'utils/polyfills';
import PluginManager from './plugin_manager';

polyfills();
// components
const myCustomComponentTypes = editor => {
  editor.DomComponents.addType('my-header-type', {
    isComponent: el => el.tagName === 'HEADER',
    model: {
      defaults: {
        tagName: 'div',
        components: 'Header test',
        attributes: {
          htitle: 'Insert title here'
        },
        traits: [
          {
            type: 'header-title',
            name: 'htitle',
            label: 'Header'
          },
          'link',
          {
            type: 'select',
            label: 'Size',
            name: 'size',
            options: [
              { id: '0', name: 'Default' },
              { id: '1', name: 'Small' },
              { id: '2', name: 'Medium' },
              { id: '3', name: 'Large' },
              { id: '4', name: 'XL' },
              { id: '5', name: 'XXL' }
            ]
          },
          {
            type: 'select',
            label: 'HTML Tag',
            name: 'html-tag',
            options: [
              { id: '0', name: 'H1' },
              { id: '1', name: 'H2' },
              { id: '2', name: 'H3' },
              { id: '3', name: 'H4' },
              { id: '4', name: 'H5' },
              { id: '5', name: 'H6' },
              { id: '6', name: 'div' },
              { id: '7', name: 'span' },
              { id: '8', name: 'p' }
            ]
          },
          {
            type: 'select',
            label: 'Alignment',
            name: 'alignment',
            options: [
              { id: '0', name: 'left' },
              { id: '1', name: 'center' },
              { id: '2', name: 'right' }
            ]
          }
        ]
      }
    }
  });
};

const plugins = new PluginManager();
const editors = [];
const defaultConfig = {
  // If true renders editor on init
  autorender: 1,

  // Array of plugins to init
  plugins: [myCustomComponentTypes],

  // Custom options for plugins
  pluginsOpts: {}
};

export default {
  $,

  editors,

  plugins,

  // Will be replaced on build
  version: '<# VERSION #>',

  /**
   * Initialize the editor with passed options
   * @param {Object} config Configuration object
   * @param {string|HTMLElement} config.container Selector which indicates where render the editor
   * @param {Boolean} [config.autorender=true] If true, auto-render the content
   * @param {Array} [config.plugins=[]] Array of plugins to execute on start
   * @param {Object} [config.pluginsOpts={}] Custom options for plugins
   * @return {Editor} Editor instance
   * @example
   * var editor = grapesjs.init({
   *   container: '#myeditor',
   *   components: '<article class="hello">Hello world</article>',
   *   style: '.hello{color: red}',
   * })
   */

  init(config = {}) {
    const els = config.container;
    if (!els) throw new Error("'container' is required");
    config = { ...defaultConfig, ...config, grapesjs: this };
    config.el = isElement(els) ? els : document.querySelector(els);
    const editor = new Editor(config).init({
      height: '100%',
      container: '#gjs',
      fromElement: 0,
      showDevices: false,
      showOffsets: 1,
      selectorManager: { componentFirst: true }
    });

    // blocks
    var blockManager = editor.BlockManager;
    blockManager.add('my-block', {
      label:
        '<img height="40px" src="https://image.flaticon.com/icons/svg/32/32286.svg" /> <br /> Test Block',
      //content: '<div class="test-block">Header Test Block</div>',
      content: {
        type: 'my-header-type'
      }
    });

    // Load plugins
    config.plugins.forEach(pluginId => {
      let plugin = plugins.get(pluginId);
      const plgOptions = config.pluginsOpts[pluginId] || {};

      // Try to search in global context
      if (!plugin) {
        const wplg = window[pluginId];
        plugin = wplg && wplg.default ? wplg.default : wplg;
      }

      if (plugin) {
        plugin(editor, plgOptions);
      } else if (isFunction(pluginId)) {
        pluginId(editor, plgOptions);
      } else {
        console.warn(`Plugin ${pluginId} not found`);
      }
    });
    //traits
    editor.TraitManager.addType('header-title', {
      createInput({ trait }) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div class="settings-div">
            <div class="center" >
                <textarea class="form-control" id="exampleFormControlTextarea1" rows="2"></textarea>
            </div>
          </div>
        `;
        return el;
      },
      createLabel({ label }) {
        return `<div>
                    ${label}
                </div>`;
      }
    });

    // Execute `onLoad` on modules once all plugins are initialized.
    // A plugin might have extended/added some custom type so this
    // is a good point to load stuff like components, css rules, etc.
    editor.getModel().loadOnStart();
    config.autorender && editor.render();
    editors.push(editor);

    return editor;
  }
};
