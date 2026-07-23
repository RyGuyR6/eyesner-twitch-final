import fs from 'fs-extra';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const packageName = 'Eyesner-Premium-Twitch-OBS-Package';
const outputRoot = path.resolve('dist/delivery');
const packageRoot = path.join(outputRoot, packageName);

const mediaDirectory = path.join(packageRoot, 'Media');
const brandingDirectory = path.join(packageRoot, 'Branding');
const obsDirectory = path.join(packageRoot, 'OBS');
const docsDirectory = path.join(packageRoot, 'Documentation');

fs.removeSync(outputRoot);

fs.ensureDirSync(mediaDirectory);
fs.ensureDirSync(brandingDirectory);
fs.ensureDirSync(obsDirectory);
fs.ensureDirSync(docsDirectory);

fs.copySync('dist/renders', mediaDirectory);

if (fs.existsSync('public/assets/eyesner-logo.png')) {
  fs.copySync(
    'public/assets/eyesner-logo.png',
    path.join(brandingDirectory, 'eyesner-logo.png')
  );
}

const windowsPath = (filename: string) =>
  `__MEDIA_ROOT__\\\\${filename}`;

type MediaSourceOptions = {
  loop: boolean;
  restart: boolean;
  closeWhenInactive: boolean;
};

const mediaSource = (
  name: string,
  filename: string,
  options: MediaSourceOptions
) => ({
  prev_ver: 503316482,
  name,
  uuid: crypto.randomUUID(),
  id: 'ffmpeg_source',
  versioned_id: 'ffmpeg_source',
  settings: {
    is_local_file: true,
    local_file: windowsPath(filename),
    looping: options.loop,
    restart_on_activate: options.restart,
    close_when_inactive: options.closeWhenInactive,
    clear_on_media_end: true,
    hw_decode: true,
  },
  mixers: 0,
  sync: 0,
  flags: 0,
  volume: 1.0,
  balance: 0.5,
  enabled: true,
  muted: false,
  push-to-mute: false,
  push-to-mute-delay: 0,
  push-to-talk: false,
  push-to-talk-delay: 0,
  hotkeys: {},
  deinterlace_mode: 0,
  deinterlace_field_order: 0,
  monitoring_type: 0,
  private_settings: {},
});

const sceneSource = (name: string, itemName: string) => ({
  prev_ver: 503316482,
  name,
  uuid: crypto.randomUUID(),
  id: 'scene',
  versioned_id: 'scene',
  settings: {
    items: [
      {
        name: itemName,
        source_uuid: '',
        visible: true,
        locked: true,
        rot: 0.0,
        pos: {
          x: 0.0,
          y: 0.0,
        },
        scale: {
          x: 1.0,
          y: 1.0,
        },
        align: 5,
        bounds_type: 2,
        bounds_align: 0,
        bounds: {
          x: 1920.0,
          y: 1080.0,
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
  volume: 1.0,
  balance: 0.5,
  enabled: true,
  muted: false,
  push-to-mute: false,
  push-to-mute-delay: 0,
  push-to-talk: false,
  push-to-talk-delay: 0,
  hotkeys: {},
  deinterlace_mode: 0,
  deinterlace_field_order: 0,
  monitoring_type: 0,
  private_settings: {},
});

const sourceDefinitions = [
  {
    scene: 'Starting Soon',
    source: mediaSource('Starting Soon Media', 'StartingSoon.mp4', {
      loop: true,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Be Right Back',
    source: mediaSource('Be Right Back Media', 'BeRightBack.mp4', {
      loop: true,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Intermission',
    source: mediaSource('Intermission Media', 'Intermission.mp4', {
      loop: true,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Stream Ending',
    source: mediaSource('Stream Ending Media', 'StreamEnding.mp4', {
      loop: true,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Gameplay',
    source: mediaSource('Gameplay Overlay', 'GameplayOverlay.webm', {
      loop: true,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Follower Alert Preview',
    source: mediaSource('Follower Alert', 'FollowerAlert.webm', {
      loop: false,
      restart: true,
      closeWhenInactive: true,
    }),
  },
  {
    scene: 'Subscriber Alert Preview',
    source: mediaSource('Subscriber Alert', 'SubscriberAlert.webm', {
      loop: false,
      restart: true,
      closeWhenInactive: true,
    }),
  },
];

const sources: unknown[] = [];

for (const definition of sourceDefinitions) {
  const scene = sceneSource(definition.scene, definition.source.name);

  const sceneItems = (
    scene.settings as {
      items: Array<{source_uuid: string}>;
    }
  ).items;

  sceneItems[0].source_uuid = definition.source.uuid;

  sources.push(scene);
  sources.push(definition.source);
}

const sceneCollection = {
  current_scene: 'Starting Soon',
  current_program_scene: 'Starting Soon',
  scene_order: sourceDefinitions.map(({scene}) => ({
    name: scene,
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
        path: windowsPath('LightningStinger.webm'),
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
  scaling_off_x: 0.0,
  scaling_off_y: 0.0,
  virtual-camera: {
    type2: 3,
  },
  modules: {},
  resolution: {
    x: 1920,
    y: 1080,
  },
};

fs.writeJsonSync(
  path.join(obsDirectory, 'Eyesner-Premium.template.json'),
  sceneCollection,
  {
    spaces: 2,
  }
);

const readme = `EYESNER PREMIUM TWITCH / OBS STREAM PACKAGE
================================================

DELIVERY SPECIFICATION

Resolution: 1920 x 1080
Frame rate: 60 FPS
Full-screen codec: H.264 MP4
Transparent codec: VP9 WebM with alpha
OBS canvas: 1920 x 1080

INCLUDED MEDIA

Full-screen scenes:
- StartingSoon.mp4
- BeRightBack.mp4
- Intermission.mp4
- StreamEnding.mp4

Transparent assets:
- GameplayOverlay.webm
- FollowerAlert.webm
- SubscriberAlert.webm
- LightningStinger.webm

INSTALLATION

Windows:
1. Close OBS Studio completely.
2. Double-click Install-Eyesner.cmd.
3. Restart OBS Studio.
4. Select Scene Collection > Eyesner Premium.

IMPORTANT

The installer backs up an existing Eyesner Premium scene collection
before replacing it.

The Gameplay scene includes the transparent visual overlay. Add your
Game Capture underneath the Gameplay Overlay source.

Follower and subscriber alert files are visual preview assets. Connect
your Twitch alert provider separately if live dynamic alerts are needed.

Recommended OBS settings:
- Base Canvas: 1920x1080
- Output Resolution: 1920x1080
- Common FPS: 60
- Downscale Filter: Lanczos
`;

fs.writeFileSync(
  path.join(packageRoot, 'README.txt'),
  readme,
  'utf8'
);

fs.writeFileSync(
  path.join(docsDirectory, 'OBS-SETUP.txt'),
  `OBS SETUP

1. Open OBS.
2. Confirm Eyesner Premium is selected under Scene Collection.
3. Add Game Capture beneath Gameplay Overlay in the Gameplay scene.
4. Add webcam and chat sources as desired.
5. Configure Twitch alerts using StreamElements, Streamlabs, or your
   preferred Twitch alert service.
6. Set canvas and output resolution to 1920x1080.
7. Set frame rate to 60 FPS.
`,
  'utf8'
);

const installerPowerShell = String.raw`$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " EYESNER PREMIUM TWITCH / OBS INSTALLER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$InstallRoot = Join-Path $env:USERPROFILE "Documents\Eyesner Streaming Package"
$MediaRoot = Join-Path $InstallRoot "Media"
$BrandingRoot = Join-Path $InstallRoot "Branding"

$ObsRoot = Join-Path $env:APPDATA "obs-studio"
$ObsScenes = Join-Path $ObsRoot "basic\scenes"
$SceneDestination = Join-Path $ObsScenes "Eyesner Premium.json"

$ObsProcesses = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

if ($ObsProcesses) {
    Write-Host "OBS Studio is currently running." -ForegroundColor Yellow
    Write-Host "Close OBS completely before installation." -ForegroundColor Yellow
    Read-Host "Press Enter after OBS has been closed"

    $ObsProcesses = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

    if ($ObsProcesses) {
        throw "OBS is still running. Installation stopped to protect its configuration."
    }
}

Write-Host "Installing streaming media..."

New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
New-Item -ItemType Directory -Force -Path $MediaRoot | Out-Null
New-Item -ItemType Directory -Force -Path $BrandingRoot | Out-Null
New-Item -ItemType Directory -Force -Path $ObsScenes | Out-Null

Copy-Item `
    -Path (Join-Path $PackageRoot "Media\*") `
    -Destination $MediaRoot `
    -Recurse `
    -Force

if (Test-Path (Join-Path $PackageRoot "Branding")) {
    Copy-Item `
        -Path (Join-Path $PackageRoot "Branding\*") `
        -Destination $BrandingRoot `
        -Recurse `
        -Force
}

$TemplatePath = Join-Path $PackageRoot "OBS\Eyesner-Premium.template.json"

if (!(Test-Path $TemplatePath)) {
    throw "OBS scene collection template was not found."
}

if (Test-Path $SceneDestination) {
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $BackupPath = "$SceneDestination.backup-$Timestamp"

    Copy-Item `
        -Path $SceneDestination `
        -Destination $BackupPath `
        -Force

    Write-Host "Existing collection backed up:"
    Write-Host $BackupPath
}

$EscapedMediaRoot = $MediaRoot.Replace("\", "\\")

$SceneJson = Get-Content `
    -Path $TemplatePath `
    -Raw `
    -Encoding UTF8

$SceneJson = $SceneJson.Replace(
    "__MEDIA_ROOT__",
    $EscapedMediaRoot
)

Set-Content `
    -Path $SceneDestination `
    -Value $SceneJson `
    -Encoding UTF8

Copy-Item `
    -Path (Join-Path $PackageRoot "README.txt") `
    -Destination (Join-Path $InstallRoot "README.txt") `
    -Force

Write-Host ""
Write-Host "Installation completed successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Media installed to:"
Write-Host $MediaRoot
Write-Host ""
Write-Host "OBS scene collection installed to:"
Write-Host $SceneDestination
Write-Host ""
Write-Host "Open OBS and select:"
Write-Host "Scene Collection > Eyesner Premium" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to close"
`;

fs.writeFileSync(
  path.join(packageRoot, 'Install-Eyesner.ps1'),
  installerPowerShell,
  'utf8'
);

const cmdInstaller = `@echo off
title Eyesner Premium Twitch OBS Installer
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Install-Eyesner.ps1"
if errorlevel 1 (
  echo.
  echo Installation failed.
  pause
)
`;

fs.writeFileSync(
  path.join(packageRoot, 'Install-Eyesner.cmd'),
  cmdInstaller,
  'utf8'
);

const uninstallPowerShell = String.raw`$ErrorActionPreference = "Stop"

$InstallRoot = Join-Path $env:USERPROFILE "Documents\Eyesner Streaming Package"
$ScenePath = Join-Path $env:APPDATA "obs-studio\basic\scenes\Eyesner Premium.json"

$ObsProcesses = Get-Process obs64, obs32 -ErrorAction SilentlyContinue

if ($ObsProcesses) {
    throw "Close OBS Studio before uninstalling the package."
}

if (Test-Path $ScenePath) {
    Remove-Item $ScenePath -Force
}

if (Test-Path $InstallRoot) {
    Remove-Item $InstallRoot -Recurse -Force
}

Write-Host "Eyesner Premium package removed." -ForegroundColor Green
Read-Host "Press Enter to close"
`;

fs.writeFileSync(
  path.join(packageRoot, 'Uninstall-Eyesner.ps1'),
  uninstallPowerShell,
  'utf8'
);

const verificationLines: string[] = [
  'EYESNER PREMIUM MEDIA VERIFICATION',
  '==================================',
  '',
];

const mediaFiles = fs
  .readdirSync(mediaDirectory)
  .filter((filename) => /\.(mp4|webm)$/i.test(filename))
  .sort();

for (const filename of mediaFiles) {
  const fullPath = path.join(mediaDirectory, filename);

  const result = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=codec_name,width,height,r_frame_rate,pix_fmt',
      '-show_entries',
      'format=duration,size,bit_rate',
      '-of',
      'default=noprint_wrappers=1',
      fullPath,
    ],
    {
      encoding: 'utf8',
    }
  );

  verificationLines.push(`FILE: ${filename}`);
  verificationLines.push(result.trim());
  verificationLines.push('');
}

fs.writeFileSync(
  path.join(docsDirectory, 'MEDIA-VERIFICATION.txt'),
  verificationLines.join('\n'),
  'utf8'
);

fs.ensureDirSync(outputRoot);

try {
  execFileSync(
    'zip',
    [
      '-r',
      '-9',
      `${packageName}.zip`,
      packageName,
    ],
    {
      cwd: outputRoot,
      stdio: 'inherit',
    }
  );
} catch {
  console.warn(
    'zip command was not available. Delivery folder was still created.'
  );
}

console.log('');
console.log('==========================================');
console.log(' PREMIUM DELIVERY PACKAGE CREATED');
console.log('==========================================');
console.log(`Folder: ${packageRoot}`);
console.log(
  `ZIP: ${path.join(outputRoot, `${packageName}.zip`)}`
);
