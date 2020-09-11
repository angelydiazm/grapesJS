import $ from 'cash-dom';
import Editor from './editor';
import { isElement, isFunction } from 'underscore';
import polyfills from 'utils/polyfills';
import PluginManager from './plugin_manager';
import _ from 'underscore';
polyfills();
// components
const myCustomComponentTypes = editor => {
  const textType = editor.DomComponents.getType('text');
  const textModel = textType.model;
  const textView = textType.view;
  const defaultType = editor.DomComponents.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;
  const spans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  editor.DomComponents.addType('my-header-type', {
    model: textModel.extend(
      {
        init() {
          this.listenTo(
            this,
            'change:attributes:content',
            this.handleContentChange
          );
        },
        updated(property, value, prevValue) {},
        handleContentChange() {
          console.log('Prop changed');
          console.log('Content changed to: ', this.getAttributes()['content']);
          //this.defaults.components = model => {
          //                     return `${model.getAttributes()['content']}`
          //                  }
          console.log(
            'los componentes',
            editor
              .getSelected()
              .set({ components: this.getAttributes()['content'] })
          );
          //console.log('render', editor.getSelected().set({view: this.render}))
          //console.log('renderizo')
        },
        defaults: Object.assign({}, textModel.prototype.defaults, {
          'custom-name': 'Header',
          tagName: 'h1',
          attributes: {
            content: 'Header Test Content'
          },
          components: model => {
            return `${model.getAttributes()['content']}`;
          },
          editable: true,
          traits: [
            {
              type: 'header-title',
              changeProp: true,
              name: 'content'
            },
            {
              type: 'select',
              options: [
                { value: 'h1', name: 'One (largest)' },
                { value: 'h2', name: 'Two' },
                { value: 'h3', name: 'Three' },
                { value: 'h4', name: 'Four' },
                { value: 'h5', name: 'Five' },
                { value: 'h6', name: 'Six (smallest)' }
              ],
              label: 'Size',
              name: 'tagName',
              changeProp: 1
            }
          ].concat(textModel.prototype.defaults.traits)
        })
      },
      {
        isComponent(el) {
          if (el && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
            //return {type: 'header'};
            console.log('hola', { type: 'my-header-type' });
            return { type: 'my-header-type' };
          }
        }
      }
    ),

    view: textView.extend({
      init() {
        //this.listenTo(this.model, 'change:attributes', this.render)
        const content = this.model.getAttributes()['content'];
        console.log('content in view: ', content);
        this.model.addAttributes({ content: content });
        console.log('local hook view init');
      },
      onRender() {
        console.log('local hook on render');
        this.render;
      }
    })
  });
  editor.DomComponents.addType('container', {
    model: defaultModel.extend(
      {
        defaults: Object.assign({}, defaultModel.prototype.defaults, {
          'custom-name': 'Container',
          tagName: 'div',
          droppable: true,
          style: {
            padding: '20px'
          },
          traits: [
            {
              type: 'class_select',
              options: [
                { value: 'container', name: 'Fixed' },
                { value: 'container-fluid', name: 'Fluid' }
              ],
              label: 'Width'
            }
          ].concat(defaultModel.prototype.defaults.traits)
        })
      },
      {
        isComponent(el) {
          if (
            el &&
            el.classList &&
            (el.classList.contains('container') ||
              el.classList.contains('container-fluid'))
          ) {
            return { type: 'container' };
          }
        }
      }
    ),
    view: defaultView
  });
  editor.DomComponents.addType('row', {
    model: defaultModel.extend(
      {
        defaults: Object.assign({}, defaultModel.prototype.defaults, {
          'custom-name': 'Row',
          tagName: 'div',
          draggable: '.container, .container-fluid',
          droppable: true,
          style: {
            padding: '20px'
          },
          traits: [
            {
              type: 'class_select',
              options: [
                { value: '', name: 'Yes' },
                { value: 'no-gutters', name: 'No' }
              ],
              label: 'Gutters?'
            }
          ].concat(defaultModel.prototype.defaults.traits)
        })
      },
      {
        isComponent(el) {
          if (el && el.classList && el.classList.contains('row')) {
            return { type: 'row' };
          }
        }
      }
    ),
    view: defaultView
  });
  editor.DomComponents.addType('column', {
    extend: 'link',
    model: defaultModel.extend(
      {
        defaults: Object.assign({}, defaultModel.prototype.defaults, {
          'custom-name': 'Column',
          draggable: '.row',
          droppable: true,
          style: {
            padding: '20px',
            'text-decoration': 'none'
          },
          resizable: {
            updateTarget: (el, rect, opt) => {
              const selected = editor.getSelected();
              if (!selected) {
                return;
              }

              //compute the current screen size (bootstrap semantic)
              const docWidth = el.getRootNode().body.offsetWidth;
              let currentSize = '';
              if (docWidth >= 1200) {
                currentSize = 'xl';
              } else if (docWidth >= 992) {
                currentSize = 'lg';
              } else if (docWidth >= 768) {
                currentSize = 'md';
              } else if (docWidth >= 576) {
                currentSize = 'sm';
              }

              //compute the threshold when add on remove 1 col span to the element
              const row = el.parentElement;
              const oneColWidth = row.offsetWidth / 12;
              //the threshold is half one column width
              const threshold = oneColWidth * 0.5;

              //check if we are growing or shrinking the column
              const grow = rect.w > el.offsetWidth + threshold;
              const shrink = rect.w < el.offsetWidth - threshold;
              if (grow || shrink) {
                let testRegexp = new RegExp(
                  '^col-' + currentSize + '-\\d{1,2}$'
                );
                if (!currentSize) {
                  testRegexp = new RegExp('^col-\\d{1,2}$');
                }
                let found = false;
                let sizesSpans = {};
                let oldSpan = 0;
                let oldClass = null;
                for (let cl of el.classList) {
                  if (cl.indexOf('col-') === 0) {
                    let [c, size, span] = cl.split('-');
                    if (!span) {
                      span = size;
                      size = '';
                    }
                    sizesSpans[size] = span;
                    if (size === currentSize) {
                      //found the col-XX-99 class
                      oldClass = cl;
                      oldSpan = span;
                      found = true;
                    }
                  }
                }

                if (!found) {
                  const sizeOrder = ['', 'xs', 'sm', 'md', 'lg', 'xl'];
                  for (let s of sizeOrder) {
                    if (sizesSpans[s]) {
                      oldSpan = sizesSpans[s];
                      found = true;
                    }
                    if (s === currentSize) {
                      break;
                    }
                  }
                }

                let newSpan = Number(oldSpan);
                if (grow) {
                  newSpan++;
                } else {
                  newSpan--;
                }
                if (newSpan > 12) {
                  newSpan = 12;
                }
                if (newSpan < 1) {
                  newSpan = 1;
                }

                let newClass = 'col-' + currentSize + '-' + newSpan;
                if (!currentSize) {
                  newClass = 'col-' + newSpan;
                }
                //update the class
                selected.addClass(newClass);
                if (oldClass && oldClass !== newClass) {
                  selected.removeClass(oldClass);
                }
                //notify the corresponding trait to update its value accordingly
                selected
                  .getTrait((currentSize || 'xs') + '_width')
                  .view.postUpdate();
              }
            },
            tl: 0,
            tc: 0,
            tr: 0,
            cl: 1,
            cr: 1,
            bl: 0,
            bc: 0,
            br: 0
          },
          traits: [
            {
              id: 'xs_width',
              type: 'class_select',
              options: [
                { value: 'col', name: 'Equal' },
                { value: 'col-auto', name: 'Variable' },
                ...spans.map(function(i) {
                  return {
                    value: 'col-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'XS Width'
            },
            {
              id: 'sm_width',
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                { value: 'col-sm', name: 'Equal' },
                { value: 'col-sm-auto', name: 'Variable' },
                ...spans.map(function(i) {
                  return {
                    value: 'col-sm-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'SM Width'
            },
            {
              id: 'md_width',
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                { value: 'col-md', name: 'Equal' },
                { value: 'col-md-auto', name: 'Variable' },
                ...spans.map(function(i) {
                  return {
                    value: 'col-md-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'MD Width'
            },
            {
              id: 'lg_width',
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                { value: 'col-lg', name: 'Equal' },
                { value: 'col-lg-auto', name: 'Variable' },
                ...spans.map(function(i) {
                  return {
                    value: 'col-lg-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'LG Width'
            },
            {
              id: 'xl_width',
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                { value: 'col-xl', name: 'Equal' },
                { value: 'col-xl-auto', name: 'Variable' },
                ...spans.map(function(i) {
                  return {
                    value: 'col-xl-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'XL Width'
            },
            {
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                ...spans.map(function(i) {
                  return {
                    value: 'offset-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'XS Offset'
            },
            {
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                ...spans.map(function(i) {
                  return {
                    value: 'offset-sm-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'SM Offset'
            },
            {
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                ...spans.map(function(i) {
                  return {
                    value: 'offset-md-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'MD Offset'
            },
            {
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                ...spans.map(function(i) {
                  return {
                    value: 'offset-lg-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'LG Offset'
            },
            {
              type: 'class_select',
              options: [
                { value: '', name: 'None' },
                ...spans.map(function(i) {
                  return {
                    value: 'offset-xl-' + i,
                    name: i + '/12'
                  };
                })
              ],
              label: 'XL Offset'
            }
          ].concat(defaultModel.prototype.defaults.traits)
        })
      },
      {
        isComponent(el) {
          let match = false;
          if (el && el.classList) {
            el.classList.forEach(function(klass) {
              if (klass == 'col' || klass.match(/^col-/)) {
                match = true;
              }
            });
          }
          if (match) return { type: 'column' };
        }
      }
    ),
    view: defaultView.extend({
      onRender() {
        const { $el } = this;
        if (!$el[0].innerHTML) {
          $el.append(
            `<div class="column-empty-view"><i class="fa fa-plus column-first-add" aria-hidden="true"></i></div>`
          );
          $el.find('.column-first-add').on('click', event => {
            event.stopPropagation();
            var openBlocksBtn = editor.Panels.getButton('views', 'open-blocks');
            openBlocksBtn && openBlocksBtn.set('active', 1);
          });
        }
      }
    })
  });
  editor.on('component:add', model => {
    const parent = model.parent();
    if (parent.attributes.type === 'column') {
      parent.view.$el.find('.column-empty-view').remove();
    }
  });
  /*editor.DomComponents.addType('my-header-type', {
    //isComponent: el => el.tagName === 'HEADER',
    isComponent(el) {
      if(el && ['H1','H2','H3','H4','H5','H6'].includes(el.tagName)) {
          return {type: 'header'};
      }
    },
    model: {
      defaults: {
        tagName: 'h1',
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
            name: 'tagName',
            changeProp: 1,
            options: [
              { id: 'h1', name: 'One (largest)' },
              { id: 'h2', name: 'Two' },
              { id: 'h3', name: 'Three' },
              { id: 'h4', name: 'Four' },
              { id: 'h5', name: 'Five' },
              { id: 'h6', name: 'Six (smallest)' }
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
  });*/
};

const plugins = new PluginManager();
const editors = [];
const defaultConfig = {
  // If true renders editor on init
  autorender: 1,

  // Array of plugins to init
  plugins: [
    myCustomComponentTypes,
    // 'grapesjs-lory-slider',
    //pluginBootstrap4
    blocksBootstrap4
  ],

  // Custom options for plugins
  pluginsOpts: {
    // "grapesjs-lory-slider": {
    //   sliderBlock: {
    //       category: "Extra"
    //   }
    // },
  }
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
      selectorManager: { componentFirst: true },
      blockManager: {
        appendTo: '#blocks'
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
      name: 'content',
      noLabel: true,
      createInput({ trait }) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div class="settings-div label">
            <div class="center" >
              <p class="text">Content</p>
            </div>
          </div>
          <div class="settings-div sd-input">
            <div class="center" >
              <textarea class="form-control" id="exampleFormControlTextarea1" rows="2">Header Test Content</textarea>
            </div>
          </div>
        `;
        return el;
      },
      //createLabel({ label }) {
      //  return `<div>
      //              ${label}
      //          </div>`;
      //},
      onEvent({ elInput, component, event }) {
        //elInput.querySelector(#)
        let content = elInput.querySelector('#exampleFormControlTextarea1')
          .value;
        component.addAttributes({ content: content });
        component.view.attr.content = content;
        console.log(component.view.attr.content);
      }
    });
    editor.TraitManager.addType('class_select', {
      events: {
        change: 'onChange' // trigger parent onChange method on input change
      },
      createInput({ trait }) {
        var md = this.model;
        var opts = md.get('options') || [];
        var input = document.createElement('select');
        var target = this.target;
        var target_view_el = this.target.view.el;
        for (let i = 0; i < opts.length; i++) {
          let name = opts[i].name;
          let value = opts[i].value;
          if (value == '') {
            value = 'GJS_NO_CLASS';
          } // 'GJS_NO_CLASS' represents no class--empty string does not trigger value change
          let option = document.createElement('option');
          option.text = name;
          option.value = value;
          const value_a = value.split(' ');
          //if(target_view_el.classList.contains(value)) {
          if (
            _.intersection(target_view_el.classList, value_a).length ==
            value_a.length
          ) {
            option.setAttribute('selected', 'selected');
          }
          input.append(option);
        }
        return input;
      },
      onUpdate({ elInput, component }) {
        const classes = component.getClasses();
        var opts = this.model.get('options') || [];
        for (let i = 0; i < opts.length; i++) {
          let name = opts[i].name;
          let value = opts[i].value;
          if (value && classes.includes(value)) {
            elInput.value = value;
            return;
          }
        }
        elInput.value = 'GJS_NO_CLASS';
      },

      onEvent({ elInput, component, event }) {
        var classes = this.model.get('options').map(opt => opt.value);
        for (let i = 0; i < classes.length; i++) {
          if (classes[i].length > 0) {
            var classes_i_a = classes[i].split(' ');
            for (let j = 0; j < classes_i_a.length; j++) {
              if (classes_i_a[j].length > 0) {
                component.removeClass(classes_i_a[j]);
              }
            }
          }
        }
        const value = this.model.get('value');
        if (value.length > 0 && value != 'GJS_NO_CLASS') {
          const value_a = value.split(' ');
          for (let i = 0; i < value_a.length; i++) {
            component.addClass(value_a[i]);
          }
        }
        component.em.trigger('component:toggled');
      }
    });

    const textTrait = editor.TraitManager.getType('text');

    editor.TraitManager.addType('content', {
      events: {
        keyup: 'onChange'
      },

      onValueChange: function() {
        var md = this.model;
        var target = md.target;
        target.set('content', md.get('value'));
      },

      getInputEl: function() {
        if (!this.inputEl) {
          this.inputEl = textTrait.prototype.getInputEl.bind(this)();
          this.inputEl.value = this.target.get('content');
        }
        return this.inputEl;
      }
    });

    editor.TraitManager.addType('content', {
      events: {
        keyup: 'onChange'
      },

      onValueChange: function() {
        var md = this.model;
        var target = md.target;
        target.set('content', md.get('value'));
      },

      getInputEl: function() {
        if (!this.inputEl) {
          this.inputEl = textTrait.prototype.getInputEl.bind(this)();
          this.inputEl.value = this.target.get('content');
        }
        return this.inputEl;
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
