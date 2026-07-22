# Eyesner Lightning Storm V2

A Remotion-powered Twitch package with deterministic procedural branching lightning, electric camera frames, storm particles, synchronized flashes, animated alerts, and a lightning tear stinger.

## Codespaces

```bash
npm install
npm run studio
```

## Build OBS package

```bash
npm run build
```

## Windows installer package

The release ZIP includes a Windows installer that creates a new OBS Studio scene collection named **Eyesner Lightning Storm V2** without overwriting existing profiles or scene collections.

### Install on Windows

1. Extract the ZIP to a normal folder on your PC.
2. Close OBS Studio if it is running.
3. Run `Install-Eyesner.bat`.
4. Wait for the installer to copy the package into your **Videos\Eyesner Lightning Storm V2** folder and create the OBS scene collection automatically.
5. Open OBS Studio and switch to the **Eyesner Lightning Storm V2** scene collection.

### Installed scenes

- Starting Soon
- Intermission
- Be Right Back
- Stream Ending
- Gameplay Overlay
- Follower Alert
- Subscriber Alert

### Installer behavior

- Detects the OBS Studio configuration folder automatically.
- Prompts you to close OBS Studio before continuing if OBS is running.
- Preserves existing OBS profiles and scene collections.
- Stops instead of overwriting an existing `Eyesner Lightning Storm V2` scene collection.
- Copies `LightningStinger.webm` into the installed package for transition setup.
