/** macOS WebKit follows Safari's default: Option-Tab includes links. */
export const tabKey = (browserName: string) =>
  browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
