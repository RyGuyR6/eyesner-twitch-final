#!/usr/bin/env bash
set -Eeuo pipefail

PACKAGE_NAME="Eyesner-Premium-Twitch-OBS-Package"
BACKUP_DIR=".premium-backup-fixed-$(date +%Y%m%d-%H%M%S)"
RENDER_DIR="dist/renders"
DELIVERY_ROOT="dist/delivery"
PACKAGE_ROOT="$DELIVERY_ROOT/$PACKAGE_NAME"

echo
echo "================================================"
echo " EYESNER PREMIUM TWITCH / OBS PACKAGE BUILDER"
echo "================================================"
echo

# ----------------------------------------------------------
# Requirements
# ----------------------------------------------------------

for command_name in node npm npx ffmpeg ffprobe; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "ERROR: Required command is missing: $command_name"
    exit 1
  fi
done

if ! command -v zip >/dev/null 2>&1; then
  echo "Installing zip..."
  sudo apt-get update
  sudo apt-get install -y zip
fi

# ----------------------------------------------------------
# Backup current project files
# ----------------------------------------------------------

mkdir -p "$BACKUP_DIR/src" "$BACKUP_DIR/scripts"

for file in \
  src/Root.tsx \
  scripts/render-scenes.ts \
  scripts/generate-obs-package.ts \
  package.json
do
  if [[ -f "$file" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
  fi
done

echo "Backup created:"
echo "  $BACKUP_DIR"
echo

# ----------------------------------------------------------
# Set every Remotion composition to 1920x1080 at 60 FPS
# ----------------------------------------------------------

cat > src/Root.tsx <<'ROOT'
import React from 'react';
import {Composition} from 'remotion';
import {MainScene} from './scenes/MainScene';
import {GameplayOverlay} from './scenes/GameplayOverlay';
import {AlertScene} from './scenes/AlertScene';
import {Stinger} from './scenes/Stinger';

const FPS = 60;
const WIDTH = 1920;
const HEIGHT = 1080;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StartingSoon"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'STREAM STARTING',
          subtitle: 'THE STORM IS BUILDING',
        }}
      />

      <Composition
        id="BeRightBack"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'BE RIGHT BACK',
          subtitle: 'STAY CHARGED',
        }}
      />

      <Composition
        id="StreamEnding"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'STREAM OFFLINE',
          subtitle: 'THANKS FOR WATCHING',
        }}
      />

      <Composition
        id="Intermission"
        component={MainScene}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          title: 'INTERMISSION',
          subtitle: 'RECHARGING THE GRID',
        }}
      />

      <Composition
        id="GameplayOverlay"
        component={GameplayOverlay}
        durationInFrames={FPS * 20}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="FollowerAlert"
        component={AlertScene}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          label: 'NEW FOLLOWER',
          username: 'RYGUYR6',
        }}
      />

      <Composition
        id="SubscriberAlert"
        component={AlertScene}
        durationInFrames={FPS * 5}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          label: 'NEW SUBSCRIBER',
          username: 'EYESNER',
        }}
      />

      <Composition
        id="LightningStinger"
        component={Stinger}
        durationInFrames={FPS * 2}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
ROOT

# ----------------------------------------------------------
# Premium rendering script
# ----------------------------------------------------------

cat > scripts/render-scenes.ts <<'RENDER'
import {execFileSync} from 'node:child_process';
import fs from 'fs-extra';
import path from 'node:path';

type RenderJob = {
  composition: string;
  filename: string;
  transparent: boolean;
};

const jobs: RenderJob[] = [
  {
    composition: 'StartingSoon',
    filename: 'StartingSoon.mp4',
    transparent: false,
  },
  {
    composition: 'BeRightBack',
    filename: 'BeRightBack.mp4',
    transparent: false,
  },
  {
    composition: 'Intermission',
    filename: 'Intermission.mp4',
    transparent: false,
  },
  {
    composition: 'StreamEnding',
    filename: 'StreamEnding.mp4',
    transparent: false,
  },
  {
    composition: 'GameplayOverlay',
    filename: 'GameplayOverlay.webm',
    transparent: true,
  },
  {
    composition: 'FollowerAlert',
    filename: 'FollowerAlert.webm',
    transparent: true,
  },
  {
    composition: 'SubscriberAlert',
    filename: 'SubscriberAlert.webm',
    transparent: true,
  },
  {
    composition: 'LightningStinger',
    filename: 'LightningStinger.webm',
    transparent: true,
  },
];

const outputDirectory = path.resolve('dist/renders');
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE;

fs.removeSync(outputDirectory);
fs.ensureDirSync(outputDirectory);

for (const job of jobs) {
  const outputPath = path.join(outputDirectory, job.filename);

  const args = [
    'remotion',
    'render',
    'src/index.ts',
    job.composition,
    outputPath,
    '--overwrite',
    '--image-format=png',
    '--scale=1',
    '--concurrency=50%',
  ];

  if (job.transparent) {
    args.push(
      '--codec=vp9',
      '--pixel-format=yuva420p',
      '--crf=10'
    );
  } else {
    args.push(
      '--codec=h264',
      '--pixel-format=yuv420p',
      '--crf=8'
    );
  }

  if (browserExecutable) {
    args.push(`--browser-executable=${browserExecutable}`);
  }

  console.log('');
  console.log('------------------------------------------------');
  console.log(`Composition: ${job.composition}`);
  console.log(`Output:      ${outputPath}`);
  console.log('Resolution:  1920x1080');
  console.log('Frame rate:  60 FPS');
  console.log(
    `Format:      ${
      job.transparent
        ? 'VP9 WebM with transparency'
        : 'H.264 MP4'
    }`
  );
  console.log('------------------------------------------------');

  execFileSync('npx', args, {
    stdio: 'inherit',
  });
}

console.log('');
console.log('All Remotion renders completed.');
RENDER

# ----------------------------------------------------------
# Replace broken TypeScript package generator with valid code
# ----------------------------------------------------------

cat > scripts/generate-obs-package.ts <<'PACKAGE'
import fs from 'fs-extra';
import path from 'node:path';

const renderDirectory = path.resolve('dist/renders');
const outputDirectory = path.resolve('dist/obs-import');
const mediaDirectory = path.join(outputDirectory, 'media');

if (!fs.existsSync(renderDirectory)) {
  throw new Error(
    'dist/renders does not exist. Run the render script first.'
  );
}

fs.removeSync(outputDirectory);
fs.ensureDirSync(mediaDirectory);
fs.copySync(renderDirectory, mediaDirectory);

const logoSource = path.resolve(
  'public/assets/eyesner-logo.png'
);

if (fs.existsSync(logoSource)) {
  fs.copySync(
    logoSource,
    path.join(outputDirectory, 'eyesner-logo.png')
  );
}

fs.writeFileSync(
  path.join(outputDirectory, 'README.txt'),
  [
    'EYESNER PREMIUM OBS PACKAGE',
    '',
    'Resolution: 1920x1080',
    'Frame rate: 60 FPS',
    '',
    'Use MP4 files for full-screen scenes.',
    'Use WebM files for transparent overlays and alerts.',
    'Use LightningStinger.webm as the OBS stinger transition.',
    '',
  ].join('\n'),
  'utf8'
);

console.log(`OBS package created: ${outputDirectory}`);
PACKAGE

# ----------------------------------------------------------
# Update package.json scripts
# ----------------------------------------------------------

node <<'NODE'
const fs = require('fs');

const packagePath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

pkg.scripts = pkg.scripts || {};
pkg.scripts['render:scenes'] = 'tsx scripts/render-scenes.ts';
pkg.scripts['obs:package'] = 'tsx scripts/generate-obs-package.ts';
pkg.scripts['build:premium'] =
  'npm run typecheck && npm run render:scenes';

fs.writeFileSync(
  packagePath,
  JSON.stringify(pkg, null, 2) + '\n'
);
NODE

# ----------------------------------------------------------
# TypeScript validation
# ----------------------------------------------------------

echo "Running TypeScript validation..."
npm run typecheck

echo
echo "TypeScript validation passed."
echo

# ----------------------------------------------------------
# Render all media
# ----------------------------------------------------------

echo "Starting premium 1080p60 renders..."
echo "This can take a while because every scene now contains twice"
echo "as many frames as the old 30 FPS versions."
echo

npm run render:scenes

# ----------------------------------------------------------
# Check required render outputs
# ----------------------------------------------------------

REQUIRED_FILES=(
  "StartingSoon.mp4"
  "BeRightBack.mp4"
  "Intermission.mp4"
  "StreamEnding.mp4"
  "GameplayOverlay.webm"
  "FollowerAlert.webm"
  "SubscriberAlert.webm"
  "LightningStinger.webm"
)

for filename in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "$RENDER_DIR/$filename" ]]; then
    echo "ERROR: Required render was not created:"
    echo "  $RENDER_DIR/$filename"
    exit 1
  fi
done

# ----------------------------------------------------------
# Build delivery directory
# ----------------------------------------------------------

echo
echo "Building OBS delivery package..."

rm -rf "$DELIVERY_ROOT"

mkdir -p \
  "$PACKAGE_ROOT/Media/Scenes" \
  "$PACKAGE_ROOT/Media/Overlays" \
  "$PACKAGE_ROOT/Media/Alerts" \
  "$PACKAGE_ROOT/Media/Transitions" \
  "$PACKAGE_ROOT/Branding" \
  "$PACKAGE_ROOT/OBS/Scene Collection" \
  "$PACKAGE_ROOT/OBS/Profile" \
  "$PACKAGE_ROOT/Documentation"

cp "$RENDER_DIR/StartingSoon.mp4" \
   "$PACKAGE_ROOT/Media/Scenes/"

cp "$RENDER_DIR/BeRightBack.mp4" \
   "$PACKAGE_ROOT/Media/Scenes/"

cp "$RENDER_DIR/Intermission.mp4" \
   "$PACKAGE_ROOT/Media/Scenes/"

cp "$RENDER_DIR/StreamEnding.mp4" \
   "$PACKAGE_ROOT/Media/Scenes/"

cp "$RENDER_DIR/GameplayOverlay.webm" \
   "$PACKAGE_ROOT/Media/Overlays/"

cp "$RENDER_DIR/FollowerAlert.webm" \
   "$PACKAGE_ROOT/Media/Alerts/"

cp "$RENDER_DIR/SubscriberAlert.webm" \
   "$PACKAGE_ROOT/Media/Alerts/"

cp "$RENDER_DIR/LightningStinger.webm" \
   "$PACKAGE_ROOT/Media/Transitions/"

if [[ -f public/assets/eyesner-logo.png ]]; then
  cp public/assets/eyesner-logo.png \
     "$PACKAGE_ROOT/Branding/eyesner-logo.png"
fi

# ----------------------------------------------------------
# Generate valid OBS scene collection JSON
# ----------------------------------------------------------

PACKAGE_ROOT_ENV="$PACKAGE_ROOT" node <<'NODE'
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = process.env.PACKAGE_ROOT_ENV;

if (!root) {
  throw new Error('PACKAGE_ROOT_ENV was not supplied.');
}

const outputFile = path.join(
  root,
  'OBS',
  'Scene Collection',
  'Eyesner Premium.template.json'
);

const uuid = () => crypto.randomUUID();

const mediaPath = (relativePath) =>
  `__INSTALL_ROOT__\\\\${relativePath}`;

const createMediaSource = ({
  name,
  file,
  loop,
  restart = true,
}) => {
  return {
    prev_ver: 503316482,
    name,
    uuid: uuid(),
    id: 'ffmpeg_source',
    versioned_id: 'ffmpeg_source',
    settings: {
      is_local_file: true,
      local_file: mediaPath(file),
      looping: loop,
      restart_on_activate: restart,
      close_when_inactive: true,
      clear_on_media_end: true,
      hw_decode: true,
    },
    mixers: 0,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    'push-to-mute': false,
    'push-to-mute-delay': 0,
    'push-to-talk': false,
    'push-to-talk-delay': 0,
    hotkeys: {},
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    private_settings: {},
  };
};

const createScene = (sceneName, source) => {
  return {
    prev_ver: 503316482,
    name: sceneName,
    uuid: uuid(),
    id: 'scene',
    versioned_id: 'scene',
    settings: {
      items: [
        {
          name: source.name,
          source_uuid: source.uuid,
          visible: true,
          locked: false,
          rot: 0,
          pos: {
            x: 0,
            y: 0,
          },
          scale: {
            x: 1,
            y: 1,
          },
          align: 5,
          bounds_type: 2,
          bounds_align: 0,
          bounds: {
            x: 1920,
            y: 1080,
          },
          crop_left: 0,
          crop_top: 0,
          crop_right: 0,
          crop_bottom: 0,
          id: 1,
          group_item_backup: false,
          scale_filter: 'lanczos',
          blend_method: 'default',
          blend_type: 'normal',
          show_transition: {
            duration: 0,
          },
          hide_transition: {
            duration: 0,
          },
          private_settings: {},
        },
      ],
      id_counter: 2,
      custom_size: false,
    },
    mixers: 0,
    sync: 0,
    flags: 0,
    volume: 1,
    balance: 0.5,
    enabled: true,
    muted: false,
    'push-to-mute': false,
    'push-to-mute-delay': 0,
    'push-to-talk': false,
    'push-to-talk-delay': 0,
    hotkeys: {},
    deinterlace_mode: 0,
    deinterlace_field_order: 0,
    monitoring_type: 0,
    private_settings: {},
  };
};

const definitions = [
  {
    sceneName: 'Starting Soon',
    sourceName: 'Starting Soon Animation',
    file: 'Media\\\\Scenes\\\\StartingSoon.mp4',
    loop: true,
  },
  {
    sceneName: 'Be Right Back',
    sourceName: 'Be Right Back Animation',
    file: 'Media\\\\Scenes\\\\BeRightBack.mp4',
    loop: true,
  },
  {
    sceneName: 'Intermission',
    sourceName: 'Intermission Animation',
    file: 'Media\\\\Scenes\\\\Intermission.mp4',
    loop: true,
  },
  {
    sceneName: 'Stream Ending',
    sourceName: 'Stream Ending Animation',
    file: 'Media\\\\Scenes\\\\StreamEnding.mp4',
    loop: true,
  },
  {
    sceneName: 'Gameplay',
    sourceName: 'Gameplay Overlay',
    file: 'Media\\\\Overlays\\\\GameplayOverlay.webm',
    loop: true,
  },
  {
    sceneName: 'Follower Alert Preview',
    sourceName: 'Follower Alert',
    file: 'Media\\\\Alerts\\\\FollowerAlert.webm',
    loop: false,
  },
  {
    sceneName: 'Subscriber Alert Preview',
    sourceName: 'Subscriber Alert',
    file: 'Media\\\\Alerts\\\\SubscriberAlert.webm',
    loop: false,
  },
];

const sources = [];

for (const definition of definitions) {
  const media = createMediaSource({
    name: definition.sourceName,
    file: definition.file,
    loop: definition.loop,
  });

  const scene = createScene(
    definition.sceneName,
    media
  );

  sources.push(scene, media);
}

const sceneCollection = {
  current_scene: 'Starting Soon',
  current_program_scene: 'Starting Soon',
  scene_order: definitions.map((definition) => ({
    name: definition.sceneName,
  })),
  name: 'Eyesner Premium',
  sources,
  groups: [],
  transitions: [
    {
      name: 'Cut',
      id: 'cut_transition',
      settings: {},
    },
    {
      name: 'Fade',
      id: 'fade_transition',
      settings: {},
    },
    {
      name: 'Eyesner Lightning Stinger',
      id: 'obs_stinger_transition',
      settings: {
        path: mediaPath(
          'Media\\\\Transitions\\\\LightningStinger.webm'
        ),
        transition_point_type: 0,
        transition_point: 1000,
        audio_monitoring: 0,
        audio_fade_style: 0,
      },
    },
  ],
  quick_transitions: [
    {
      name: 'Cut',
      duration: 300,
      hotkeys: [],
      id: 1,
      fade_to_black: false,
    },
    {
      name: 'Fade',
      duration: 300,
      hotkeys: [],
      id: 2,
      fade_to_black: false,
    },
  ],
  saved_projectors: [],
  current_transition: 'Eyesner Lightning Stinger',
  transition_duration: 300,
  preview_locked: false,
  scaling_enabled: false,
  scaling_level: 0,
  scaling_off_x: 0,
  scaling_off_y: 0,
  'virtual-camera': {
    type2: 3,
  },
  modules: {},
  resolution: {
    x: 1920,
    y: 1080,
  },
};

fs.writeFileSync(
  outputFile,
  JSON.stringify(sceneCollection, null, 2) + '\n',
  'utf8'
);

console.log(`Created OBS template: ${outputFile}`);
NODE

# ----------------------------------------------------------
# OBS 1080p60 profile
# ----------------------------------------------------------

cat > "$PACKAGE_ROOT/OBS/Profile/basic.ini" <<'INI'
[General]
Name=Eyesner Premium

[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=0
FPSCommon=60
ScaleType=lanczos
ColorFormat=NV12
ColorSpace=709
ColorRange=Partial

[Output]
Mode=Advanced

[AdvOut]
Encoder=obs_nvenc_h264_tex
RecEncoder=none
TrackIndex=1
VodTrackIndex=2
RecType=Standard
RecFormat2=mkv
RecTracks=1

[Audio]
SampleRate=48000
ChannelSetup=Stereo
INI

# ----------------------------------------------------------
# Windows PowerShell installer
# ----------------------------------------------------------

cat > "$PACKAGE_ROOT/Install-Eyesner.ps1" <<'PS1'
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " EYESNER PREMIUM TWITCH / OBS INSTALLER" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallRoot = Join-Path $env:USERPROFILE "Documents\Eyesner Premium Stream Package"

$ObsRoot = Join-Path $env:APPDATA "obs-studio"
$ObsScenes = Join-Path $ObsRoot "basic\scenes"
$ObsProfiles = Join-Path $ObsRoot "basic\profiles"
$ObsProfileDestination = Join-Path $ObsProfiles "Eyesner Premium"
$SceneDestination = Join-Path $ObsScenes "Eyesner Premium.json"

$RunningObs = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

if ($RunningObs) {
    Write-Host "OBS Studio is currently running." -ForegroundColor Yellow
    Write-Host "Close OBS Studio before continuing." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter after OBS has been closed"

    $RunningObs = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

    if ($RunningObs) {
        throw "OBS Studio is still running. Installation cancelled."
    }
}

Write-Host "Creating installation folders..."

New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
New-Item -ItemType Directory -Force -Path $ObsScenes | Out-Null
New-Item -ItemType Directory -Force -Path $ObsProfileDestination | Out-Null

Write-Host "Copying premium media package..."

Copy-Item `
    -Path (Join-Path $PackageRoot "Media") `
    -Destination $InstallRoot `
    -Recurse `
    -Force

if (Test-Path (Join-Path $PackageRoot "Branding")) {
    Copy-Item `
        -Path (Join-Path $PackageRoot "Branding") `
        -Destination $InstallRoot `
        -Recurse `
        -Force
}

if (Test-Path (Join-Path $PackageRoot "Documentation")) {
    Copy-Item `
        -Path (Join-Path $PackageRoot "Documentation") `
        -Destination $InstallRoot `
        -Recurse `
        -Force
}

$Template = Join-Path `
    $PackageRoot `
    "OBS\Scene Collection\Eyesner Premium.template.json"

if (!(Test-Path $Template)) {
    throw "OBS scene collection template is missing."
}

if (Test-Path $SceneDestination) {
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupFile = "$SceneDestination.backup-$Timestamp"

    Copy-Item `
        -Path $SceneDestination `
        -Destination $BackupFile `
        -Force

    Write-Host "Existing scene collection backed up:"
    Write-Host $BackupFile
}

$EscapedInstallRoot = $InstallRoot.Replace("\", "\\")
$SceneJson = Get-Content -Path $Template -Raw -Encoding UTF8
$SceneJson = $SceneJson.Replace("__INSTALL_ROOT__", $EscapedInstallRoot)

[System.IO.File]::WriteAllText(
    $SceneDestination,
    $SceneJson,
    [System.Text.UTF8Encoding]::new($false)
)

Copy-Item `
    -Path (Join-Path $PackageRoot "OBS\Profile\basic.ini") `
    -Destination (Join-Path $ObsProfileDestination "basic.ini") `
    -Force

Copy-Item `
    -Path (Join-Path $PackageRoot "README.txt") `
    -Destination (Join-Path $InstallRoot "README.txt") `
    -Force

Write-Host ""
Write-Host "Installation completed successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Package installed to:"
Write-Host "  $InstallRoot"
Write-Host ""
Write-Host "OBS scene collection installed:"
Write-Host "  Eyesner Premium"
Write-Host ""
Write-Host "OBS profile installed:"
Write-Host "  Eyesner Premium"
Write-Host ""
Write-Host "Open OBS Studio and select:"
Write-Host "  Scene Collection > Eyesner Premium" -ForegroundColor Cyan
Write-Host "  Profile > Eyesner Premium" -ForegroundColor Cyan
Write-Host ""
Write-Host "In the Gameplay scene, add Game Capture underneath"
Write-Host "the Gameplay Overlay source."
Write-Host ""

Read-Host "Press Enter to close"
PS1

# ----------------------------------------------------------
# Windows CMD launcher
# ----------------------------------------------------------

cat > "$PACKAGE_ROOT/Install-Eyesner.cmd" <<'CMD'
@echo off
title Eyesner Premium Twitch OBS Installer

echo.
echo Starting Eyesner Premium installer...
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Eyesner.ps1"

if errorlevel 1 (
    echo.
    echo Installation failed.
    echo Review the error above.
    pause
)
CMD

# ----------------------------------------------------------
# Uninstaller
# ----------------------------------------------------------

cat > "$PACKAGE_ROOT/Uninstall-Eyesner.ps1" <<'PS1'
$ErrorActionPreference = "Stop"

$InstallRoot = Join-Path $env:USERPROFILE "Documents\Eyesner Premium Stream Package"
$ObsRoot = Join-Path $env:APPDATA "obs-studio"
$SceneFile = Join-Path $ObsRoot "basic\scenes\Eyesner Premium.json"
$ProfileFolder = Join-Path $ObsRoot "basic\profiles\Eyesner Premium"

$RunningObs = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

if ($RunningObs) {
    throw "Close OBS Studio before uninstalling."
}

if (Test-Path $SceneFile) {
    Remove-Item $SceneFile -Force
}

if (Test-Path $ProfileFolder) {
    Remove-Item $ProfileFolder -Recurse -Force
}

if (Test-Path $InstallRoot) {
    Remove-Item $InstallRoot -Recurse -Force
}

Write-Host ""
Write-Host "Eyesner Premium was removed." -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to close"
PS1

cat > "$PACKAGE_ROOT/Uninstall-Eyesner.cmd" <<'CMD'
@echo off
title Uninstall Eyesner Premium

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uninstall-Eyesner.ps1"

if errorlevel 1 (
    echo.
    echo Uninstall failed.
    pause
)
CMD

# ----------------------------------------------------------
# Documentation
# ----------------------------------------------------------

cat > "$PACKAGE_ROOT/README.txt" <<'README'
EYESNER PREMIUM TWITCH / OBS STREAM PACKAGE
===========================================

DELIVERY SPECIFICATION

Resolution: 1920 x 1080
Frame rate: 60 FPS

Full-screen scenes:
- H.264 MP4
- High-quality CRF 8
- OBS-compatible yuv420p

Transparent media:
- VP9 WebM
- PNG render frames
- yuva420p transparency
- High-quality CRF 10

INCLUDED SCENES

- Starting Soon
- Be Right Back
- Intermission
- Stream Ending
- Gameplay
- Follower Alert Preview
- Subscriber Alert Preview
- Lightning Stinger Transition

INSTALLATION

1. Extract the complete ZIP file.
2. Close OBS Studio completely.
3. Double-click Install-Eyesner.cmd.
4. Open OBS Studio.
5. Select Scene Collection > Eyesner Premium.
6. Select Profile > Eyesner Premium.
7. Add your Game Capture underneath Gameplay Overlay.

IMPORTANT

The included alert videos are animated preview assets.
Live Twitch usernames require an alert provider such as
StreamElements, Streamlabs, or another browser-source alert system.

The installer does not change your Twitch login or stream key.
README

cat > "$PACKAGE_ROOT/Documentation/OBS-SETUP.txt" <<'DOC'
EYESNER PREMIUM OBS SETUP
=========================

1. Close OBS before running the installer.

2. Run:
   Install-Eyesner.cmd

3. Open OBS and select:
   Scene Collection > Eyesner Premium
   Profile > Eyesner Premium

4. Open the Gameplay scene.

5. Add a Game Capture source.

6. Move Game Capture underneath Gameplay Overlay.

7. Add your webcam, microphone, chat, and alert browser sources.

8. Confirm these OBS video settings:

   Base Canvas: 1920x1080
   Output Resolution: 1920x1080
   FPS: 60
   Downscale Filter: Lanczos

9. Test the Lightning Stinger transition before going live.

10. Configure your Twitch alert provider separately for live alerts.
DOC

# ----------------------------------------------------------
# Verify media
# ----------------------------------------------------------

echo
echo "Verifying premium media..."

VERIFICATION_FILE="$PACKAGE_ROOT/Documentation/MEDIA-VERIFICATION.txt"

{
  echo "EYESNER PREMIUM MEDIA VERIFICATION"
  echo "=================================="
  echo
  echo "Expected resolution: 1920x1080"
  echo "Expected frame rate: 60/1"
  echo
} > "$VERIFICATION_FILE"

FAILED=0

while IFS= read -r -d '' file; do
  echo
  echo "Checking: $file"

  WIDTH="$(
    ffprobe -v error \
      -select_streams v:0 \
      -show_entries stream=width \
      -of csv=p=0 \
      "$file"
  )"

  HEIGHT="$(
    ffprobe -v error \
      -select_streams v:0 \
      -show_entries stream=height \
      -of csv=p=0 \
      "$file"
  )"

  FPS="$(
    ffprobe -v error \
      -select_streams v:0 \
      -show_entries stream=r_frame_rate \
      -of csv=p=0 \
      "$file"
  )"

  CODEC="$(
    ffprobe -v error \
      -select_streams v:0 \
      -show_entries stream=codec_name \
      -of csv=p=0 \
      "$file"
  )"

  PIXEL_FORMAT="$(
    ffprobe -v error \
      -select_streams v:0 \
      -show_entries stream=pix_fmt \
      -of csv=p=0 \
      "$file"
  )"

  FILE_SIZE="$(
    stat -c%s "$file"
  )"

  {
    echo "FILE: $file"
    echo "codec=$CODEC"
    echo "width=$WIDTH"
    echo "height=$HEIGHT"
    echo "frame_rate=$FPS"
    echo "pixel_format=$PIXEL_FORMAT"
    echo "size_bytes=$FILE_SIZE"
    echo
  } >> "$VERIFICATION_FILE"

  echo "  codec:       $CODEC"
  echo "  resolution:  ${WIDTH}x${HEIGHT}"
  echo "  frame rate:  $FPS"
  echo "  pixel format:$PIXEL_FORMAT"
  echo "  size:        $FILE_SIZE bytes"

  if [[ "$WIDTH" != "1920" ]]; then
    echo "ERROR: Width is not 1920."
    FAILED=1
  fi

  if [[ "$HEIGHT" != "1080" ]]; then
    echo "ERROR: Height is not 1080."
    FAILED=1
  fi

  if [[ "$FPS" != "60/1" ]]; then
    echo "ERROR: Frame rate is not 60 FPS."
    FAILED=1
  fi

  case "$file" in
    *.mp4)
      if [[ "$CODEC" != "h264" ]]; then
        echo "ERROR: MP4 is not using H.264."
        FAILED=1
      fi
      ;;
    *.webm)
      if [[ "$CODEC" != "vp9" ]]; then
        echo "ERROR: WebM is not using VP9."
        FAILED=1
      fi
      ;;
  esac

done < <(
  find "$PACKAGE_ROOT/Media" \
    -type f \
    \( -iname '*.mp4' -o -iname '*.webm' \) \
    -print0
)

if [[ "$FAILED" -ne 0 ]]; then
  echo
  echo "ERROR: One or more media files failed verification."
  echo "See:"
  echo "  $VERIFICATION_FILE"
  exit 1
fi

# ----------------------------------------------------------
# Validate generated JSON
# ----------------------------------------------------------

node -e "
const fs = require('fs');
const file = process.argv[1];
JSON.parse(fs.readFileSync(file, 'utf8'));
console.log('OBS scene collection JSON is valid.');
" "$PACKAGE_ROOT/OBS/Scene Collection/Eyesner Premium.template.json"

# ----------------------------------------------------------
# Create final ZIP
# ----------------------------------------------------------

echo
echo "Creating final delivery ZIP..."

(
  cd "$DELIVERY_ROOT"
  rm -f "$PACKAGE_NAME.zip"
  zip -r -9 "$PACKAGE_NAME.zip" "$PACKAGE_NAME"
)

echo
echo "================================================"
echo " PREMIUM PACKAGE BUILD COMPLETE"
echo "================================================"
echo
echo "✓ 1920x1080"
echo "✓ 60 FPS"
echo "✓ H.264 MP4 full-screen scenes"
echo "✓ VP9 WebM transparent assets"
echo "✓ OBS scene collection"
echo "✓ OBS 1080p60 profile"
echo "✓ Windows installer"
echo "✓ Windows uninstaller"
echo "✓ Media verification report"
echo "✓ Final ZIP package"
echo
echo "FINAL DELIVERY:"
echo "  $DELIVERY_ROOT/$PACKAGE_NAME.zip"
echo
echo "BACKUP:"
echo "  $BACKUP_DIR"
echo
