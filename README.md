# Children Audio Library

Web based audio library for children. Made for the Raspberry Pi 7" Touchscreen.

![Photo](./design/photo.jpg)

![Screenshot](./design/screenshot.png)

## Goals

- [x] provide a children friendly touch interface for browsing and listening to music and audio books
- [x] make it work on the Raspberry PI Model 3 B together with the 7" Touchscreen
- [x] make it work on the included Chromium from Raspbian in kiosk mode
- [x] make it startup on boot and prevent escaping (escaping should only be possible with a keyboard)
- [x] make it read directories from a list of library folders (including external storages)
- [x] make it automaticly download cover art from online sources or use existing cover art images
- [ ] make it optionally shutdown system automaticly after given time of inactivity
- [x] make it work completely offline
- [x] make it automaticly (re-)connect to a bluetooth speaker
- [x] provide a CLI to rescan library folder(s) and stop/start/maintain it

## Configuration

Copy `config.example.json` to `config.json` and adjust to your needs.
It is recommended to have access to a last.fm and discogs developers account to download missing cover art.

```javascript
{
  // list of paths to audio libraries
  "library": [
    "~/Music"
  ],

  // port at which the server should run
  "port": 8000,

  // your last fm API Key
  "lastFmApiKey": "secret",

  // your discogs consumer key
  "discogsConsumerKey": "secret",

  // your discogs consumer secret
  "discogsConsumerSecret": "secret",

  // macID of your bluetooth speaker if any
  // set to null if you do not want to use a bluetooth speaker
  "bluetoothSpeaker": "your bluetoothSpeaker ID"
}
```

## Develop

```bash
LIBRARY_PATH=~/Music docker-compose up --build
```

Then in a second terminal do the following to scan the music library

```bash
docker-compose exec app
npm run scan
```

Now open your browser pointing to `http://localhost:8000`.

## Production

Do the configuration from above and then run:

```bash
npm run scan
npm start
```

This will scan the library and then start the server.

Now open your browser pointing to `http://localhost:8000`.

To rescan the media library run:

```bash
npm run scan
```

It is recommended to add the `npm run scan` to a cron job or trigger it manually once you've added/changed the media library.

## On the Raspberry Pi

You must have rasbian installed on your Raspberry Pi.

Do the configuration from above and then run:

```bash
./raspi/setup.sh
sudo reboot
```

This will install all dependencies and make the audio library start on boot in kiosk mode.
