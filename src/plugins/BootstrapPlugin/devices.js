export default (editor, config = {}) => {
  const c = config;
  const deviceManager = editor.DeviceManager;
  if (c.gridDevices) {
    deviceManager.add('Extra Small', '575px');
    deviceManager.add('Small', '767px');
    deviceManager.add('Medium', '991px');
    deviceManager.add('Large', '1199px');
    deviceManager.add('Extra Large');
  }
};
