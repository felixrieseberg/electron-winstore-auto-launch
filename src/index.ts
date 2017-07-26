let appModel: any = null;

export enum StartupTaskState {
  disabled,
  disabledByUser,
  enabled,
}

export interface StartupTask {
  state: StartupTaskState;
  taskId: String;

  requestEnableAsync(callback: (error: Error, result: StartupTaskState) => void): void ;
  disable(): void;
}

export class WindowsStoreAutoLaunch {
  /**
   * Returns the windows.applicationModel namespace for this model. If the app is not
   * running inside an appx container, this will fail.
   *
   * @static
   * @param {(reason: string) => void} [reject]
   * @returns
   * @memberof WindowsStoreAutoLaunch
   */
  private static getAppModel(reject?: (reason: string) => void) {
    try {
      if (process.platform !== 'win32') {
        if (reject) {
          return reject(`Platform is not win32`);
        } else {
          throw new Error('Platform is not win32');
        }
      }

      return appModel || require('@nodert-win10-au/windows.applicationmodel');
    } catch (error) {
      if (reject) {
        return reject(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Returns all startupTasks for this package.
   *
   * @static
   * @returns {Promise<Array<StartupTask>>}
   * @memberof WindowsStoreAutoLaunch
   */
  static getStartupTasks(): Promise<Array<StartupTask>> {
    return new Promise((resolve, reject) => {
      const appModel = WindowsStoreAutoLaunch.getAppModel(reject);

      appModel.StartupTask.getForCurrentPackageAsync((error: Error, tasks: Array<StartupTask>) => {
        if (error) {
          return reject(error);
        }

        resolve(tasks);
      });
    })
  }

  /**
   * Returns the first found startupTask.
   *
   * @static
   * @returns {(Promise<StartupTask | null>)}
   * @memberof WindowsStoreAutoLaunch
   */
  static async getStartupTask(): Promise<StartupTask | null> {
    const startupTasks = await WindowsStoreAutoLaunch.getStartupTasks();

    if (startupTasks && startupTasks.length > 0) {
      const [ startupTask ] = startupTasks;
      return startupTask;
    } else {
      return null;
    }
  }

  /**
   * Returns a StartupTaskState if a StartupTask is found - or null if
   * we could not find one.
   *
   * @static
   * @returns {(Promise<StartupTaskState | null>)}
   * @memberof WindowsStoreAutoLaunch
   */
  static async getStatus(): Promise<StartupTaskState | null> {
    // We're assuming that this app has just one startup task, so let's go for it
    const startupTask = await WindowsStoreAutoLaunch.getStartupTask();

    if (startupTask) {
      return startupTask.state;
    } else {
      return null;
    }
  }

  /**
   * Takes the first startup task and attempts to disable it.
   *
   * @static
   * @returns {(Promise<boolean | null>)}
   * @memberof WindowsStoreAutoLaunch
   */
  static async disable(): Promise<boolean | null> {
    // We're assuming that this app has just one startup task, so let's go for it
    const startupTask = await WindowsStoreAutoLaunch.getStartupTask();

    if (startupTask) {
      startupTask.disable();
      return true;
    } else {
      return null;
    }
  }

  /**
   * Takes the first startup task and attempts to enable it.
   *
   * @static
   * @returns {(Promise<StartupTaskState | null>)}
   * @memberof WindowsStoreAutoLaunch
   */
  static async enable(): Promise<StartupTaskState | null> {
    // We're assuming that this app has just one startup task, so let's go for it

    function enableTask(startupTask: StartupTask): Promise<StartupTaskState> {
      return new Promise((resolve, reject) => {
        startupTask.requestEnableAsync((error: Error, newStatus: StartupTaskState) => {
          if (error) {
            return reject(error);
          }

          resolve(newStatus);
        });
      });
    }

    const startupTask = await WindowsStoreAutoLaunch.getStartupTask();

    if (startupTask) {
      return enableTask(startupTask);
    } else {
      return null;
    }
  }
}
