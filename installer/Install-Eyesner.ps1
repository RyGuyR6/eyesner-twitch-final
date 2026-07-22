$ErrorActionPreference = 'Stop'

$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$mediaRoot = Join-Path $packageRoot 'media'
$packageName = 'Eyesner Lightning Storm V2'
$sceneCollectionName = 'Eyesner Lightning Storm V2'
$sceneCollectionFileName = 'Eyesner-Lightning-Storm-V2.json'
# Hex-encoded UUID OBS uses for the built-in libobs main canvas in exported collections.
$sceneCanvasUuid = '6c69626f-6273-4c00-9d88-c5136d61696e'
# Match the prev_ver marker copied from OBS-exported scene collection JSON records.
$obsSceneFormatVersion = 520159234
# Match the default collection scaling metadata OBS writes in exported scene collections.
$obsCollectionScalingLevel = -7
$installRootBase = [Environment]::GetFolderPath('MyVideos')
if ([string]::IsNullOrWhiteSpace($installRootBase)) {
    $installRootBase = [Environment]::GetFolderPath('MyDocuments')
}
$userProfile = $env:USERPROFILE
if ([string]::IsNullOrWhiteSpace($userProfile)) {
    $userProfile = [Environment]::GetFolderPath('UserProfile')
}
if ([string]::IsNullOrWhiteSpace($installRootBase) -and -not [string]::IsNullOrWhiteSpace($userProfile)) {
    $installRootBase = Join-Path $userProfile 'Videos'
}
if ([string]::IsNullOrWhiteSpace($installRootBase)) {
    $installRootBase = Join-Path $packageRoot 'Installed-Package'
}
$installRoot = Join-Path $installRootBase $packageName
$appDataRoot = $env:APPDATA
if ([string]::IsNullOrWhiteSpace($appDataRoot) -and -not [string]::IsNullOrWhiteSpace($userProfile)) {
    $appDataRoot = Join-Path $userProfile 'AppData\Roaming'
}
if ([string]::IsNullOrWhiteSpace($appDataRoot)) {
    $appDataRoot = Join-Path $packageRoot 'AppData'
}
$obsConfigRoot = Join-Path $appDataRoot 'obs-studio'
$obsScenesRoot = Join-Path (Join-Path $obsConfigRoot 'basic') 'scenes'
$sceneCollectionPath = Join-Path $obsScenesRoot $sceneCollectionFileName

$mediaDefinitions = @(
    @{ SceneName = 'Starting Soon'; SourceName = 'Starting Soon'; FileName = 'StartingSoon.webm'; Loop = $true },
    @{ SceneName = 'Intermission'; SourceName = 'Intermission'; FileName = 'Intermission.webm'; Loop = $true },
    @{ SceneName = 'Be Right Back'; SourceName = 'Be Right Back'; FileName = 'BeRightBack.webm'; Loop = $true },
    @{ SceneName = 'Stream Ending'; SourceName = 'Stream Ending'; FileName = 'StreamEnding.webm'; Loop = $true },
    @{ SceneName = 'Gameplay Overlay'; SourceName = 'Gameplay Overlay'; FileName = 'GameplayOverlay.webm'; Loop = $true },
    @{ SceneName = 'Follower Alert'; SourceName = 'Follower Alert'; FileName = 'FollowerAlert.webm'; Loop = $false },
    @{ SceneName = 'Subscriber Alert'; SourceName = 'Subscriber Alert'; FileName = 'SubscriberAlert.webm'; Loop = $false }
)

$additionalSources = @(
    @{ SourceName = 'Lightning Stinger Transition'; FileName = 'LightningStinger.webm'; Loop = $false }
)

function Write-Step {
    param([string]$Message)
    Write-Host "[Eyesner] $Message" -ForegroundColor Cyan
}

function Test-ObsRunning {
    @(Get-Process -Name obs64, obs32, obs -ErrorAction SilentlyContinue)
}

function Wait-ForObsToClose {
    while ($true) {
        $running = Test-ObsRunning
        if ($running.Count -eq 0) {
            return
        }

        Write-Warning 'OBS Studio is currently running. Please close OBS Studio before continuing.'
        $response = Read-Host 'Press Enter after OBS Studio is closed, or type C to cancel'
        if ($response -match '^[Cc]$') {
            throw 'Installation cancelled because OBS Studio is still running.'
        }
    }
}

function Assert-RequiredFiles {
    $requiredFiles = @(
        'README.txt',
        'eyesner-logo.png',
        'media\StartingSoon.webm',
        'media\Intermission.webm',
        'media\BeRightBack.webm',
        'media\StreamEnding.webm',
        'media\GameplayOverlay.webm',
        'media\FollowerAlert.webm',
        'media\SubscriberAlert.webm',
        'media\LightningStinger.webm'
    )

    foreach ($relativePath in $requiredFiles) {
        $fullPath = Join-Path $packageRoot $relativePath
        if (-not (Test-Path -LiteralPath $fullPath)) {
            throw "Package file missing: $relativePath"
        }
    }
}

function New-BaseSourceRecord {
    param(
        [string]$Name,
        [string]$Uuid,
        [string]$Id,
        [hashtable]$Settings,
        [int]$Mixers = 255
    )

    [ordered]@{
        prev_ver = $obsSceneFormatVersion
        name = $Name
        uuid = $Uuid
        id = $Id
        versioned_id = $Id
        settings = $Settings
        mixers = $Mixers
        sync = 0
        flags = 0
        volume = 1.0
        balance = 0.5
        enabled = $true
        muted = $false
        'push-to-mute' = $false
        'push-to-mute-delay' = 0
        'push-to-talk' = $false
        'push-to-talk-delay' = 0
        hotkeys = @{}
        deinterlace_mode = 0
        deinterlace_field_order = 0
        monitoring_type = 0
        private_settings = [ordered]@{}
    }
}

function New-SceneItem {
    param(
        [string]$SourceName,
        [string]$SourceUuid,
        [int]$Id
    )

    [ordered]@{
        name = $SourceName
        source_uuid = $SourceUuid
        visible = $true
        locked = $false
        rot = 0.0
        scale_ref = [ordered]@{ x = 1920.0; y = 1080.0 }
        align = 5
        bounds_type = 0
        bounds_align = 0
        bounds_crop = $false
        crop_left = 0
        crop_top = 0
        crop_right = 0
        crop_bottom = 0
        id = $Id
        group_item_backup = $false
        pos = [ordered]@{ x = 0.0; y = 0.0 }
        pos_rel = [ordered]@{ x = -1.0; y = -1.0 }
        scale = [ordered]@{ x = 1.0; y = 1.0 }
        scale_rel = [ordered]@{ x = 1.0; y = 1.0 }
        bounds = [ordered]@{ x = 0.0; y = 0.0 }
        bounds_rel = [ordered]@{ x = 0.0; y = 0.0 }
        scale_filter = 'disable'
        blend_method = 'default'
        blend_type = 'normal'
        show_transition = [ordered]@{ duration = 0 }
        hide_transition = [ordered]@{ duration = 0 }
        private_settings = [ordered]@{}
    }
}

function New-MediaSourceRecord {
    param(
        [string]$Name,
        [string]$Uuid,
        [string]$FilePath,
        [bool]$Loop
    )

    $settings = [ordered]@{
        is_local_file = $true
        local_file = $FilePath
        looping = $Loop
        restart_on_activate = $true
        clear_on_media_end = $false
        close_when_inactive = $false
        hw_decode = $true
    }

    New-BaseSourceRecord -Name $Name -Uuid $Uuid -Id 'ffmpeg_source' -Settings $settings
}

function New-SceneRecord {
    param(
        [string]$Name,
        [string]$Uuid,
        [int]$ItemId,
        [string]$SourceName,
        [string]$SourceUuid
    )

    $scene = New-BaseSourceRecord -Name $Name -Uuid $Uuid -Id 'scene' -Settings ([ordered]@{
        id_counter = $ItemId
        custom_size = $false
        items = @(
            (New-SceneItem -SourceName $SourceName -SourceUuid $SourceUuid -Id $ItemId)
        )
    }) -Mixers 0
    $scene.canvas_uuid = $sceneCanvasUuid
    return $scene
}

function New-SceneCollection {
    $sources = New-Object System.Collections.Generic.List[object]
    $sceneOrder = New-Object System.Collections.Generic.List[object]
    $itemId = 1

    foreach ($definition in $mediaDefinitions) {
        $mediaUuid = [guid]::NewGuid().Guid
        $sceneUuid = [guid]::NewGuid().Guid
        $installedMediaPath = Join-Path (Join-Path $installRoot 'media') $definition.FileName

        $sources.Add((New-MediaSourceRecord -Name $definition.SourceName -Uuid $mediaUuid -FilePath $installedMediaPath -Loop $definition.Loop))
        $sources.Add((New-SceneRecord -Name $definition.SceneName -Uuid $sceneUuid -ItemId $itemId -SourceName $definition.SourceName -SourceUuid $mediaUuid))
        $sceneOrder.Add([ordered]@{ name = $definition.SceneName })
        $itemId++
    }

    foreach ($definition in $additionalSources) {
        $mediaUuid = [guid]::NewGuid().Guid
        $installedMediaPath = Join-Path (Join-Path $installRoot 'media') $definition.FileName
        $sources.Add((New-MediaSourceRecord -Name $definition.SourceName -Uuid $mediaUuid -FilePath $installedMediaPath -Loop $definition.Loop))
    }

    [ordered]@{
        current_scene = 'Starting Soon'
        current_program_scene = 'Starting Soon'
        scene_order = $sceneOrder
        name = $sceneCollectionName
        sources = $sources
        groups = @()
        quick_transitions = @(
            [ordered]@{ name = 'Cut'; duration = 300; hotkeys = @(); id = 1; fade_to_black = $false },
            [ordered]@{ name = 'Fade'; duration = 300; hotkeys = @(); id = 2; fade_to_black = $false },
            [ordered]@{ name = 'Fade'; duration = 300; hotkeys = @(); id = 3; fade_to_black = $true }
        )
        transitions = @()
        saved_projectors = @()
        canvases = @()
        current_transition = 'Fade'
        transition_duration = 300
        preview_locked = $false
        scaling_enabled = $true
        scaling_level = $obsCollectionScalingLevel
        scaling_off_x = 0.0
        scaling_off_y = 0.0
        'virtual-camera' = [ordered]@{ type2 = 3 }
        modules = [ordered]@{
            'scripts-tool' = @()
            'output-timer' = [ordered]@{
                streamTimerHours = 0
                streamTimerMinutes = 0
                streamTimerSeconds = 30
                recordTimerHours = 0
                recordTimerMinutes = 0
                recordTimerSeconds = 30
                autoStartStreamTimer = $false
                autoStartRecordTimer = $false
                pauseRecordTimer = $true
            }
            'auto-scene-switcher' = [ordered]@{
                interval = 300
                non_matching_scene = ''
                switch_if_not_matching = $false
                active = $false
                switches = @()
            }
        }
        resolution = [ordered]@{ x = 1920; y = 1080 }
        version = 2
    }
}

Write-Step 'Checking package contents.'
Assert-RequiredFiles

Write-Step 'Checking for a running OBS Studio session.'
Wait-ForObsToClose

Write-Step "Detected OBS Studio configuration folder: $obsConfigRoot"
Write-Step "Installing package files to: $installRoot"
New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $installRoot 'media') -Force | Out-Null
New-Item -ItemType Directory -Path $obsScenesRoot -Force | Out-Null

if (Test-Path -LiteralPath $sceneCollectionPath) {
    throw "An OBS scene collection named '$sceneCollectionName' already exists at '$sceneCollectionPath'. Remove or rename the existing collection before reinstalling to avoid overwriting user data."
}

Copy-Item -LiteralPath (Join-Path $packageRoot 'README.txt') -Destination (Join-Path $installRoot 'README.txt') -Force
Copy-Item -LiteralPath (Join-Path $packageRoot 'eyesner-logo.png') -Destination (Join-Path $installRoot 'eyesner-logo.png') -Force
Copy-Item -Path (Join-Path $mediaRoot '*') -Destination (Join-Path $installRoot 'media') -Recurse -Force

Write-Step 'Creating OBS scene collection.'
$sceneCollection = New-SceneCollection
$sceneCollection | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $sceneCollectionPath -Encoding UTF8

Write-Step 'Installation complete.'
Write-Host ''
Write-Host 'Eyesner Lightning Storm V2 installed successfully.' -ForegroundColor Green
Write-Host "OBS media files: $installRoot"
Write-Host "OBS scene collection: $sceneCollectionPath"
Write-Host 'Open OBS Studio and switch to the "Eyesner Lightning Storm V2" scene collection.'
