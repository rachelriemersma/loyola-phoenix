// TESTING MODE — safe to run in Expo Go.
// Before your EAS production build, swap these stubs for the real Firebase calls below.
//
// Real implementation (uncomment when building for production):
//
// import analytics from '@react-native-firebase/analytics';
// import crashlytics from '@react-native-firebase/crashlytics';
//
// export async function logScreenView(screenName: string): Promise<void> {
//   try { await analytics().logScreenView({ screen_name: screenName, screen_class: screenName }); } catch {}
// }
// export async function logArticleOpen(articleTitle: string): Promise<void> {
//   try { await analytics().logEvent('article_open', { title: articleTitle }); } catch {}
// }
// export function logError(error: Error, context?: string): void {
//   try { crashlytics().recordError(error, context); } catch {}
// }

export function logScreenView(_screenName: string): void {}
export function logArticleOpen(_articleTitle: string): void {}
export function logError(_error: Error, _context?: string): void {}
