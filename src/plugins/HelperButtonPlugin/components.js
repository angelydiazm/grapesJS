import { layoutWrapper, plusWrapper } from './vars';
import $ from 'jquery';

export default (editor, opt = {}) => {
  let domComponents = editor.DomComponents;

  const defaultType = domComponents.getType('default');
  const defaultModel = defaultType.model;
  const defaultView = defaultType.view;

  const updateAll = model => {
    model.set({ editable: false, hoverable: false });
    model.get('components').each(model => updateAll(model));
  };

  const addLayoutElements = (model, element, content) => {
    editor.getComponents().add(content, { at: model.index() });
    $(element)
      .find('.helper-wrapper')
      .replaceWith(plusWrapper);
  };

  addComponent(
    'helper-layout',
    defaultView.extend({
      onRender() {
        const { $el } = this;
        if (!$el[0].innerHTML) $el.append(plusWrapper);
      },
      events: {
        'click .add': function(event) {
          event.stopPropagation();
          $(this.el)
            .find('.plus-wrapper')
            .replaceWith(layoutWrapper);
        },
        'click .add1': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div></div></div>`
          );
        },
        'click .add2': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div><div class="col"></div></div></div>`
          );
        },
        'click .add3': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div><div class="col"></div><div class="col"></div></div></div>`
          );
        },
        'click .add4': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div></div></div>`
          );
        },
        'click .add5': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div></div></div>`
          );
        },
        'click .add6': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div><div class="col"></div></div></div>`
          );
        },
        'click .add37': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-4"></div><div class="col col-8"></div></div></div>`
          );
        },
        'click .add73': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-8"></div><div class="col col-4"></div></div></div>`
          );
        },
        'click .add112': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-3"></div><div class="col col-3"></div><div class="col col-6"></div></div></div>`
          );
        },
        'click .add121': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-3"></div><div class="col col-6"></div><div class="col col-3"></div></div></div>`
          );
        },
        'click .add211': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-6"></div><div class="col col-3"></div><div class="col col-3"></div></div></div>`
          );
        },
        'click .add141': function(event) {
          event.stopPropagation();
          addLayoutElements(
            this.model,
            this.el,
            `<div class="container"><div class="row"><div class="col col-2"></div><div class="col col-8"></div><div class="col col-2"></div></div></div>`
          );
        },
        'click .close': function(event) {
          event.stopPropagation();
          $(this.el)
            .find('.helper-wrapper')
            .replaceWith(plusWrapper);
        }
      }
    }),
    defaultModel.extend({
      toHTML() {
        return '';
      }
    }),
    function(el) {
      return false;
    },
    {
      hoverable: false,
      editable: false,
      droppable: false,
      draggable: false
      // removable: false
    }
  );

  // Add generic component
  function addComponent(name, view, model, filter, properties) {
    domComponents.addType(name, {
      model: model.extend(
        {
          defaults: Object.assign(
            {},
            model.prototype.defaults,
            typeof properties == 'undefined' ? {} : properties
          )
        },
        {
          isComponent: function(el) {
            if (filter(el)) return { type: name };
          }
        }
      ),
      view: view
    });
  }

  editor.on('component:add', model => {
    const parent = model.parent();
    if (parent.attributes.type === 'helper-layout') {
    }
  });
};
