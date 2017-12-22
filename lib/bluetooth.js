const path = require('path');
const cp = require('child_process');
const pairScript = path.join(__dirname, '../raspi/autopair.sh');

function connectToDevice(deviceId) {
  return new Promise((resolve, reject) => {
    const p = cp.exec(pairScript, {
      env: {
        BLUETOOTH_SPEAKER: deviceId
      }
    }, (err, stdout, stderr) => {
      if (err || stderr) {
        return reject(err || stderr);
      }

      return resolve();
    });
  });
}

module.exports = function (config) {
  if (!config.bluetoothSpeaker) {
    return;
  }

  // periodically try to connect to the bluetooth speaker
  const interval = setInterval(() => {
    connectToDevice(config.bluetoothSpeaker)
    .catch(err => {
      console.error(err);
    });
  }, 5000);
};
