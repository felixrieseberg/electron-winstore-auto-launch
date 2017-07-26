# electron-winstore-auto-launch
This is a convenience module allowing for easy configuration of startup tasks for Windows Store apps written with Electron. Basically, it allows you either enable or disable the automatic launch of your app when the user logs in.

## Usage
Before you can use this module, you need to add an `<Extension>` to your `appxmanifest.xml`. An app must register for the `windows.startup` extension category in its manifest to be activated at startup or when a user logs in.

```xml
<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10"
  IgnorableNamespaces="uap uap3">
  ...
  <Applications>
    <Application Id="Slack" Executable="app\Slack.exe" EntryPoint="Windows.FullTrustApplication">
      ...
      <Extensions>
        <desktop:Extension
          Category="windows.startupTask"
          Executable="app\Slack.exe"
          EntryPoint="Windows.FullTrustApplication">
          <desktop:StartupTask TaskId="SlackStartup" Enabled="true" DisplayName="Slack" />
        </desktop:Extension>
      </Extensions>
    </Application>
  </Applications>
</Package>
```

This module assumes that you have just one startup task. If you have more than one, it'll automatically use the first one.

The module exports one single static class `WindowsStoreAutoLaunch` with three main methods:

```typescript
import { WindowsStoreAutoLaunch } from 'electron-winstore-auto-launch';

// Attempts to enable the task
WindowsStoreAutoLaunch.enable()

// Attempts to disable the task
WindowsStoreAutoLaunch.disable()

// Returns the current status of the task
WindowsStoreAutoLaunch.getStatus()
```

The status can be `disabled` (0), `disabledByUser` (1), or `enabled` (2). If the app's startup task was disabled by the user in the task manager, it can no longer be programmatically enabled.

The module also exports these helper methods:

```typescript
import { WindowsStoreAutoLaunch } from 'electron-winstore-auto-launch';

// Returns an IList/Array of all startupTasks registered in the manifest
WindowsStoreAutoLaunch.getStartupTasks()

// Returns the first found startupTask
WindowsStoreAutoLaunch.getStartupTask()
```

## License
MIT, please see `LICENSE` for details.