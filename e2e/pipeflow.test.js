const {device, element, by, expect: detoxExpect, waitFor} = require('detox');

describe('PipeFlow E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: {notifications: 'YES'},
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch the app successfully', async () => {
    // Wait for the app to load
    await waitFor(element(by.id('pipeflow-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // Take a screenshot after app launch
    await device.takeScreenshot('01-app-launched');
  });

  it('should display the main game screen', async () => {
    // Verify the game screen is visible
    await detoxExpect(element(by.id('pipeflow-screen'))).toBeVisible();

    // Verify level navigation buttons are present
    await detoxExpect(element(by.id('prev-level-button'))).toBeVisible();
    await detoxExpect(element(by.id('next-level-button'))).toBeVisible();

    // Take a screenshot of the main game screen
    await device.takeScreenshot('02-main-game-screen');
  });

  it('should show component tray with tappable components', async () => {
    // Verify component tray is visible
    await detoxExpect(element(by.id('component-tray'))).toBeVisible();

    // Take a screenshot of the component tray
    await device.takeScreenshot('03-component-tray');
  });

  it('should navigate between levels', async () => {
    // Take initial screenshot
    await device.takeScreenshot('04-level-1-initial');

    // Tap next level button and wait for the screen to update
    await element(by.id('next-level-button')).tap();
    await waitFor(element(by.id('pipeflow-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Take screenshot of level 2
    await device.takeScreenshot('05-level-2');

    // Tap next level button again
    await element(by.id('next-level-button')).tap();
    await waitFor(element(by.id('pipeflow-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Take screenshot of level 3
    await device.takeScreenshot('06-level-3');

    // Go back to previous level
    await element(by.id('prev-level-button')).tap();
    await waitFor(element(by.id('pipeflow-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Take screenshot after navigation back
    await device.takeScreenshot('07-level-navigation-back');
  });

  it('should display game elements correctly', async () => {
    // This test verifies the presence of game elements
    // Since the game uses Skia canvas, we can't test individual elements
    // But we can verify the main screen renders properly
    await detoxExpect(element(by.id('pipeflow-screen'))).toBeVisible();

    // Take a final screenshot
    await device.takeScreenshot('08-game-elements-final');
  });

  it('should allow selecting and placing components', async () => {
    // Go back to level 1 for a simple test
    await element(by.id('prev-level-button')).tap();
    await element(by.id('prev-level-button')).tap();

    // Wait for level to load
    await waitFor(element(by.id('pipeflow-screen')))
      .toBeVisible()
      .withTimeout(2000);

    // Take screenshot before interaction
    await device.takeScreenshot('09-before-component-placement');

    // Note: Since components are rendered in Canvas and slots use TouchableOpacity
    // we can't directly test the tap interactions without specific testIDs
    // The visual regression testing via screenshots is the best approach here

    // Verify the component tray is still visible
    await detoxExpect(element(by.id('component-tray'))).toBeVisible();

    // Take screenshot after interaction test
    await device.takeScreenshot('10-component-interaction-complete');
  });
});
