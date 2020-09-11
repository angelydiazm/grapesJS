import openImport from './openImport';
import { cmdImport, cmdClear } from './../consts';

export default (editor, config) => {
  const commands = editor.Commands;
  const txtConfirm = config.textCleanCanvas;

  commands.add(cmdImport, openImport(editor, config));
  commands.add(
    cmdClear,
    e => confirm(txtConfirm) && e.runCommand('core:canvas-clear')
  );

  commands.add('set-device-xs', {
    run: function(editor) {
      editor.setDevice('Extra Small');
    }
  });
  commands.add('set-device-sm', {
    run: function(editor) {
      editor.setDevice('Small');
    }
  });
  commands.add('set-device-md', {
    run: function(editor) {
      editor.setDevice('Medium');
    }
  });
  commands.add('set-device-lg', {
    run: function(editor) {
      editor.setDevice('Large');
    }
  });
  commands.add('set-device-xl', {
    run: function(editor) {
      editor.setDevice('Extra Large');
    }
  });

  editor.on('run:preview', () => {
    editor.DomComponents.getWrapper().onAll(comp => {
      if (comp.attributes.type === 'column') {
        const emptyArray = comp
          .getEl()
          .getElementsByClassName('column-empty-view');
        for (let i = 0; i < emptyArray.length; i++) {
          emptyArray[i].style.visibility = 'hidden';
        }
      }
      if (comp.attributes.type === 'helper-layout') {
        comp.getEl().style.display = 'none';
      }
    });
  });

  editor.on('stop:preview', () => {
    editor.DomComponents.getWrapper().onAll(comp => {
      if (comp.attributes.type === 'column') {
        const emptyArray = comp
          .getEl()
          .getElementsByClassName('column-empty-view');
        for (let i = 0; i < emptyArray.length; i++) {
          emptyArray[i].style.visibility = 'visible';
        }
      }
      if (comp.attributes.type === 'helper-layout') {
        comp.getEl().style.display = 'block';
      }
    });
  });
};
